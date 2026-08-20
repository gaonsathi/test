// ===== Kisan Sathi — section-only logic (v5, Crop Sathi split into its own lazy-loaded bundle) =====
// Guarded with element checks so nothing breaks if this section
// isn't on the page for any reason.
//
// NOTE FOR TEAMMATES: the Crop Sathi AI chat tool (crop-layout /
// #chatThread / etc.) used to live entirely in this file + kisan.html
// + kisan.css. It has been split out into kisan/crop/crop.html,
// kisan/crop/crop.css and kisan/crop/crop.js so that the rest of the
// site doesn't have to pay for its weight on every page load. This
// file now only handles: (1) switching between the 4 Kisan Sathi
// sub-section cards, and (2) fetching + injecting Crop Sathi's own
// files the first time someone opens that tab. If you're editing the
// crop chat tool itself, go to kisan/crop/ instead.

(function(){
  const kisanSection = document.getElementById('kisan');
  if(!kisanSection) return;

  // =========================================================
  //  1) SUB-SECTION SWITCHING (crop / weather / jamin / rate)
  // =========================================================
  const ksubGrid = document.getElementById('ksubGrid');
  const kisanHighlights = document.getElementById('kisanHighlights');
  const ksubCards = kisanSection.querySelectorAll('[data-ksub-open]');
  const ksubPanels = kisanSection.querySelectorAll('.ksub-panel');

  function openKsub(id){
    ksubGrid.classList.add('hide');
    if(kisanHighlights) kisanHighlights.classList.add('hide');
    ksubPanels.forEach(p => p.classList.toggle('active', p.dataset.ksubPanel === id));
    // Scroll #kisan to sit just below the sticky site header — computed
    // directly (rather than relying only on CSS scroll-margin-top) so it
    // stays correct even right after a layout change like the mobile
    // nav drawer closing or the grid/highlights just being hidden above.
    const headerEl = document.querySelector('header');
    const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const target = kisanSection.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top: Math.max(target, 0), behavior:'smooth' });

    // Crop Sathi's own HTML/CSS/JS are heavy (AI chat, speech, camera,
    // geolocation weather) and aren't in the page yet — fetch them in
    // now that the visitor has actually asked for this tab.
    if(id === 'crop') loadCropSathi();
    if(id === 'rate') loadRateSathi();
  }
  function closeKsub(){
    ksubPanels.forEach(p => p.classList.remove('active'));
    ksubGrid.classList.remove('hide');
    if(kisanHighlights) kisanHighlights.classList.remove('hide');
  }

  // ---- keep the open sub-tab in the URL (#kisan/crop, #kisan/rate...) ----
  // Without this, opening Crop Sathi never touched the URL, so the
  // browser's Back button skipped straight past Kisan Sathi entirely
  // (to whatever page/section came before it) instead of first closing
  // the Crop Sathi panel — and it left the panel marked "active"
  // underneath, so coming back to Kisan Sathi later could land you
  // straight back inside it unexpectedly.
  let openingFromHash = false; // guards against the hashchange loop below

  function openKsubAndPush(id){
    if(location.hash !== '#kisan/' + id) location.hash = 'kisan/' + id;
    else openKsub(id); // hash already matches (e.g. same tab clicked twice)
  }
  function closeKsubAndPop(){
    if(location.hash !== '#kisan') location.hash = 'kisan';
    else closeKsub();
  }

  window.addEventListener('hashchange', ()=>{
    if(openingFromHash) return;
    const parts = location.hash.slice(1).split('/'); // ["kisan", "crop"?]
    if(parts[0] !== 'kisan') return; // another section — not ours to handle
    openingFromHash = true;
    if(parts[1]) openKsub(parts[1]); else closeKsub();
    openingFromHash = false;
  });

  ksubCards.forEach(card=>{
    card.addEventListener('click', ()=> openKsubAndPush(card.dataset.ksubOpen));
  });
  // Delegated (not bound-once) so it also works on [data-ksub-back]
  // buttons that don't exist yet at page load — like the desktop
  // sidebar's ".cs-back" button, which only appears once crop.html
  // is lazy-loaded in. A direct .addEventListener() pass here would
  // miss it entirely.
  kisanSection.addEventListener('click', (e)=>{
    if(e.target.closest('[data-ksub-back]')) closeKsubAndPop();
  });

  // If the page was loaded (or refreshed) directly on a link like
  // "#kisan/crop", open straight into that tab instead of the grid —
  // hashchange only fires on *changes*, not on the initial load.
  (function openInitialSubFromHash(){
    const parts = location.hash.slice(1).split('/');
    if(parts[0] === 'kisan' && parts[1]) openKsub(parts[1]);
  })();

  // =========================================================
  //  2) CROP SATHI — lazy loader
  //     Fetches kisan/crop/crop.html and injects it into
  //     #cropLayoutMount, adds kisan/crop/crop.css as a <link>, then
  //     adds kisan/crop/crop.js as a <script> (which finds the
  //     just-injected markup and wires everything up). Cached in
  //     cropLoadPromise so a second visit to this tab is instant and
  //     nothing is fetched or run twice.
  // =========================================================
  let cropLoadPromise = null;

  function loadCropSathi(){
    if(cropLoadPromise) return cropLoadPromise;
    const mount = document.getElementById('cropLayoutMount');

    cropLoadPromise = fetch('kisan/crop/crop.html')
      .then(res => {
        if(!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(html => {
        if(mount) mount.innerHTML = html;

        // fx.js runs the Hindi/English translation pass once, on the
        // original page load — this markup just arrived, so it still
        // needs that same pass applied to it if English is active.
        if(typeof window.gsSetLanguage === 'function'){
          window.gsSetLanguage(document.documentElement.lang === 'en' ? 'en' : 'hi');
        }

        if(!document.getElementById('cropCssLink')){
          const link = document.createElement('link');
          link.id = 'cropCssLink';
          link.rel = 'stylesheet';
          link.href = 'kisan/crop/crop.css';
          document.head.appendChild(link);
        }

        // Load the script only after the HTML is in the DOM, since
        // crop.js looks up its elements (#chatThread etc.) as soon as
        // it runs.
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'kisan/crop/crop.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('kisan/crop/crop.js failed to load'));
          document.body.appendChild(script);
        });
      })
      .catch(err => {
        console.error('Crop Sathi failed to load:', err);
        if(mount){
          mount.innerHTML =
            '<div class="crop-loading" style="color:var(--brick)">' +
              '<span class="crop-loading-ic">⚠️</span>' +
              '<span data-en="Crop Sathi could not load. Please check your connection and try again.">' +
                'फसल साथी लोड नहीं हो सका। कृपया अपना इंटरनेट जांचें और दोबारा कोशिश करें।' +
              '</span>' +
            '</div>';
        }
        cropLoadPromise = null; // allow a retry the next time this tab is opened
      });

    return cropLoadPromise;
  }

  // =========================================================
  //  3) फसल भाव (CROP RATE) — lazy loader
  //     Same fetch → inject → link CSS → append script pattern as
  //     loadCropSathi() above, just pointed at kisan/rate/. Cached in
  //     rateLoadPromise so re-opening this tab doesn't re-fetch.
  // =========================================================
  let rateLoadPromise = null;

  function loadRateSathi(){
    if(rateLoadPromise) return rateLoadPromise;
    const mount = document.getElementById('rateLayoutMount');

    rateLoadPromise = fetch('kisan/rate/rate.html')
      .then(res => {
        if(!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(html => {
        if(mount) mount.innerHTML = html;

        if(typeof window.gsSetLanguage === 'function'){
          window.gsSetLanguage(document.documentElement.lang === 'en' ? 'en' : 'hi');
        }

        if(!document.getElementById('rateCssLink')){
          const link = document.createElement('link');
          link.id = 'rateCssLink';
          link.rel = 'stylesheet';
          link.href = 'kisan/rate/rate.css';
          document.head.appendChild(link);
        }

        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'kisan/rate/rate.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('kisan/rate/rate.js failed to load'));
          document.body.appendChild(script);
        });
      })
      .catch(err => {
        console.error('Crop Rate failed to load:', err);
        if(mount){
          mount.innerHTML =
            '<div class="crop-loading" style="color:var(--brick)">' +
              '<span class="crop-loading-ic">⚠️</span>' +
              '<span data-en="Crop Rate could not load. Please check your connection and try again.">' +
                'फसल भाव लोड नहीं हो सका। कृपया अपना इंटरनेट जांचें और दोबारा कोशिश करें।' +
              '</span>' +
            '</div>';
        }
        rateLoadPromise = null; // allow a retry the next time this tab is opened
      });

    return rateLoadPromise;
  }

})();
