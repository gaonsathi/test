// ===================================================================
//  फसल भाव (CROP RATE) — mandi price (live) + MSP (govt floor).
//  LAZY-LOADED by kisan/kisan.js only the first time a visitor opens
//  the "rate" sub-section, after rate.html has been injected into
//  #rateLayoutMount. Same split-out pattern as kisan/crop/crop.js.
// ===================================================================

(function(){
  function isEn(){ return document.documentElement.lang === 'en'; }

  // Guard: only run if rate.html's markup is actually in the DOM.
  const shellGuard = document.getElementById('rateShell');
  if(!shellGuard) return;

  // Same local proxy crop.js and weather.js use — keeps any real
  // data.gov.in key on the server, never in browser code.
  const AI_PROXY_BASE = (window.GAON_SATHI_API_BASE || "").replace(/\/$/, "");

  function escapeHtml(str){
    if(!str) return '';
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // =========================================================
  //  1) TABS — "आज का मंडी भाव" vs "सरकारी MSP"
  // =========================================================
  const rateTabs = document.querySelectorAll('[data-rate-tab]');
  const ratePanels = document.querySelectorAll('[data-rate-panel]');
  rateTabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      const id = tab.dataset.rateTab;
      rateTabs.forEach(t=>{ t.classList.toggle('active', t === tab); t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); });
      ratePanels.forEach(p=> p.classList.toggle('active', p.dataset.ratePanel === id));
      if(id === 'msp') loadMsp();
    });
  });

  // =========================================================
  //  2) MANDI PRICE — states + common crops list, matching the
  //     exact spelling AGMARKNET/data.gov.in uses for filtering
  //     (filters[state.keyword] / filters[commodity.keyword] need an
  //     exact match, not a fuzzy search).
  // =========================================================
  const STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Delhi',
    'Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka',
    'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha',
    'Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
    'Uttarakhand','West Bengal'
  ];
  const STATE_LABELS_HI = {
    'Andhra Pradesh':'आंध्र प्रदेश','Arunachal Pradesh':'अरुणाचल प्रदेश','Assam':'असम','Bihar':'बिहार',
    'Chandigarh':'चंडीगढ़','Chhattisgarh':'छत्तीसगढ़','Delhi':'दिल्ली','Goa':'गोवा','Gujarat':'गुजरात',
    'Haryana':'हरियाणा','Himachal Pradesh':'हिमाचल प्रदेश','Jammu and Kashmir':'जम्मू और कश्मीर',
    'Jharkhand':'झारखंड','Karnataka':'कर्नाटक','Kerala':'केरल','Madhya Pradesh':'मध्य प्रदेश',
    'Maharashtra':'महाराष्ट्र','Manipur':'मणिपुर','Meghalaya':'मेघालय','Mizoram':'मिज़ोरम',
    'Nagaland':'नागालैंड','Odisha':'ओडिशा','Puducherry':'पुदुचेरी','Punjab':'पंजाब',
    'Rajasthan':'राजस्थान','Sikkim':'सिक्किम','Tamil Nadu':'तमिलनाडु','Telangana':'तेलंगाना',
    'Tripura':'त्रिपुरा','Uttar Pradesh':'उत्तर प्रदेश','Uttarakhand':'उत्तराखंड','West Bengal':'पश्चिम बंगाल'
  };
  // A wide-but-common set of AGMARKNET commodity names. Farmers growing
  // something not in this list can still switch to English and type
  // the exact AGMARKNET name if they know it — but this covers the
  // large majority of everyday searches.
  const COMMODITIES = [
    {en:'Wheat', hi:'गेहूं'}, {en:'Rice', hi:'चावल'}, {en:'Paddy(Dhan)(Common)', hi:'धान (सामान्य)'},
    {en:'Maize', hi:'मक्का'}, {en:'Bajra(Pearl Millet/Cumbu)', hi:'बाजरा'}, {en:'Jowar(Sorghum)', hi:'ज्वार'},
    {en:'Gram Raw(Chholia)', hi:'चना'}, {en:'Arhar (Tur/Red Gram)(Whole)', hi:'तूर/अरहर'},
    {en:'Moong(Green Gram)(Whole)', hi:'मूंग'}, {en:'Urad', hi:'उड़द'}, {en:'Masur Dal', hi:'मसूर'},
    {en:'Groundnut', hi:'मूंगफली'}, {en:'Mustard', hi:'सरसों'}, {en:'Soyabean', hi:'सोयाबीन'},
    {en:'Sunflower', hi:'सूरजमुखी'}, {en:'Sesamum(Sesame,Gingelly,Til)', hi:'तिल'},
    {en:'Cotton', hi:'कपास'}, {en:'Sugarcane', hi:'गन्ना'}, {en:'Potato', hi:'आलू'},
    {en:'Onion', hi:'प्याज़'}, {en:'Tomato', hi:'टमाटर'}, {en:'Brinjal', hi:'बैंगन'},
    {en:'Cauliflower', hi:'फूलगोभी'}, {en:'Cabbage', hi:'पत्ता गोभी'}, {en:'Green Chilli', hi:'हरी मिर्च'},
    {en:'Banana', hi:'केला'}, {en:'Mango', hi:'आम'}, {en:'Apple', hi:'सेब'}, {en:'Garlic', hi:'लहसुन'},
    {en:'Ginger(Green)', hi:'अदरक'}, {en:'Turmeric', hi:'हल्दी'}, {en:'Coriander(Leaves)', hi:'धनिया'}
  ];

  const mandiStateSelect = document.getElementById('mandiStateSelect');
  const mandiCommoditySelect = document.getElementById('mandiCommoditySelect');
  const mandiFilterForm = document.getElementById('mandiFilterForm');
  const mandiGoBtn = document.getElementById('mandiGoBtn');
  const mandiResults = document.getElementById('mandiResults');
  const mandiLocateBtn = document.getElementById('mandiLocateBtn');
  const mandiLocateStatus = document.getElementById('mandiLocateStatus');

  function fillSelects(){
    // Preserve whatever is already picked (if anything) across a
    // language switch, instead of resetting back to the default.
    const prevState = mandiStateSelect ? mandiStateSelect.value : '';
    const prevCommodity = mandiCommoditySelect ? mandiCommoditySelect.value : '';
    if(mandiStateSelect){
      mandiStateSelect.innerHTML = STATES.map(s =>
        `<option value="${escapeHtml(s)}">${escapeHtml(isEn() ? s : (STATE_LABELS_HI[s] || s))}</option>`
      ).join('');
      // Sensible default so the very first search always returns something
      mandiStateSelect.value = prevState || 'Uttar Pradesh';
    }
    if(mandiCommoditySelect){
      mandiCommoditySelect.innerHTML = COMMODITIES.map(c =>
        `<option value="${escapeHtml(c.en)}">${escapeHtml(isEn() ? c.en.replace(/\(.*?\)/g,'').trim() : c.hi)}</option>`
      ).join('');
      if(prevCommodity) mandiCommoditySelect.value = prevCommodity;
    }
  }
  fillSelects();

  function setMandiBusy(busy){
    if(mandiGoBtn) mandiGoBtn.disabled = busy;
  }

  // Cache of the last successful search, so a language switch (see
  // window.renderMandi below) can redraw the same results in the
  // newly chosen language without a fresh network call.
  let lastMandiPayload = null;

  function renderMandiResults(payload, stateLabel, commodityLabel){
    if(!mandiResults) return;
    const records = (payload && payload.records) || [];
    if(!records.length){
      mandiResults.innerHTML = `<div class="rate-empty"><div class="rate-empty-icon">🌾</div><strong>${isEn() ? 'No matching mandi rate found' : 'इस खोज के लिए मंडी भाव नहीं मिला'}</strong><p>${isEn() ? `Try another crop or state. Government data may not have a report for ${escapeHtml(commodityLabel)} in ${escapeHtml(stateLabel)} today.` : `${escapeHtml(stateLabel)} में ${escapeHtml(commodityLabel)} के लिए आज सरकारी डेटा में रिपोर्ट नहीं मिली। दूसरी फसल या राज्य आज़माएं।`}</p></div>`;
      return;
    }
    const nums = records.map(r => Number(String(r.modal_price || '').replace(/,/g,''))).filter(Number.isFinite).filter(n=>n>0);
    const best = nums.length ? Math.max(...nums) : null;
    const lowest = nums.length ? Math.min(...nums) : null;
    const avg = nums.length ? Math.round(nums.reduce((a,b)=>a+b,0)/nums.length) : null;
    const dates = records.map(r=>r.arrival_date).filter(Boolean);
    const latest = dates[0] || '';
    const summary = `<div class="rate-summary">
      <div class="rate-stat"><small>${isEn()?'Best modal price':'सबसे अच्छा मोडल भाव'}</small><strong>${best ? '₹'+best.toLocaleString('en-IN') : '—'}</strong><em>/${isEn()?'quintal':'क्विंटल'}</em></div>
      <div class="rate-stat"><small>${isEn()?'Lowest':'सबसे कम'}</small><strong>${lowest ? '₹'+lowest.toLocaleString('en-IN') : '—'}</strong><em>/${isEn()?'quintal':'क्विंटल'}</em></div>
      <div class="rate-stat"><small>${isEn()?'Average':'औसत'}</small><strong>${avg ? '₹'+avg.toLocaleString('en-IN') : '—'}</strong><em>/${isEn()?'quintal':'क्विंटल'}</em></div>
    </div>`;
    const cards = records.map(r => {
      const market = r.market || r.district || (isEn()?'Mandi':'मंडी');
      const district = r.district || '';
      const modal = r.modal_price || '';
      const min = r.min_price || '';
      const max = r.max_price || '';
      const date = r.arrival_date || '';
      const variety = r.variety || '';
      return `<div class="rate-card"><span class="rate-card-ic">🏪</span><div class="rate-card-main"><div class="rate-card-title">${escapeHtml(market)}</div><div class="rate-card-sub">${escapeHtml(district)}${district && variety ? ' · ' : ''}${escapeHtml(variety)}</div>${date ? `<div class="rate-card-date">${isEn()?'Reported':'रिपोर्ट'}: ${escapeHtml(date)}</div>` : ''}</div><div class="rate-card-price"><div class="rate-card-modal">₹${escapeHtml(String(modal))}<small> / ${isEn()?'qtl':'क्विंटल'}</small></div>${(min||max)?`<div class="rate-card-range">₹${escapeHtml(String(min))}–₹${escapeHtml(String(max))}</div>`:''}</div></div>`;
    }).join('');
    const sampleNote = payload.usingSampleKey ? `<div class="rate-sample-note">${isEn() ? 'Using the data.gov.in sample API key. It is limited to 10 records per request. Add your own DATA_GOV_API_KEY in server/.env for production use.' : 'data.gov.in की sample API key इस्तेमाल हो रही है। यह प्रति request 10 records तक सीमित है। Production के लिए server/.env में अपनी DATA_GOV_API_KEY डालें।'}</div>` : '';
    mandiResults.innerHTML = `${summary}<div class="rate-cards">${cards}</div>${sampleNote}`;
    const updated = document.getElementById('mandiUpdatedLabel');
    if(updated) updated.textContent = latest ? `${isEn()?'Latest report':'अंतिम रिपोर्ट'}: ${latest}` : `${records.length} ${isEn()?'mandis':'मंडियां'}`;
  }

  async function fetchMandiPrices(){
    if(!mandiStateSelect || !mandiCommoditySelect) return;
    const state = mandiStateSelect.value;
    const commodity = mandiCommoditySelect.value;
    const stateLabel = isEn() ? state : (STATE_LABELS_HI[state] || state);
    const commodityObj = COMMODITIES.find(c => c.en === commodity);
    const commodityLabel = isEn() ? (commodityObj ? commodityObj.en.replace(/\(.*?\)/g,'').trim() : commodity) : (commodityObj ? commodityObj.hi : commodity);

    setMandiBusy(true);
    mandiResults.innerHTML = `
      <div class="rate-loading">
        <span class="rate-loading-ic">🔎</span>
        <span>${isEn() ? `Checking today's price for ${escapeHtml(commodityLabel)} in ${escapeHtml(stateLabel)}...` : `${escapeHtml(stateLabel)} में ${escapeHtml(commodityLabel)} का आज का भाव देखा जा रहा है...`}</span>
      </div>`;

    try{
      const params = new URLSearchParams({ state, commodity, limit: '10', offset: '0' });
      const res = await fetch(`${AI_PROXY_BASE}/api/mandi/prices?${params.toString()}`);
      const data = await res.json().catch(() => null);
      if(!res.ok || !data){
        throw new Error((data && data.error) || ('HTTP ' + res.status));
      }
      lastMandiPayload = data;
      renderMandiResults(data, stateLabel, commodityLabel);
    }catch(err){
      console.error('Mandi rate error:', err);
      mandiResults.innerHTML = `<div class="rate-error">${isEn() ? 'Could not load live mandi prices. Please make sure the server is running and DATA_GOV_API_KEY is configured.' : 'लाइव मंडी भाव लोड नहीं हो पाया। कृपया server चालू रखें और DATA_GOV_API_KEY सेट करें।'} <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer">${isEn()?'Open AGMARKNET':'AGMARKNET खोलें'} →</a></div>`;
      const updated = document.getElementById('mandiUpdatedLabel'); if(updated) updated.textContent = '';
    }finally{
      setMandiBusy(false);
    }
  }

  if(mandiFilterForm){
    mandiFilterForm.addEventListener('submit', (e)=>{ e.preventDefault(); fetchMandiPrices(); });
  }

  const mandiRefreshBtn = document.getElementById('mandiRefreshBtn');
  if(mandiRefreshBtn){
    mandiRefreshBtn.addEventListener('click', ()=> fetchMandiPrices());
  }

  // ---- "Use my location" — reverse-geocodes GPS coords to a state
  // name (BigDataCloud, same free no-key endpoint crop.js uses) and
  // pre-selects it, then runs the search automatically. ----
  if(mandiLocateBtn){
    mandiLocateBtn.addEventListener('click', ()=>{
      if(!('geolocation' in navigator)){
        if(mandiLocateStatus) mandiLocateStatus.textContent = isEn() ? 'Location not available in this browser.' : 'इस ब्राउज़र में लोकेशन उपलब्ध नहीं है।';
        return;
      }
      if(mandiLocateStatus) mandiLocateStatus.textContent = isEn() ? 'Finding your state...' : 'आपका राज्य पता किया जा रहा है...';
      navigator.geolocation.getCurrentPosition(async (pos)=>{
        const {latitude, longitude} = pos.coords;
        try{
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const geo = r.ok ? await r.json() : null;
          const stateName = geo && geo.principalSubdivision ? geo.principalSubdivision : '';
          const match = STATES.find(s => stateName && (s.toLowerCase() === stateName.toLowerCase() || stateName.toLowerCase().includes(s.toLowerCase())));
          if(match && mandiStateSelect){
            mandiStateSelect.value = match;
            if(mandiLocateStatus) mandiLocateStatus.textContent = isEn() ? `Found: ${match}` : `मिला: ${STATE_LABELS_HI[match] || match}`;
            fetchMandiPrices();
          } else {
            if(mandiLocateStatus) mandiLocateStatus.textContent = isEn() ? 'Could not match your state. Please pick it manually.' : 'आपका राज्य नहीं मिला। कृपया खुद चुनें।';
          }
        }catch(e){
          if(mandiLocateStatus) mandiLocateStatus.textContent = isEn() ? 'Could not detect location.' : 'लोकेशन पता नहीं चली।';
        }
      }, ()=>{
        if(mandiLocateStatus) mandiLocateStatus.textContent = isEn() ? 'Location permission denied.' : 'लोकेशन की अनुमति नहीं मिली।';
      }, { enableHighAccuracy:false, timeout:10000, maximumAge:600000 });
    });
  }

  // =========================================================
  //  3) MSP (Minimum Support Price) — static, government-fixed
  //     figures served from server/data/msp.json via /api/msp.
  // =========================================================
  const mspWrap = document.getElementById('mspWrap');
  const mspAttribution = document.getElementById('mspAttribution');
  const mspSourceLabel = document.getElementById('mspSourceLabel');
  const mspSubtabs = document.querySelectorAll('[data-msp-season]');

  let mspData = null;
  let mspLoadPromise = null;
  let activeMspSeason = 'kharif';

  // Small keyword → emoji map so every MSP card gets a relevant icon
  // without needing per-crop image assets.
  const MSP_ICON_RULES = [
    [/maize/i, '🌽'], [/paddy|rice/i, '🌾'], [/jowar|sorghum|bajra|ragi|barley|wheat/i, '🌾'],
    [/tur|arhar|moong|urad|gram|lentil|masur|pea/i, '🫘'], [/groundnut|peanut/i, '🥜'],
    [/sunflower/i, '🌻'], [/soybean|soyabean/i, '🫛'], [/sesamum|sesame|til/i, '🌱'],
    [/nigerseed/i, '🌱'], [/cotton/i, '☁️'], [/mustard|rapeseed/i, '🌼'], [/safflower/i, '🌸'],
    [/sugarcane/i, '🎋'], [/jute/i, '🧵'], [/copra|coconut/i, '🥥']
  ];
  function mspIcon(nameEn){
    const hit = MSP_ICON_RULES.find(([re]) => re.test(nameEn || ''));
    return hit ? hit[1] : '🌾';
  }

  function renderMspTable(seasonKey){
    if(!mspData || !mspWrap) return;
    const season = mspData[seasonKey];
    if(!season){ mspWrap.innerHTML = ''; return; }
    const crops = season.crops || [];

    // ---- toolbar: season badge + approval date + crop count ----
    const toolbar = `
      <div class="msp-toolbar">
        <div class="msp-toolbar-chip"><span class="msp-chip-dot"></span>${isEn() ? 'Season' : 'सीज़न'} ${escapeHtml(season.season || '')}</div>
        <div class="msp-toolbar-chip msp-toolbar-muted">📅 ${isEn() ? 'Approved' : 'स्वीकृत'}: ${escapeHtml(season.approvedOn || '—')}</div>
        <div class="msp-toolbar-count">${crops.length} ${isEn() ? 'crops' : 'फसलें'}</div>
      </div>`;

    // ---- card grid ----
    const cards = crops.map(c => {
      const diff = (typeof c.msp === 'number' && typeof c.prevMsp === 'number' && c.prevMsp > 0) ? c.msp - c.prevMsp : null;
      const pct = (diff !== null) ? (diff / c.prevMsp * 100) : null;
      const up = diff === null || diff >= 0;
      const nameMain = isEn() ? c.name_en : c.name_hi;
      const nameSub = isEn() ? c.name_hi : c.name_en;
      return `
        <div class="msp-card">
          <div class="msp-card-top">
            <span class="msp-card-ic">${mspIcon(c.name_en)}</span>
            <div class="msp-card-name">
              <strong>${escapeHtml(nameMain)}</strong>
              <span class="eng">${escapeHtml(nameSub)}</span>
            </div>
          </div>
          <div class="msp-card-price">
            <span class="msp-price-cur">₹${c.msp.toLocaleString('en-IN')}</span>
            <span class="msp-price-unit">/ ${isEn() ? 'quintal' : 'क्विंटल'}</span>
          </div>
          <div class="msp-card-foot">
            <span class="msp-prev">${isEn() ? 'Last year' : 'पिछला वर्ष'}: ₹${(c.prevMsp || 0).toLocaleString('en-IN')}</span>
            ${diff !== null ? `<span class="msp-change ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ₹${Math.abs(diff).toLocaleString('en-IN')} <em>(${up ? '+' : '−'}${Math.abs(pct).toFixed(1)}%)</em></span>` : ''}
          </div>
        </div>`;
    }).join('');

    mspWrap.innerHTML = `
      ${toolbar}
      <div class="msp-grid">${cards}</div>
      <div class="rate-msp-note"><span class="rmn-ic">ℹ️</span>${escapeHtml(isEn() ? mspData.note_en : mspData.note_hi)}</div>`;
  }

  function loadMsp(){
    if(mspLoadPromise) return mspLoadPromise;
    mspLoadPromise = fetch(`${AI_PROXY_BASE}/api/msp`)
      .then(res => { if(!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(data => {
        mspData = data;
        renderMspTable(activeMspSeason);
        if(mspAttribution && mspSourceLabel){
          mspSourceLabel.innerHTML = `${isEn() ? 'Source' : 'स्रोत'}: ${escapeHtml(data.source || '')} — ` +
            `<a href="${data.sourceUrlKharif}" target="_blank" rel="noopener noreferrer">${isEn() ? 'Kharif PIB release →' : 'खरीफ PIB विज्ञप्ति →'}</a> · ` +
            `<a href="${data.sourceUrlRabi}" target="_blank" rel="noopener noreferrer">${isEn() ? 'Rabi PIB release →' : 'रबी PIB विज्ञप्ति →'}</a>`;
          mspAttribution.hidden = false;
        }
      })
      .catch(() => {
        if(mspWrap){
          mspWrap.innerHTML = `
            <div class="rate-error">
              ${isEn() ? 'Could not load MSP data. Is server/ running? Check it directly on ' : 'MSP डेटा लोड नहीं हुआ। क्या server/ चालू है? सीधे यहां देखें: '}
              <a href="https://cacp.dacnet.nic.in" target="_blank" rel="noopener noreferrer">cacp.dacnet.nic.in</a>
            </div>`;
        }
        mspLoadPromise = null; // allow retry
      });
    return mspLoadPromise;
  }

  mspSubtabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      activeMspSeason = btn.dataset.mspSeason;
      mspSubtabs.forEach(b => b.classList.toggle('active', b === btn));
      renderMspTable(activeMspSeason);
    });
  });

  // =========================================================
  //  4) LANGUAGE SWITCH HOOK — fx.js's setLanguage() calls
  //     window.renderMandi() (if defined) after flipping hi/en, so
  //     the select options, any already-fetched mandi results, and
  //     the MSP table all redraw in the new language too (plain
  //     [data-en] swapping only covers static markup, not this
  //     JS-generated content).
  // =========================================================
  window.renderMandi = function(){
    fillSelects();
    if(lastMandiPayload){
      const state = mandiStateSelect ? mandiStateSelect.value : '';
      const commodity = mandiCommoditySelect ? mandiCommoditySelect.value : '';
      const stateLabel = isEn() ? state : (STATE_LABELS_HI[state] || state);
      const commodityObj = COMMODITIES.find(c => c.en === commodity);
      const commodityLabel = isEn() ? (commodityObj ? commodityObj.en.replace(/\(.*?\)/g,'').trim() : commodity) : (commodityObj ? commodityObj.hi : commodity);
      renderMandiResults(lastMandiPayload, stateLabel, commodityLabel);
    }
    if(mspData) renderMspTable(activeMspSeason);
  };

})();
