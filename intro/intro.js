/* GAON SATHI — reliable full-screen premium curtain intro
   ======================================================================
   उद्घाटन ताला (Inauguration Lock)
   ----------------------------------------------------------------------
   By default the curtain now stays CLOSED for every visitor — no
   auto-open timer. It only opens when someone arrives with the secret
   link in the URL (?vp=THE_SECRET_KEY), which in practice means: that
   link is turned into a QR code (see admin/inaugurate.html) and "VP
   sir" scans it with his phone at the event. The moment that happens:
     1) this page asks the server to verify the key
     2) if correct, the server marks the site "inaugurated" for
        EVERYONE from now on (see server/server.js)
     3) the curtain plays its full grand-opening animation right there
        on his phone
   Every visitor after that just sees the open site — the ceremony is
   one-time, not a login every visitor has to do.
   If the backend server isn't running (e.g. this is being opened as a
   plain static file), the lock fails OPEN so the page still works —
   see the try/catch around the status fetch below.
   ====================================================================== */
(function () {
  'use strict';

  const UNLOCK_PARAM = 'vp';
  const STATUS_URL = '/api/inaugurate/status';
  const VERIFY_URL = '/api/inaugurate/verify';
  const UNLOCK_URL = '/api/inaugurate/unlock';
  const CURTAIN_WS_PATH = '/curtain';
  const POLL_MS = 4000; // fallback if WebSocket is blocked on some network

  function injectCSS(){
    if(document.querySelector('link[data-gs-intro]')) return;
    const l=document.createElement('link');
    l.rel='stylesheet'; l.href='intro/intro.css'; l.dataset.gsIntro='1';
    document.head.appendChild(l);
  }
  function build(){
    const o=document.createElement('div');
    o.className='gs-curtain-overlay';
    o.innerHTML=`
      <div class="gs-curtain left"></div>
      <div class="gs-curtain right"></div>
      <div class="gs-tie left"></div><div class="gs-tie right"></div>
      <div class="gs-light-burst"></div>
      <div class="gs-brand-layer" aria-hidden="true">
        <div class="gs-brand-topleft">
          <div class="gs-jnv-logo"><img src="https://pbs.twimg.com/profile_images/1244334522092515328/59Ob5R7q_400x400.jpg" alt="Jawahar Navodaya Vidyalaya Samiti logo" loading="eager"></div>
        </div>

        <div class="gs-brand-topright">
          <div class="gs-pmshree-logo"><img src="https://www.uxdt.nic.in/wp-content/uploads/2025/04/auto-draft-inner-banner.jpg" alt="PM SHRI School logo" loading="eager"></div>
        </div>

        <div class="gs-brand-center">
          <b class="gs-brand-premium">PM SHRI<br>JAWAHAR NAVODAYA VIDYALAYA<br>SIWAN</b>
        </div>

        <div class="gs-brand-left">
          <span class="gs-dev-label" data-en="Developed By">Developed By</span>
          <b class="gs-brand-premium gs-dev-names">Ashutosh &amp; Keshav</b>
        </div>
      </div>
    `;
    o._curtain = makeCurtain(o);
    return o;
  }

  /* ======================================================================
     NATURAL CURTAIN ENGINE
     ----------------------------------------------------------------------
     Each half of the curtain is a row of pleats (flat velvet strips)
     joined at hinges, like a real stage curtain:

       • Opening = the pleats fold up accordion-style (rotateY), so the
         fabric GATHERS toward the wall instead of sliding like a door.
       • The fold wave starts at the leading edge (where it is "pulled")
         and travels outward to the wall — slow start, heavy middle,
         soft settle.
       • The hem lags behind the motion and swings back on a damped
         spring (skewX from the top rail), so it moves like weight.
       • Pleat shading is driven by the real fold angle, so ridges and
         valleys deepen as the fabric bunches up.
       • Finally the gathered stack is drawn off into the wings.
     Pure transforms + opacity → GPU friendly, 60fps on phones.
     ====================================================================== */
  const PULL_MS = 8200;        // total curtain time (matches the CSS fade-out/confetti timing)
  const FOLD_SPREAD = 0.27;    // share of the timeline the fold wave takes to travel leading edge → wall
  const SWEEP_FROM = 0.36;     // when the gathered stack starts being drawn into the wings
  const SWAY_K = 5.5;          // hem-lag degrees per (half-screen-width / second)
  const SWAY_MAX = 1.7;        // max hem-lag degrees
  const RAD = Math.PI / 180;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const frac = n => n - Math.floor(n);
  const jit = (j, seed, k) => frac(Math.sin((j + 1) * 12.9898 + seed * 78.233 + k * 37.719) * 43758.5453) - 0.5;

  function bezier(x1, y1, x2, y2){
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = t => ((ax * t + bx) * t + cx) * t;
    const Y = t => ((ay * t + by) * t + cy) * t;
    return x => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 18; i++) { t = (lo + hi) / 2; X(t) < x ? lo = t : hi = t; }
      return Y(t);
    };
  }
  const easeFold  = bezier(.30, .30, .20, 1);
  const easeSweep = bezier(.45, 0, .35, 1);

  function makeCurtain(overlay){
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sides = [];
    [['left', 1], ['right', -1]].forEach(([name, dir], si) => {
      const el = overlay.querySelector('.gs-curtain.' + name);
      if (el) sides.push({ el, dir, seed: si * 5.37, strips: [], s: 0, cover: 0, sweep: 0, lead: 0 });
    });
    let halfW = 0, N = 0, u = 0, raf = 0;

    function buildSide(sd){
      sd.el.textContent = '';
      const mk = cls => { const d = document.createElement('div'); d.className = cls; return d; };
      sd.lining = mk('gs-lining');
      sd.edge = mk('gs-edge');
      sd.el.append(sd.lining, sd.edge);
      sd.strips = [];
      for (let j = 0; j < N; j++) {
        const sign = j % 2 ? -1 : 1;
        const el = mk('gs-pleat ' + (sign > 0 ? 'lit' : 'dim'));
        sd.el.appendChild(el);
        sd.strips.push({
          el, sign,
          rest: 15 + jit(j, sd.seed, 1) * 7,        // resting fold angle (organic, never uniform)
          max: 76 + jit(j, sd.seed, 2) * 8,         // fully gathered fold angle
          start: FOLD_SPREAD * (N - 1 - j) / (N - 1),
          k: 52 + (jit(j, sd.seed, 3) + .5) * 22,   // spring stiffness varies a little per pleat
          ang: 0, av: 0, c: null, th: 0
        });
      }
    }

    function layout(){
      halfW = (overlay.clientWidth || window.innerWidth) / 2;
      const cover = halfW + 3; // 3px overlap at the centre seam
      const n = clamp(Math.round(halfW / 52), 6, 18);
      sides.forEach(sd => {
        if (n !== N || !sd.strips.length) { N = n; buildSide(sd); }
        let sumCos = 0, stack = 0;
        sd.strips.forEach(p => { sumCos += Math.cos(p.rest * RAD); });
        sd.s = cover / sumCos;
        sd.strips.forEach(p => { p.el.style.width = sd.s + 'px'; stack += sd.s * Math.cos(p.max * RAD); });
        sd.cover = cover;
        sd.sweep = stack + 14;
        sd.lining.style.width = cover + 'px';
      });
    }

    function render(t, dt){
      sides.forEach(sd => {
        const sweep = sd.sweep * easeSweep(clamp((t - SWEEP_FROM) / (1 - SWEEP_FROM), 0, 1));
        let hinge = 0;
        sd.strips.forEach(p => {
          const q = easeFold(clamp((t - p.start) / (1 - FOLD_SPREAD), 0, 1));
          const th = p.rest + (p.max - p.rest) * q;
          const w = sd.s * Math.cos(th * RAD);
          p.th = th;
          p.nc = hinge - sweep + w / 2;   // centre of the folded pleat, px from the wall
          p.w = w;
          hinge += w;
        });
        sd.lead = hinge - sweep;

        // hem lag: per-pleat screen velocity, smoothed across neighbours so the hem stays continuous
        const vs = sd.strips.map(p => (dt > 0 && p.c !== null) ? sd.dir * (p.nc - p.c) / dt / halfW : 0);
        sd.strips.forEach((p, j) => {
          let sum = 0, cnt = 0;
          for (let i = j - 2; i <= j + 2; i++) if (vs[i] !== undefined) { sum += vs[i]; cnt++; }
          if (dt > 0) {
            const h = Math.min(dt, 0.034);
            const target = clamp(-(sum / cnt) * SWAY_K, -SWAY_MAX, SWAY_MAX);
            const acc = -p.k * (p.ang - target) - 7 * p.av;   // underdamped → a soft swing and settle
            p.av += acc * h;
            p.ang += p.av * h;
          }
          p.c = p.nc;
          const sin = Math.sin(p.th * RAD);
          const tx = sd.dir * (p.nc - sd.s / 2);
          p.el.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,0,0) rotateY(' + (sd.dir * p.sign * p.th).toFixed(2) + 'deg) skewX(' + p.ang.toFixed(3) + 'deg)';
          p.el.style.setProperty('--sh', ((p.sign > 0 ? .10 : .58) * sin).toFixed(3));
          p.el.style.setProperty('--hl', ((p.sign > 0 ? .38 : 0) * sin).toFixed(3));
        });

        sd.lining.style.transform = 'scaleX(' + clamp((sd.lead - 2) / sd.cover, 0, 1).toFixed(4) + ')';
        sd.edge.style.transform = 'translate3d(' + (sd.dir * (sd.lead - 2)).toFixed(2) + 'px,0,0)';
        sd.edge.style.opacity = clamp(sd.lead / 80, 0, 1).toFixed(3);
      });
    }

    layout();
    render(0, 0);
    window.addEventListener('resize', function onResize(){
      if (!overlay.isConnected) { window.removeEventListener('resize', onResize); return; }
      layout(); render(u, 0);
    });

    return {
      play(){
        if (reduce) { // no motion: a calm cross-fade instead
          sides.forEach(sd => { sd.el.style.transition = 'opacity .8s ease'; sd.el.style.opacity = '0'; });
          return;
        }
        let t0 = null, last = 0;
        const frame = now => {
          if (!overlay.isConnected) return;
          if (t0 === null) { t0 = last = now; }
          const dt = (now - last) / 1000; last = now;
          u = clamp((now - t0) / PULL_MS, 0, 1);
          render(u, dt);
          if (u < 1) raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      }
    };
  }

  function ensureHome(){
    const home=document.querySelector('#home');
    if(home){
      document.querySelectorAll('main section').forEach(s=>s.classList.toggle('active',s.id==='home'));
      document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.section==='home'));
      if(location.hash!=='#home') history.replaceState(null,'','#home');
      return true;
    }
    return false;
  }
  function celebrationBurst(){
    const c=document.createElement('div'); c.className='gs-celebration'; c.setAttribute('aria-hidden','true');
    const total=160, golden=0.6180339887;
    let html='';
    for(let i=0;i<total;i++){
      const isDot = i%3===0;
      const colorClass='c'+(1+(i%3));
      const x=((i*golden*100)%100).toFixed(2);
      const delay=((i*golden*2.6)%2.4).toFixed(2);
      const dur=(3.4+((i*9)%20)/10).toFixed(2);
      let w,h;
      if(isDot){ w=(6+(i*5)%6); h=w; }
      else { w=(6+(i*3)%5); h=(12+(i*7)%9); }
      const sway=((i%2===0?1:-1)*(30+(i*17)%50)).toFixed(0);
      const cls=[isDot?'dot':'strip', colorClass].join(' ');
      html += `<i class="${cls}" style="--x:${x}%;--w:${w}px;--h:${h}px;--d:${dur}s;--delay:${delay}s;--sway:${sway}px"></i>`;
    }
    c.innerHTML=html; document.body.appendChild(c);
    setTimeout(()=>c.remove(),6200);
  }

  // ---- helpers for the secret unlock link ----
  function getUnlockKeyFromURL(){
    try { return new URLSearchParams(location.search).get(UNLOCK_PARAM) || ''; }
    catch(e){ return ''; }
  }
  function stripUnlockParamFromURL(){
    try {
      const url = new URL(location.href);
      url.searchParams.delete(UNLOCK_PARAM);
      history.replaceState(null,'',url.pathname+(url.search||'')+url.hash);
    } catch(e){}
  }

  // ---- locked screen (curtain stays shut, no timer, nothing behind it loads visibly) ----
  function showLocked(overlay, badKey){
    overlay.classList.add('gs-locked');
    const msg=document.createElement('div');
    msg.className='gs-lock-msg';
    const lockIcon=document.createElement('div');
    lockIcon.className='gs-lock-icon';
    lockIcon.textContent='🔒';
    msg.appendChild(lockIcon);
    msg.innerHTML += `
      <b class="gs-lock-premium">Waiting For Our Respected Principal Sir</b>
      ${badKey ? '<em data-en="That code did not work">यह कोड सही नहीं है</em>' : ''}
    `;
    overlay.appendChild(msg);
  }

  // ---- VP sir's screen: QR checked out fine, waiting for HIS tap to actually cut the ribbon ----
  function showReadyToOpen(overlay, onTap){
    overlay.classList.add('gs-locked');
    const msg=document.createElement('div');
    msg.className='gs-lock-msg gs-ready-msg';
    const lockIcon=document.createElement('div');
    lockIcon.className='gs-lock-icon gs-ready-icon';
    lockIcon.textContent='🎉';
    msg.appendChild(lockIcon);
    msg.innerHTML += `
      <b data-en="Ready for the inauguration">उद्घाटन के लिए तैयार</b>
      <span data-en="Tap the button below to open the site for everyone">नीचे बटन दबाएँ — यह सबके लिए खुल जाएगा</span>
      <button type="button" class="gs-open-btn" data-en="Open">उद्घाटन करें</button>
    `;
    overlay.appendChild(msg);
    const btn = msg.querySelector('.gs-open-btn');
    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.textContent = 'खुल रहा है...';
      onTap(msg);
    }, { once:true });
  }

  // ---- real-time push: every locked visitor's curtain opens the instant
  // VP sir taps the button, no refresh needed. Uses a WebSocket for
  // instant delivery, plus a polling fallback in case some network
  // blocks WebSockets — whichever fires first wins, and it's guarded
  // so the opening animation only ever runs once. ----
  function listenForLiveUnlock(onUnlock){
    let done = false;
    let ws = null;
    let pollTimer = null;

    function finish(){
      if (done) return;
      done = true;
      if (pollTimer) clearInterval(pollTimer);
      if (ws) { try { ws.close(); } catch(e){} }
      onUnlock();
    }

    pollTimer = setInterval(async () => {
      try {
        const res = await fetch(STATUS_URL, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.unlocked) finish();
        }
      } catch(e){}
    }, POLL_MS);

    try {
      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(proto + '//' + location.host + CURTAIN_WS_PATH);
      ws.addEventListener('message', (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'unlocked' || (msg.type === 'status' && msg.unlocked)) finish();
        } catch(e){}
      });
      // if the socket itself fails, the poll above still catches it
      ws.addEventListener('error', () => {});
    } catch(e){ /* no WebSocket support in this browser — polling still works */ }
  }

  // ---- the existing full ribbon-cutting animation ----
  // Guarded so it only ever plays once per page, even if both the
  // WebSocket push and the polling fallback fire close together, or a
  // visitor's own tap and a live broadcast overlap. Also clears away
  // ANY leftover lock-message box immediately — previously that box
  // only got removed on VP sir's own device (his tap handler removed
  // it manually); every other visitor who opened via the live
  // broadcast kept seeing it linger on screen through the whole
  // curtain animation. Clearing it here fixes that for every path.
  let openingStarted = false;
  const VANISH_MS = 650; // premium text/logos disappear first, THEN the curtain opens
  function runGrandOpening(overlay){
    if (openingStarted) return;
    openingStarted = true;
    const leftoverMsg = overlay.querySelector('.gs-lock-msg');
    if (leftoverMsg) leftoverMsg.remove();
    const brandLayer = overlay.querySelector('.gs-brand-layer');
    const begin=()=>{
      if(!ensureHome()) return false;
      // Step 1: every premium text/logo (developer credit, JNV logo,
      // PM SHRI logo, school name) vanishes with its own animation first.
      if (brandLayer) brandLayer.classList.add('gs-vanish');
      const startCurtain = () => {
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          overlay.classList.add('is-opening');
          if (overlay._curtain) overlay._curtain.play();
          celebrationBurst();
        }));
      };
      if (brandLayer) setTimeout(startCurtain, VANISH_MS);
      else startCurtain();
      setTimeout(()=>{
        document.documentElement.classList.remove('gs-intro-lock');
        overlay.remove();
      }, 8600 + (brandLayer ? VANISH_MS : 0));
      return true;
    };
    if(!begin()){
      const timer=setInterval(()=>{ if(begin()) clearInterval(timer); },100);
      setTimeout(()=>clearInterval(timer),10000);
    }
  }

  // ---- already inaugurated earlier (by someone else) — just show the site, no ceremony replay ----
  function revealInstantly(overlay){
    document.documentElement.classList.remove('gs-intro-lock');
    overlay.remove();
    ensureHome();
  }

  async function start(){
    injectCSS();
    document.documentElement.classList.add('gs-intro-lock');
    const overlay=build();
    // Insert immediately so the curtain covers the navbar and entire page from frame 1.
    document.body.insertBefore(overlay,document.body.firstChild);

    let status={ unlocked:false };
    try{
      const res=await fetch(STATUS_URL,{cache:'no-store'});
      if(res.ok) status=await res.json();
    }catch(e){
      // No server reachable (static hosting / server not started) — don't trap
      // visitors behind a lock that can never open. Fail open instead.
      status={ unlocked:true };
    }

    if(status.unlocked){ revealInstantly(overlay); return; }

    // Not unlocked yet — start listening for the live "VP sir tapped it"
    // broadcast right away, so this visitor's curtain opens in real
    // time the moment the ribbon is cut, no refresh needed. This runs
    // regardless of which screen (locked / ready-to-open) ends up
    // showing below.
    listenForLiveUnlock(()=>runGrandOpening(overlay));

    const key=getUnlockKeyFromURL();
    if(key){
      // The QR link only gets VP sir to a "ready" screen with a button —
      // scanning it does NOT open the site by itself. Nothing happens
      // server-side until he actually taps the button.
      try{
        const vRes=await fetch(VERIFY_URL+'?key='+encodeURIComponent(key),{cache:'no-store'});
        const vData=vRes.ok ? await vRes.json() : {valid:false};
        stripUnlockParamFromURL();

        if(vData.unlocked){ revealInstantly(overlay); return; }

        if(vData.valid){
          showReadyToOpen(overlay, async (msgEl)=>{
            try{
              const uRes=await fetch(UNLOCK_URL,{
                method:'POST',
                headers:{'Content-Type':'application/json','x-inaugurate-key':key},
                body:JSON.stringify({key})
              });
              if(uRes.ok){ runGrandOpening(overlay); return; }
              msgEl.remove(); showLocked(overlay,true);
            }catch(e){ msgEl.remove(); showLocked(overlay,true); }
          });
          return;
        }

        showLocked(overlay,true);
        return;
      }catch(e){
        showLocked(overlay,false);
        return;
      }
    }

    showLocked(overlay,false);
  }

  if(document.body) start(); else document.addEventListener('DOMContentLoaded',start,{once:true});
})();
