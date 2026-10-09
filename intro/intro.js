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
      <div class="gs-curtain left"><div class="gs-curtain-bottom"></div></div>
      <div class="gs-curtain right"><div class="gs-curtain-bottom"></div></div>
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
    return o;
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
