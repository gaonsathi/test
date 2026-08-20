// ===== Pashu Sathi — section-only logic =====
// Mirrors kisan.js's sub-section switcher (data-ksub-open / .ksub-panel)
// but namespaced as psub-* for Pashu Sathi's 2 cards: AI Pashu Doctor
// and Pashu Bazar. Guarded with element checks so nothing breaks if
// this section isn't on the page for any reason.

(function(){
  const pashuSection = document.getElementById('pashu');
  if(!pashuSection) return;

  // =========================================================
  //  1) SUB-SECTION SWITCHING (doctor / bazar)
  // =========================================================
  const psubGrid = document.getElementById('psubGrid');
  const psubCards = pashuSection.querySelectorAll('[data-psub-open]');
  const psubPanels = pashuSection.querySelectorAll('.psub-panel');

  const psHero = pashuSection.querySelector('.ps-hero');

  function openPsub(id){
    if(psubGrid) psubGrid.classList.add('hide');
    psubPanels.forEach(p => p.classList.toggle('active', p.dataset.psubPanel === id));
    // Hide the cow-photo hero while inside Pashu Bazar so the bazar
    // list/back-button starts right at the top of the panel.
    if(psHero) psHero.classList.toggle('ps-hero-hidden', id === 'bazar');

    // Scroll #pashu to sit just below the sticky site header, same
    // approach as kisan.js's openKsub().
    const headerEl = document.querySelector('header');
    const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const target = pashuSection.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top: Math.max(target, 0), behavior:'smooth' });
  }
  function closePsub(){
    psubPanels.forEach(p => p.classList.remove('active'));
    if(psubGrid) psubGrid.classList.remove('hide');
    if(psHero) psHero.classList.remove('ps-hero-hidden');
  }
  psubCards.forEach(card=>{
    card.addEventListener('click', ()=> openPsub(card.dataset.psubOpen));
  });
  // Delegated so it also works for any back button added later.
  pashuSection.addEventListener('click', (e)=>{
    if(e.target.closest('[data-psub-back]')) closePsub();
  });

  // =========================================================
  //  2) PASHU BAZAR — animal-type filter chips
  // =========================================================
  const bazarChips = pashuSection.querySelectorAll('[data-bazar-filter]');
  const bazarItems = pashuSection.querySelectorAll('[data-bazar-item]');
  bazarChips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      bazarChips.forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.bazarFilter;
      bazarItems.forEach(item=>{
        item.style.display = (filter === 'all' || item.dataset.bazarItem === filter) ? '' : 'none';
      });
    });
  });

  // =========================================================
  //  3) PASHU BAZAR — "sell your animal" popup
  //     Same flow as before (category, photo upload, breed/age/milk/
  //     weight, price, location incl. geolocation, status, seller
  //     contact, and a REAL submit that builds an actual .bazar-card
  //     and prepends it to #bazarList, persisted in localStorage) —
  //     now opened/closed as a modal instead of sitting inline.
  // =========================================================
  const isEnglish = () => document.documentElement.lang === 'en';
  function escHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ---- modal open/close ----
  const sellFab = document.getElementById('bazarSellFab');
  const sellModal = document.getElementById('bazarSellModal');
  function openSellModal(){
    if(!sellModal) return;
    sellModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeSellModal(){
    if(!sellModal) return;
    sellModal.hidden = true;
    document.body.style.overflow = '';
  }
  if(sellFab) sellFab.addEventListener('click', openSellModal);
  if(sellModal){
    sellModal.addEventListener('click', (e)=>{
      if(e.target.closest('[data-modal-close]')) closeSellModal();
    });
  }
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && sellModal && !sellModal.hidden) closeSellModal();
  });

  const BAZAR_STORAGE_KEY = 'gsPashuBazarListings';
  function persistBazarListing(item){
    try{
      const raw = localStorage.getItem(BAZAR_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(item);
      // cap saved listings so this demo can't quietly fill up localStorage
      localStorage.setItem(BAZAR_STORAGE_KEY, JSON.stringify(list.slice(0, 30)));
    } catch(e) { /* storage disabled/full — the listing still shows this session */ }
  }

  const CAT_META = {
    cow:     { icon:'🐄', hi:'गाय',  en:'Cow',     color:'var(--green)', tint:'var(--green-light)' },
    buffalo: { icon:'🐃', hi:'भैंस', en:'Buffalo', color:'var(--sky)',   tint:'var(--sky-light)' },
  };
  const STATUS_META = {
    milking:  { hi:'दूध दे रही', en:'Milking',  cls:'' },
    dry:      { hi:'सूखी',      en:'Dry',       cls:'' },
    pregnant: { hi:'गाभिन',     en:'Pregnant',  cls:'preg' },
    healthy:  { hi:'स्वस्थ',    en:'Healthy',   cls:'' },
  };

  // ---- category + status chip selection ----
  const catChips    = pashuSection.querySelectorAll('#bazarCatChips .chip');
  const statusChips = pashuSection.querySelectorAll('#bazarStatusChips .chip');
  const milkField   = document.getElementById('bazarMilkField');
  const weightField = document.getElementById('bazarWeightField');
  let selectedCat = 'cow';
  let selectedStatus = 'milking';

  function updateCategoryFields(cat){
    const isMilkAnimal = (cat === 'cow' || cat === 'buffalo');
    if(milkField)   milkField.style.display   = isMilkAnimal ? '' : 'none';
    if(weightField) weightField.style.display = isMilkAnimal ? 'none' : '';
    if(!isMilkAnimal && (selectedStatus === 'milking' || selectedStatus === 'dry')){
      selectedStatus = 'healthy';
      statusChips.forEach(c => c.classList.toggle('active', c.dataset.status === 'healthy'));
    }
  }
  catChips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      catChips.forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      selectedCat = chip.dataset.cat;
      updateCategoryFields(selectedCat);
    });
  });
  statusChips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      statusChips.forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      selectedStatus = chip.dataset.status;
    });
  });
  updateCategoryFields(selectedCat);

  // ---- photo upload: resized client-side (keeps localStorage light),
  //      shown as removable thumbnails, capped at 4 photos ----
  const photoInput = document.getElementById('bazarPhotoInput');
  const photoUploadWrap = document.getElementById('bazarPhotoUpload');
  let bazarPhotos = [];
  const MAX_PHOTOS = 4;

  function resizeImage(file){
    return new Promise((resolve, reject)=>{
      const reader = new FileReader();
      reader.onload = (e)=>{
        const img = new Image();
        img.onload = ()=>{
          const MAX_W = 720;
          const scale = Math.min(1, MAX_W / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderPhotoThumbs(){
    if(!photoUploadWrap) return;
    photoUploadWrap.querySelectorAll('.pbazar-photo-thumb').forEach(el => el.remove());
    const addTile = photoUploadWrap.querySelector('.pbazar-photo-add');
    bazarPhotos.forEach((src, i)=>{
      const thumb = document.createElement('div');
      thumb.className = 'pbazar-photo-thumb';
      thumb.innerHTML = `<img src="${src}" alt=""><button type="button" class="pbazar-photo-rm" data-photo-i="${i}" aria-label="हटाएं">×</button>`;
      photoUploadWrap.insertBefore(thumb, addTile);
    });
    if(addTile) addTile.style.display = bazarPhotos.length >= MAX_PHOTOS ? 'none' : '';
  }
  if(photoInput){
    photoInput.addEventListener('change', async ()=>{
      const files = Array.from(photoInput.files || []).slice(0, MAX_PHOTOS - bazarPhotos.length);
      for(const file of files){
        try{ bazarPhotos.push(await resizeImage(file)); } catch(e){ /* skip unreadable file */ }
      }
      photoInput.value = '';
      renderPhotoThumbs();
    });
  }
  if(photoUploadWrap){
    photoUploadWrap.addEventListener('click', (e)=>{
      const rm = e.target.closest('[data-photo-i]');
      if(!rm) return;
      bazarPhotos.splice(Number(rm.dataset.photoI), 1);
      renderPhotoThumbs();
    });
  }

  // ---- "use my current location" (reverse-geocodes to a readable
  //      village/district string, same pattern as kaam.js's post form) ----
  const locBtn = document.getElementById('bazarLocBtn');
  const locBtnText = document.getElementById('bazarLocBtnText');
  const locIc = document.getElementById('bazarLocIc');
  const locStatus = document.getElementById('bazarLocStatus');
  const locInput = document.getElementById('bazarLoc');

  function setBazarLocStatus(msg, kind){
    if(!locStatus) return;
    if(!msg){ locStatus.hidden = true; locStatus.textContent = ''; return; }
    locStatus.hidden = false;
    locStatus.textContent = msg;
    locStatus.className = 'loc-status' + (kind ? ` loc-status-${kind}` : '');
  }
  function setBazarLocBtnLoading(loading){
    if(!locBtn) return;
    locBtn.disabled = loading;
    locBtn.classList.toggle('loc-loading', loading);
  }
  if(locBtn){
    locBtn.addEventListener('click', ()=>{
      const lang = isEnglish() ? 'en' : 'hi';
      if(!navigator.geolocation){
        setBazarLocStatus(lang==='en' ? '⚠️ Location is not supported on this device — please type it below.' : '⚠️ इस डिवाइस पर लोकेशन उपलब्ध नहीं — कृपया नीचे खुद लिखें।', 'error');
        return;
      }
      setBazarLocBtnLoading(true);
      setBazarLocStatus(lang==='en' ? 'Finding your location…' : 'लोकेशन खोजी जा रही है…', 'loading');
      navigator.geolocation.getCurrentPosition(
        async (pos)=>{
          try{
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`, { headers:{ 'Accept-Language': lang } });
            const data = await res.json();
            const a = data.address || {};
            const place = a.village || a.town || a.suburb || a.city || a.county || '';
            const district = a.state_district || a.county || '';
            const state = a.state || '';
            const readable = [place, district !== place ? district : '', state].filter(Boolean).join(', ');
            if(locInput) locInput.value = readable || data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setBazarLocStatus(lang==='en' ? '✅ Location added — edit it below if needed.' : '✅ लोकेशन जोड़ दी गई — ज़रूरत हो तो नीचे बदल लें।', 'success');
          } catch(err){
            setBazarLocStatus(lang==='en' ? '⚠️ Could not read the address — please type it below.' : '⚠️ पता नहीं पढ़ पाए — कृपया नीचे खुद लिखें।', 'error');
          } finally {
            setBazarLocBtnLoading(false);
          }
        },
        (err)=>{
          setBazarLocBtnLoading(false);
          let msg;
          if(err.code === err.PERMISSION_DENIED) msg = lang==='en' ? '⚠️ Location permission denied — please type your village below.' : '⚠️ आपने लोकेशन की अनुमति नहीं दी — कृपया नीचे गाँव खुद लिखें।';
          else if(err.code === err.TIMEOUT) msg = lang==='en' ? '⚠️ Took too long to find location — please type your village below.' : '⚠️ लोकेशन खोजने में ज़्यादा समय लग गया — कृपया नीचे गाँव खुद लिखें।';
          else msg = lang==='en' ? '⚠️ Could not get location — please type your village below.' : '⚠️ लोकेशन नहीं मिल पाई — कृपया नीचे गाँव खुद लिखें।';
          setBazarLocStatus(msg, 'error');
        },
        { enableHighAccuracy:true, timeout:10000, maximumAge:60000 }
      );
    });
  }

  // ---- build a real listing card (same markup as the pre-seeded
  //      demo cards) from a submitted/persisted item ----
  function buildBazarCard(item){
    const meta = CAT_META[item.cat] || CAT_META.cow;
    const statusMeta = STATUS_META[item.status] || STATUS_META.healthy;
    const en = isEnglish();
    const hasPhotos = item.photos && item.photos.length;
    const photoInner = hasPhotos
      ? `<img src="${item.photos[0]}" alt="">` + (item.photos.length > 1 ? `<span class="bazar-photo-count">📷 ${item.photos.length}</span>` : '')
      : meta.icon;
    const distLabel = en ? 'Just posted' : 'अभी-अभी पोस्ट हुआ';
    const initials = (item.sellerName || '?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();

    const statsBits = [];
    if(item.age) statsBits.push(`<span>🎂 ${escHtml(item.age)}</span>`);
    if(item.milk) statsBits.push(`<span>🥛 ${escHtml(item.milk)} L/${en?'day':'दिन'}</span>`);
    if(item.weight) statsBits.push(`<span>⚖️ ${escHtml(item.weight)} kg</span>`);
    statsBits.push(`<span class="bazar-status ${statusMeta.cls}">${en?statusMeta.en:statusMeta.hi}</span>`);

    const phoneDigits = (item.sellerPhone || '').replace(/\D/g,'');
    const waHref = phoneDigits ? `https://wa.me/91${phoneDigits}` : '';
    const callHref = phoneDigits ? `tel:+91${phoneDigits}` : '';

    const el = document.createElement('div');
    el.className = 'bazar-card reveal in';
    el.dataset.bazarItem = item.cat;
    el.style.setProperty('--bz-color', meta.color);
    el.style.setProperty('--bz-tint', meta.tint);
    el.innerHTML = `
      <div class="bazar-photo${hasPhotos ? ' has-photo' : ''}">${photoInner}<span class="bazar-dist">${distLabel}</span></div>
      <div class="bazar-body">
        <span class="tag" style="--tag-bg:${meta.tint};color:${meta.color};">${en?meta.en:meta.hi}</span>
        <h4>${escHtml(item.title)}</h4>
        <div class="bazar-stats">${statsBits.join('')}</div>
        <div class="bazar-seller">
          <span class="bazar-avatar">${escHtml(initials)}</span>
          <span>${escHtml(item.sellerName)}${item.sellerName ? ' · ' : ''}${en?'New':'नया'}</span>
        </div>
      </div>
      <div class="bazar-side">
        <p class="price">₹${escHtml(item.price)}</p>
        <p class="bazar-loc">${escHtml(item.location)}</p>
        <div class="bazar-actions">
          <a class="bazar-act wa" title="WhatsApp"${waHref ? ` href="${waHref}" target="_blank" rel="noopener"` : ''}>💬 WhatsApp</a>
          <a class="bazar-act call" title="Call"${callHref ? ` href="${callHref}"` : ''}>📞 ${en?'Call':'कॉल करें'}</a>
        </div>
      </div>`;
    return el;
  }

  // ---- real submit: validate → build card → show it → persist it ----
  const sellBtn = document.getElementById('bazarSellBtn');
  if(sellBtn){
    sellBtn.addEventListener('click', ()=>{
      const lang = isEnglish() ? 'en' : 'hi';
      const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

      const breed = get('bazarBreed'), age = get('bazarAge'), milk = get('bazarMilk'),
            weight = get('bazarWeight'), price = get('bazarPrice'), location = get('bazarLoc'),
            sellerName = get('bazarSellerName'), sellerPhone = get('bazarSellerPhone'), info = get('bazarSellInfo');

      const resp = document.getElementById('bazarSellResp');
      const phoneOk = /^[6-9]\d{9}$/.test(sellerPhone);

      if(!price || !location || !sellerName || !phoneOk){
        if(resp){
          resp.style.display = 'block';
          resp.style.background = 'var(--pink-light)';
          resp.style.color = 'var(--pink)';
          resp.textContent = lang === 'en'
            ? '⚠️ Please fill price, village, your name and a valid 10-digit phone number.'
            : '⚠️ कृपया कीमत, गाँव, अपना नाम और सही 10 अंकों का फ़ोन नंबर भरें।';
        }
        return;
      }

      const meta = CAT_META[selectedCat];
      const title = breed ? (breed + (age ? ` (${age})` : '')) : (lang === 'en' ? meta.en : meta.hi);

      const item = {
        cat: selectedCat, status: selectedStatus, breed, age, milk, weight, price, location,
        sellerName, sellerPhone, info, photos: bazarPhotos.slice(), title, postedAt: Date.now(),
      };

      const card = buildBazarCard(item);
      const bazarList = document.getElementById('bazarList');
      if(bazarList) bazarList.prepend(card);
      persistBazarListing(item);

      // respect whichever filter chip is currently active
      const activeFilterChip = pashuSection.querySelector('#bazarChips .chip.active');
      if(activeFilterChip && activeFilterChip.dataset.bazarFilter !== 'all' && activeFilterChip.dataset.bazarFilter !== selectedCat){
        card.style.display = 'none';
      }

      // reset the form for the next listing
      ['bazarBreed','bazarAge','bazarMilk','bazarWeight','bazarPrice','bazarLoc','bazarSellerName','bazarSellerPhone','bazarSellInfo'].forEach(id=>{
        const elx = document.getElementById(id);
        if(elx) elx.value = '';
      });
      bazarPhotos = [];
      renderPhotoThumbs();
      setBazarLocStatus('');

      if(resp){
        resp.style.display = 'block';
        resp.style.background = 'var(--cream2)';
        resp.style.color = 'var(--saffron-dark)';
        resp.textContent = lang === 'en'
          ? 'Thank you! Your listing is live — buyers can now reach out to you. 🐄'
          : 'धन्यवाद! आपकी लिस्टिंग चालू हो गई है — खरीदार अब आपसे संपर्क कर सकते हैं। 🐄';
      }
    });
  }

  // ---- load any listings this visitor posted earlier (persisted) ----
  (function loadPersistedBazarListings(){
    try{
      const raw = localStorage.getItem(BAZAR_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const bazarList = document.getElementById('bazarList');
      if(!bazarList || !list.length) return;
      // stored newest-first; reverse so the prepend loop below ends
      // with the newest listing on top, matching storage order
      list.slice().reverse().forEach(item => bazarList.prepend(buildBazarCard(item)));
    } catch(e) { /* corrupt/blocked storage — just skip restoring */ }
  })();

  // =========================================================
  //  4) PASHU BAZAR — quick contact buttons (WhatsApp/Call/Chat)
  //     Cards from real submissions now carry working wa.me/tel:
  //     links (built above) — let those navigate normally. Demo
  //     cards and the "Chat" button still have no real destination,
  //     so they keep the small confirming checkmark nudge instead
  //     of doing nothing on click.
  // =========================================================
  pashuSection.addEventListener('click', (e)=>{
    const actBtn = e.target.closest('.bazar-act');
    if(!actBtn) return;
    const hasRealLink = actBtn.tagName === 'A' && actBtn.getAttribute('href');
    if(hasRealLink) return; // let the wa.me / tel: link actually work
    e.preventDefault();
    const original = actBtn.textContent;
    actBtn.textContent = '✓';
    setTimeout(()=>{ actBtn.textContent = original; }, 1200);
  });

})();
