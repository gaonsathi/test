  // ---- navigation ----
  const navBtns = document.querySelectorAll('.navbtn');
  const sections = document.querySelectorAll('main section');
  const hamburgerBtn = document.getElementById('hamburger');
  const mainnavEl = document.getElementById('mainnav');
  const navOverlay = document.getElementById('navOverlay');

  function setMenu(open){
    mainnavEl.classList.toggle('open', open);
    hamburgerBtn.classList.toggle('open', open);
    navOverlay.classList.toggle('open', open);
    hamburgerBtn.setAttribute('aria-expanded', open);
  }

  function showSection(id){
    sections.forEach(s=>s.classList.toggle('active', s.id===id));
    navBtns.forEach(b=>b.classList.toggle('active', b.dataset.section===id));
    setMenu(false);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  // ---- URL hash routing ----
  // Keeps the open section in the URL (#kisan, #pashu, ...) so that:
  //  1) refreshing the page reopens the same section instead of
  //     always resetting to home, and
  //  2) the browser's Back/Forward buttons move between the sections
  //     the user actually visited, instead of leaving the site.
  // All in-page navigation (nav buttons, data-goto links, quick chips,
  // hero search) should call goToSection() instead of showSection()
  // directly, so every entry point stays in sync with the URL.
  // NOTE: a section is free to use a deeper hash like "#kisan/crop"
  // for its own internal sub-tabs (see kisan/kisan.js) — applyHash()
  // only looks at the part before the "/" to decide which top-level
  // section to show, and leaves the rest for that section's own script
  // to read.
  const validSectionIds = new Set(Array.from(sections).map(s=>s.id));

  function applyHash(){
    const id = location.hash.slice(1).split('/')[0];
    showSection(validSectionIds.has(id) ? id : 'home');
  }

  function goToSection(id){
    if(!validSectionIds.has(id)) id = 'home';
    if(location.hash === '#'+id){
      // same section requested again (e.g. same hash on reload path) —
      // hashchange won't fire on its own, so just show it directly
      showSection(id);
    } else {
      location.hash = id;
    }
  }
  window.goToSection = goToSection;

  window.addEventListener('hashchange', applyHash);
  applyHash();
  navBtns.forEach(b=>b.addEventListener('click',()=>goToSection(b.dataset.section)));
  document.querySelectorAll('[data-goto]').forEach(el=>{
    el.addEventListener('click',()=>goToSection(el.dataset.goto));
  });
  hamburgerBtn.addEventListener('click',()=>setMenu(!mainnavEl.classList.contains('open')));
  navOverlay.addEventListener('click',()=>setMenu(false));
  document.addEventListener('click',(e)=>{
    if(!mainnavEl.classList.contains('open')) return;
    if(mainnavEl.contains(e.target) || hamburgerBtn.contains(e.target)) return;
    setMenu(false);
  });

  // stop scroll/swipe gestures that start on the nav itself from reaching
  // the page (so they can't trigger the close-on-scroll listener below)
  function blockIfNotInternallyScrollable(e){
    const scrollable = mainnavEl.scrollHeight > mainnavEl.clientHeight;
    if(!scrollable) e.preventDefault();
  }
  mainnavEl.addEventListener('touchmove', blockIfNotInternallyScrollable, {passive:false});
  mainnavEl.addEventListener('wheel', blockIfNotInternallyScrollable, {passive:false});

  window.addEventListener('scroll',()=>{
    if(mainnavEl.classList.contains('open')) setMenu(false);
  },{passive:true});

  // ---- stat counters ----
  const statEls = document.querySelectorAll('[data-count]');
  const statObserver = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el = e.target;
        const target = parseInt(el.dataset.count);
        let cur = 0;
        const step = Math.max(1, Math.round(target/60));
        const timer = setInterval(()=>{
          cur += step;
          if(cur>=target){cur=target;clearInterval(timer);}
          el.textContent = cur.toLocaleString('en-IN');
        },20);
        statObserver.unobserve(el);
      }
    });
  },{threshold:0.4});
  statEls.forEach(el=>statObserver.observe(el));

  // ---- reveal on scroll ----
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  },{threshold:0.2});
  revealEls.forEach(el=>revealObserver.observe(el));

  // ---- kisan mandi bhav ----
  const mandi = [
    {name:"गेहूं", nameEn:"Wheat", price:"₹2,250/क्विंटल", priceEn:"₹2,250/quintal", trend:"up"},
    {name:"धान", nameEn:"Rice", price:"₹2,040/क्विंटल", priceEn:"₹2,040/quintal", trend:"up"},
    {name:"प्याज", nameEn:"Onion", price:"₹1,800/क्विंटल", priceEn:"₹1,800/quintal", trend:"down"},
    {name:"सरसों", nameEn:"Mustard", price:"₹5,650/क्विंटल", priceEn:"₹5,650/quintal", trend:"up"},
  ];
  function renderMandi(){
    const list = document.getElementById('mandiList');
    if(!list) return;
    const en = document.documentElement.lang === 'en';
    list.innerHTML = mandi.map(m=>`
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--cream2);">
        <span>${en ? m.nameEn : m.name}</span>
        <span style="font-weight:700;color:${m.trend==='up'?'#2D6A4F':'#C1440E'};">${en ? m.priceEn : m.price} ${m.trend==='up'?'▲':'▼'}</span>
      </div>`).join('');
  }
  renderMandi();
  window.renderMandi = renderMandi;

  // ---- ask expert ----
  function askExpert(inputId, respId){
    const val = document.getElementById(inputId).value.trim();
    if(!val) return;
    const resp = document.getElementById(respId);
    resp.style.display = 'block';
    document.getElementById(inputId).value='';
  }

  // ---- yojna filter ----
  // Guarded with element checks so a missing/renamed yojna section
  // can't throw here and take down everything below it in this file
  // (community feed, home page search, live counter, back-to-top...).
  const yojnaSearchInput = document.getElementById('yojnaSearch');
  document.querySelectorAll('#yojnaChips .chip').forEach(chip=>{
    chip.addEventListener('click',()=>{
      document.querySelectorAll('#yojnaChips .chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      filterYojna();
    });
  });
  if(yojnaSearchInput) yojnaSearchInput.addEventListener('input', filterYojna);
  function filterYojna(){
    const activeChip = document.querySelector('#yojnaChips .chip.active');
    const searchEl = document.getElementById('yojnaSearch');
    if(!activeChip || !searchEl) return;
    const tag = activeChip.dataset.tag;
    const q = searchEl.value.toLowerCase();
    document.querySelectorAll('#yojnaList .item-card').forEach(card=>{
      const tags = card.dataset.tag;
      const text = card.textContent.toLowerCase();
      const tagMatch = tag==='all' || tags.includes(tag);
      const textMatch = text.includes(q);
      card.style.display = (tagMatch && textMatch) ? 'flex' : 'none';
    });
  }

  // ---- community feed ----
  const feed = document.getElementById('postFeed');
  const initialPosts = [
    {name:"अनिल कुमार", place:"पूर्णिया", text:"इस साल धान की फसल कब लगाना ठीक रहेगा? किसी भाई ने शुरू किया?", textEn:"When is the right time to plant rice this year? Has anyone started?"},
    {name:"पूजा कुमारी", place:"कटिहार", text:"मुझे सिलाई सीख कर अब अपना काम मिल गया है, गाँव साथी का धन्यवाद 🙏", textEn:"I learned tailoring and now have my own work, thank you Gaon Sathi 🙏"},
  ];
  function renderFeed(){
    if(!feed) return;
    const en = document.documentElement.lang === 'en';
    feed.innerHTML = initialPosts.map(p=>`
      <div class="card reveal in" style="margin-bottom:14px;">
        <div style="display:flex;gap:10px;align-items:center;">
          <div class="avatar" style="background:var(--pink);">${p.name[0]}</div>
          <div><b>${p.name}</b><br><span class="eng" style="font-size:12px;color:var(--ink-soft);">${p.place}</span></div>
        </div>
        <p style="margin-top:10px;">${en ? (p.textEn||p.text) : p.text}</p>
        <div style="margin-top:10px;color:var(--ink-soft);font-size:14px;">❤️ <span>${en?'Like':'पसंद'}</span> &nbsp; 💬 <span>${en?'Reply':'जवाब दें'}</span></div>
      </div>`).join('');
  }
  renderFeed();
  window.renderFeed = renderFeed;
  function addPost(){
    const val = document.getElementById('postText').value.trim();
    if(!val) return;
    const en = document.documentElement.lang === 'en';
    initialPosts.unshift({name: en ? "You" : "आप", place: en ? "Your village" : "आपका गाँव", text: val, textEn: val});
    renderFeed();
    document.getElementById('postText').value='';
  }

  // ==================================================================
  //  HOME PAGE — interactive extras
  //  (smart search, quick chips, live counter, back-to-top).
  //  All guarded with element checks so nothing breaks
  //   if a teammate edits/removes a piece of home.html.
  // ==================================================================

  // ---- smart search: keyword -> section ----
  const SEARCH_MAP = [
    {keys:['भाव','मंडी','गेहूं','धान','फसल','किसान','मौसम'], section:'kisan'},
    {keys:['नौकरी','काम','जॉब','रोज़गार','मजदूरी'], section:'kaam'},
    {keys:['पशु','गाय','भैंस','बकरी','डॉक्टर','टीका'], section:'pashu'},
    {keys:['योजना','सरकारी','बीमा','सब्सिडी','पेंशन'], section:'yojna'},
    {keys:['सवाल','समुदाय','पोस्ट','बात'], section:'community'},
  ];
  function heroSearchGo(){
    const input = document.getElementById('heroSearchInput');
    if(!input) return;
    const q = input.value.trim().toLowerCase();
    if(!q) return;
    let match = SEARCH_MAP.find(m => m.keys.some(k => q.includes(k)));
    if(match){
      goToSection(match.section);
    } else {
      // no direct match: fall back to community so they can ask
      goToSection('community');
    }
    input.value = '';
  }
  const heroInput = document.getElementById('heroSearchInput');
  if(heroInput){
    heroInput.addEventListener('keydown', e => { if(e.key === 'Enter') heroSearchGo(); });
  }
  document.querySelectorAll('.qchip').forEach(chip=>{
    chip.addEventListener('click', ()=> goToSection(chip.dataset.goto));
  });

  // ---- live "people online" counter (adds life to the page) ----
  const liveCountEl = document.getElementById('liveCount');
  if(liveCountEl){
    let count = parseInt(liveCountEl.textContent.replace(/,/g,'')) || 1284;
    setInterval(()=>{
      count += Math.floor(Math.random()*7) - 2; // small realistic wobble
      if(count < 900) count = 900;
      liveCountEl.textContent = count.toLocaleString('en-IN');
    }, 3500);
  }

  // ---- back to top ----
  const backToTopBtn = document.getElementById('backToTop');
  if(backToTopBtn){
    window.addEventListener('scroll', ()=>{
      backToTopBtn.classList.toggle('show', window.scrollY > 400);
    });
    backToTopBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
  }

  // ---- small "pop" feedback when tapping a hut or explore card ----
  document.querySelectorAll('.hut, .explore-card').forEach(el=>{
    el.addEventListener('click', ()=>{
      el.style.transform = 'scale(.92)';
      setTimeout(()=>{ el.style.transform=''; }, 150);
    });
  });
