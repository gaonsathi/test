// ======================================================================
//  RESULTS PAGE (kaam/results.html) — SELF-CONTAINED SCRIPT
//
//  Reached after "छोड़ें / Skip" or after posting through kaam.js's
//  guided ("शुरू करें") flow, via:
//      kaam/results.html?intent=both|worker|employer|vehicleNeed|vehicleGive
//
//  Seed (demo) data below intentionally mirrors kaam/kaam.js's arrays —
//  same pattern the rest of this codebase already uses (every section
//  keeps its own data/logic self-contained instead of importing from
//  another section's file). Posts a visitor actually submits — from
//  here OR from the काम खोजो section itself — are additionally kept in
//  localStorage under KAAM_STORAGE_KEY so both places stay in sync.
// ======================================================================

(function () {
  const root = document.getElementById('kaamResults');
  if (!root) return;

  const KAAM_STORAGE_KEY = 'gsKaamPosts';

  function loadStoredPosts() {
    try {
      const raw = localStorage.getItem(KAAM_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Object.assign({ job: [], worker: [], vehicleOffer: [], vehicleRequest: [] }, parsed || {});
    } catch (e) {
      return { job: [], worker: [], vehicleOffer: [], vehicleRequest: [] };
    }
  }
  function persistPost(type, item) {
    try {
      const store = loadStoredPosts();
      if (!store[type]) store[type] = [];
      store[type].unshift(item);
      localStorage.setItem(KAAM_STORAGE_KEY, JSON.stringify(store));
    } catch (e) { /* storage disabled/full — ignore, keep working in-memory */ }
  }

  // ------------------------------------------------------------------
  //  SEED DATA (same demo listings as kaam/kaam.js) + anything a
  //  visitor has actually posted, pulled in from localStorage.
  // ------------------------------------------------------------------
  const stored = loadStoredPosts();

  let jobs = [
    { title: "खेत मजदूर चाहिए", titleEn: "Farm labourer needed", tag: "daily", tagLabel: "रोज़ का काम", tagLabelEn: "Daily Work", place: "पूर्णिया", placeEn: "Purnia", dist: "2 किमी दूर", distEn: "2 km away", wage: 350, unit: "day", unitEn: "day", phone: "9876500001", icon: "🌾", tile: "var(--brick)" },
    { title: "राजमिस्त्री (Mason)", titleEn: "Mason needed", tag: "skilled", tagLabel: "हुनरमंद", tagLabelEn: "Skilled", place: "कटिहार", placeEn: "Katihar", dist: "8 किमी दूर", distEn: "8 km away", wage: 600, unit: "day", unitEn: "day", phone: "9876500002", icon: "🧱", tile: "var(--soil)" },
    { title: "सिलाई कारीगर चाहिए", titleEn: "Tailoring artisan needed", tag: "women", tagLabel: "महिलाओं के लिए", tagLabelEn: "For Women", place: "पूर्णिया", placeEn: "Purnia", dist: "घर से काम", distEn: "work from home", wage: 8000, unit: "month", unitEn: "month", phone: "9876500003", icon: "🧵", tile: "var(--pink)" },
    { title: "ड्राइवर चाहिए (LMV)", titleEn: "Driver needed (LMV)", tag: "skilled", tagLabel: "हुनरमंद", tagLabelEn: "Skilled", place: "पूर्णिया", placeEn: "Purnia", dist: "4 किमी दूर", distEn: "4 km away", wage: 12000, unit: "month", unitEn: "month", phone: "9876500004", icon: "🚗", tile: "var(--sky)" },
    { title: "निर्माण मजदूर चाहिए", titleEn: "Construction labourer needed", tag: "daily", tagLabel: "रोज़ का काम", tagLabelEn: "Daily Work", place: "अररिया", placeEn: "Araria", dist: "12 किमी दूर", distEn: "12 km away", wage: 400, unit: "day", unitEn: "day", phone: "9876500005", icon: "🏗️", tile: "var(--brick)" },
  ].concat(stored.job || []);

  let workers = [
    { title: "रामू यादव — राजमिस्त्री", titleEn: "Ramu Yadav — Mason", tag: "skilled", tagLabel: "हुनरमंद", tagLabelEn: "Skilled", place: "पूर्णिया", placeEn: "Purnia", dist: "काम के लिए तैयार", distEn: "available now", wage: 650, unit: "day", unitEn: "day", phone: "9876511001", icon: "🧑‍🔧", tile: "var(--green)" },
    { title: "सुनीता देवी — सिलाई", titleEn: "Sunita Devi — Tailoring", tag: "women", tagLabel: "महिलाओं के लिए", tagLabelEn: "For Women", place: "कटिहार", placeEn: "Katihar", dist: "घर से काम", distEn: "work from home", wage: 7000, unit: "month", unitEn: "month", phone: "9876511002", icon: "👩‍🦱", tile: "var(--pink)" },
    { title: "मोहन कुमार — खेत मजदूर", titleEn: "Mohan Kumar — Farm labour", tag: "daily", tagLabel: "रोज़ का काम", tagLabelEn: "Daily Work", place: "अररिया", placeEn: "Araria", dist: "काम के लिए तैयार", distEn: "available now", wage: 320, unit: "day", unitEn: "day", phone: "9876511003", icon: "🧑‍🌾", tile: "var(--soil)" },
  ].concat(stored.worker || []);

  let vehicleOffers = [
    { title: "ट्रैक्टर उपलब्ध — खेत जुताई के लिए", titleEn: "Tractor available — for ploughing", tag: "tractor", tagLabel: "ट्रैक्टर", tagLabelEn: "Tractor", place: "पूर्णिया", placeEn: "Purnia", dist: "3 किमी दूर", distEn: "3 km away", wage: 800, unit: "day", unitEn: "day", phone: "9876522001", icon: "🚜", tile: "var(--green)" },
    { title: "पिकअप ट्रक उपलब्ध — सामान ढुलाई", titleEn: "Pickup truck available — for transport", tag: "truck", tagLabel: "ट्रक/पिकअप", tagLabelEn: "Truck/Pickup", place: "कटिहार", placeEn: "Katihar", dist: "6 किमी दूर", distEn: "6 km away", wage: 1200, unit: "day", unitEn: "day", phone: "9876522002", icon: "🚚", tile: "var(--sky)" },
    { title: "थ्रेशर मशीन उपलब्ध", titleEn: "Thresher machine available", tag: "thresher", tagLabel: "थ्रेशर/हार्वेस्टर", tagLabelEn: "Thresher/Harvester", place: "अररिया", placeEn: "Araria", dist: "10 किमी दूर", distEn: "10 km away", wage: 1500, unit: "day", unitEn: "day", phone: "9876522003", icon: "🌾", tile: "var(--brick)" },
  ].concat(stored.vehicleOffer || []);

  let vehicleRequests = [
    { title: "जुताई के लिए ट्रैक्टर चाहिए", titleEn: "Need tractor for ploughing", tag: "tractor", tagLabel: "ट्रैक्टर", tagLabelEn: "Tractor", place: "पूर्णिया", placeEn: "Purnia", dist: "आज के लिए चाहिए", distEn: "needed today", wage: 700, unit: "day", unitEn: "day", phone: "9876533001", icon: "🚜", tile: "var(--green)" },
    { title: "फसल ढुलाई के लिए ट्रक चाहिए", titleEn: "Need truck for crop transport", tag: "truck", tagLabel: "ट्रक/पिकअप", tagLabelEn: "Truck/Pickup", place: "कटिहार", placeEn: "Katihar", dist: "इस हफ्ते चाहिए", distEn: "needed this week", wage: 1000, unit: "day", unitEn: "day", phone: "9876533002", icon: "🚚", tile: "var(--sky)" },
  ].concat(stored.vehicleRequest || []);

  const ICONS = {
    job:    { daily: "🏗️", skilled: "🛠️", women: "🧵", near: "💼" },
    worker: { daily: "🧑‍🌾", skilled: "🧑‍🔧", women: "👩‍🦱", near: "🧑" },
    vehicleOffer:   { tractor: "🚜", truck: "🚚", thresher: "🌾", other: "🚗" },
    vehicleRequest: { tractor: "🚜", truck: "🚚", thresher: "🌾", other: "🚗" },
  };
  const TILES = {
    daily: "var(--brick)", skilled: "var(--soil)", women: "var(--pink)", near: "var(--sky)",
    tractor: "var(--green)", truck: "var(--sky)", thresher: "var(--brick)", other: "var(--soil)",
  };
  const TAG_LABELS = {
    daily:   { hi: "रोज़ का काम", en: "Daily Work" },
    skilled: { hi: "हुनरमंद", en: "Skilled" },
    women:   { hi: "महिलाओं के लिए", en: "For Women" },
    near:    { hi: "पास में / अन्य", en: "Nearby / Other" },
    tractor:  { hi: "ट्रैक्टर", en: "Tractor" },
    truck:    { hi: "ट्रक/पिकअप", en: "Truck/Pickup" },
    thresher: { hi: "कृषि मशीन", en: "Farm Machinery" },
    other:    { hi: "अन्य वाहन", en: "Other Vehicles" },
  };

  const WORK_SKILLS = [
    { value: "farm",         group: "daily",   icon: "🌾", hi: "खेत मजदूर / कृषि कार्य",       en: "Farm Labour" },
    { value: "construction", group: "daily",   icon: "🏗️", hi: "निर्माण मजदूर",                en: "Construction Labour" },
    { value: "loading",      group: "daily",   icon: "📦", hi: "लोडिंग-अनलोडिंग",              en: "Loading-Unloading" },
    { value: "cleaner",      group: "daily",   icon: "🧹", hi: "सफाई कर्मी",                   en: "Cleaner" },
    { value: "gardener",     group: "daily",   icon: "🌱", hi: "माली",                          en: "Gardener" },
    { value: "mason",        group: "skilled", icon: "🧱", hi: "राजमिस्त्री",                   en: "Mason" },
    { value: "carpenter",    group: "skilled", icon: "🪚", hi: "बढ़ई",                          en: "Carpenter" },
    { value: "electrician",  group: "skilled", icon: "💡", hi: "इलेक्ट्रीशियन",                 en: "Electrician" },
    { value: "plumber",      group: "skilled", icon: "🔧", hi: "प्लंबर",                        en: "Plumber" },
    { value: "painter",      group: "skilled", icon: "🎨", hi: "पेंटर",                         en: "Painter" },
    { value: "welder",       group: "skilled", icon: "🔩", hi: "वेल्डर",                        en: "Welder" },
    { value: "driver",       group: "skilled", icon: "🚗", hi: "ड्राइवर",                       en: "Driver" },
    { value: "mechanic",     group: "skilled", icon: "🔩", hi: "मैकेनिक",                       en: "Mechanic" },
    { value: "tailoring",    group: "women",   icon: "🧵", hi: "सिलाई / कढ़ाई",                en: "Tailoring / Embroidery" },
    { value: "domestic",     group: "women",   icon: "🏠", hi: "घरेलू सहायिका / आया",           en: "Domestic Help" },
    { value: "cook",         group: "women",   icon: "🍳", hi: "रसोइया / कुक",                  en: "Cook" },
    { value: "beautician",   group: "women",   icon: "💇", hi: "ब्यूटीशियन",                    en: "Beautician" },
    { value: "asha",         group: "women",   icon: "🩺", hi: "आंगनवाड़ी / आशा कार्यकर्ता",      en: "Anganwadi / ASHA Worker" },
    { value: "security",     group: "near",    icon: "🛡️", hi: "सिक्योरिटी गार्ड",              en: "Security Guard" },
    { value: "shop",         group: "near",    icon: "🏪", hi: "दुकान सहायक",                   en: "Shop Helper" },
    { value: "delivery",     group: "near",    icon: "🛵", hi: "डिलीवरी",                       en: "Delivery" },
    { value: "other",        group: "near",    icon: "📌", hi: "अन्य",                          en: "Other" },
  ];
  const WORK_SKILL_MAP = {};
  WORK_SKILLS.forEach(s => { WORK_SKILL_MAP[s.value] = s; });
  const WORK_GROUP_ORDER = ["daily", "skilled", "women", "near"];

  const VEHICLE_ITEMS = [
    { value: "tractor",      group: "tractor",  icon: "🚜", hi: "ट्रैक्टर (जुताई)",              en: "Tractor (Ploughing)" },
    { value: "trolley",      group: "tractor",  icon: "🛻", hi: "ट्रैक्टर ट्रॉली (ढुलाई)",         en: "Tractor Trolley (Transport)" },
    { value: "truck",        group: "truck",    icon: "🚚", hi: "ट्रक / पिकअप",                  en: "Truck / Pickup" },
    { value: "tempo",        group: "truck",    icon: "🛺", hi: "टेम्पो / ऑटो",                  en: "Tempo / Auto" },
    { value: "watertanker",  group: "truck",    icon: "🚛", hi: "पानी का टैंकर",                  en: "Water Tanker" },
    { value: "thresher",     group: "thresher", icon: "🌾", hi: "थ्रेशर मशीन",                   en: "Thresher" },
    { value: "harvester",    group: "thresher", icon: "🌿", hi: "हार्वेस्टर / कंबाइन",             en: "Harvester / Combine" },
    { value: "rotavator",    group: "thresher", icon: "🌀", hi: "रोटावेटर / कल्टीवेटर",           en: "Rotavator / Cultivator" },
    { value: "seeddrill",    group: "thresher", icon: "🌱", hi: "सीड ड्रिल (बुवाई मशीन)",          en: "Seed Drill (Sowing Machine)" },
    { value: "sprayer",      group: "thresher", icon: "💦", hi: "स्प्रेयर मशीन",                  en: "Sprayer Machine" },
    { value: "chaffcutter",  group: "thresher", icon: "✂️", hi: "चारा कटर (कुट्टी मशीन)",          en: "Chaff Cutter" },
    { value: "waterpump",    group: "thresher", icon: "💧", hi: "पानी पंप / मोटर",                en: "Water Pump / Motor" },
    { value: "jcb",          group: "other",    icon: "🏗️", hi: "JCB / अर्थमूवर",                 en: "JCB / Earthmover" },
    { value: "bullockcart",  group: "other",    icon: "🐂", hi: "बैलगाड़ी",                       en: "Bullock Cart" },
    { value: "other",        group: "other",    icon: "🚗", hi: "अन्य",                          en: "Other" },
  ];
  const VEHICLE_ITEM_MAP = {};
  VEHICLE_ITEMS.forEach(s => { VEHICLE_ITEM_MAP[s.value] = s; });
  const VEHICLE_GROUP_ORDER = ["tractor", "truck", "thresher", "other"];

  const UNIT_LABELS = {
    day:   { hi: "दिन",   en: "day" },
    month: { hi: "माह",   en: "month" },
    katha: { hi: "कट्ठा", en: "Katha" },
    bigha: { hi: "बीघा",  en: "Bigha" },
    hour:  { hi: "घंटा",  en: "Hour" },
    km:    { hi: "किमी",  en: "Km" },
    trip:  { hi: "ट्रिप", en: "Trip" },
  };
  const WORK_UNIT_KEYS = ["day", "month"];
  const VEHICLE_UNIT_SETS = {
    tractor:  ["katha", "bigha", "hour", "day"],
    truck:    ["km", "trip", "day"],
    thresher: ["katha", "bigha", "hour", "day"],
    other:    ["hour", "day", "trip"],
  };

  const CHIP_SETS = {
    work: [
      { tag: "all",     hi: "सभी",              en: "All" },
      { tag: "near",    hi: "📍 पास में",        en: "📍 Nearby" },
      { tag: "daily",   hi: "☀️ रोज़ का काम",    en: "☀️ Daily Work" },
      { tag: "skilled", hi: "🛠️ हुनरमंद",        en: "🛠️ Skilled" },
      { tag: "women",   hi: "👩 महिलाओं के लिए", en: "👩 For Women" },
    ],
    vehicle: [
      { tag: "all",      hi: "सभी",                  en: "All" },
      { tag: "tractor",  hi: "🚜 ट्रैक्टर",            en: "🚜 Tractor" },
      { tag: "truck",    hi: "🚚 ट्रक/पिकअप",          en: "🚚 Truck/Pickup" },
      { tag: "thresher", hi: "🌾 कृषि मशीन",           en: "🌾 Farm Machinery" },
      { tag: "other",    hi: "🚗 अन्य वाहन",           en: "🚗 Other Vehicles" },
    ],
  };
  function isVehicleType(type) { return type === "vehicleOffer" || type === "vehicleRequest"; }

  const POSTTYPE_TO_INTENT = {
    job: 'employer', worker: 'worker', vehicleOffer: 'vehicleGive', vehicleRequest: 'vehicleNeed',
  };
  const INTENT_TEXT = {
    worker:      { hi: '🧑\u200d🔧 उपलब्ध काम दिखाए जा रहे हैं',              en: '🧑\u200d🔧 Showing available jobs' },
    employer:    { hi: '📢 उपलब्ध मजदूर दिखाए जा रहे हैं',                    en: '📢 Showing available workers' },
    vehicleNeed: { hi: '🚜 उपलब्ध गाड़ी/मशीन दिखाई जा रही हैं',               en: '🚜 Showing available vehicles/machines' },
    vehicleGive: { hi: '🚗 गाड़ी की जरूरतें दिखाई जा रही हैं',                en: '🚗 Showing vehicle requests' },
    both:        { hi: '📋 सबकुछ दिख रहा है',                                en: '📋 Showing everything' },
  };
  const INTENT_TO_PANEL = {
    worker: 'jobPanel', employer: 'workerPanel', vehicleNeed: 'vehicleOfferPanel', vehicleGive: 'vehicleRequestPanel',
  };

  // ------------------------------------------------------------------
  //  DOM refs
  // ------------------------------------------------------------------
  const chipsWrap   = document.getElementById('krChips');
  const tabsWrap     = document.getElementById('krTabs');
  const jobList      = document.getElementById('jobList');
  const workerList   = document.getElementById('workerList');
  const vehicleOfferList   = document.getElementById('vehicleOfferList');
  const vehicleRequestList = document.getElementById('vehicleRequestList');
  const jobEmpty      = document.getElementById('jobEmpty');
  const workerEmpty   = document.getElementById('workerEmpty');
  const vehicleOfferEmpty   = document.getElementById('vehicleOfferEmpty');
  const vehicleRequestEmpty = document.getElementById('vehicleRequestEmpty');
  const jobsCountEl    = document.getElementById('jobsCount');
  const workersCountEl = document.getElementById('workersCount');
  const vehicleOffersCountEl   = document.getElementById('vehicleOffersCount');
  const vehicleRequestsCountEl = document.getElementById('vehicleRequestsCount');
  const intentTextEl = document.getElementById('krIntentText');
  const showAllBtn   = document.getElementById('krShowAll');

  function isEnglish() { return document.documentElement.lang === 'en'; }

  // ------------------------------------------------------------------
  //  PREMIUM CARD
  // ------------------------------------------------------------------
  function cardHTML(item, isOwnPost) {
    const en = isEnglish();
    const title   = en ? (item.titleEn || item.title) : item.title;
    const tagLbl  = en ? (item.tagLabelEn || item.tagLabel) : item.tagLabel;
    const place   = en ? (item.placeEn || item.place) : item.place;
    const dist    = en ? (item.distEn || item.dist) : item.dist;
    const unitInfo = item.unit ? UNIT_LABELS[item.unit] : null;
    const unit    = unitInfo ? (en ? unitInfo.en : unitInfo.hi) : (en ? (item.unitEn || item.unit) : item.unit);
    const priceHTML = item.wage
      ? `<p class="kr-price">₹${item.wage.toLocaleString('en-IN')}<span>/${unit}</span></p>`
      : '';
    const phoneFmt = item.phone.replace(/(\d{5})(\d{5})/, '$1 $2');
    const badgeHTML = isOwnPost
      ? `<span class="kr-badge kr-badge-new" data-en="New">नया</span>`
      : `<span class="kr-badge kr-badge-verified" data-en="✓ Trusted">✓ भरोसेमंद</span>`;
    return `
      <div class="kr-card" data-tag="${item.tag}">
        <div class="kr-card-top" style="--tile:${item.tile}">
          <div class="kr-badge-row">${badgeHTML}<span></span></div>
          <div class="kr-avatar">${item.icon}</div>
        </div>
        <div class="kr-card-body">
          <span class="kr-tag">${tagLbl}</span>
          <h4>${title}</h4>
          <p class="kr-meta">📍 ${place} • ${dist}</p>
          ${priceHTML}
          <a class="kr-phone" href="tel:${item.phone}">📞 <span>${phoneFmt}</span></a>
        </div>
        <a class="kr-call" href="tel:${item.phone}">📞 <span data-en="Call Now">कॉल करें</span></a>
      </div>`;
  }

  function renderGrid(list, container, emptyEl, countEl) {
    if (!container) return;
    const activeChip = chipsWrap.querySelector('.kr-chip.active');
    const tag = activeChip ? activeChip.dataset.tag : 'all';

    const filtered = list.filter(item => {
      const tagMatch = tag === 'all' || item.tag === tag;
      return tagMatch;
    });

    container.innerHTML = filtered.map(item => cardHTML(item, item._own)).join('');
    if (emptyEl) emptyEl.hidden = filtered.length !== 0;
    if (countEl) countEl.textContent = list.length;

    if (typeof window.gsSetLanguage === 'function') {
      window.gsSetLanguage(isEnglish() ? 'en' : 'hi');
    }
  }

  function renderAll() {
    renderGrid(jobs, jobList, jobEmpty, jobsCountEl);
    renderGrid(workers, workerList, workerEmpty, workersCountEl);
    renderGrid(vehicleOffers, vehicleOfferList, vehicleOfferEmpty, vehicleOffersCountEl);
    renderGrid(vehicleRequests, vehicleRequestList, vehicleRequestEmpty, vehicleRequestsCountEl);
  }

  function renderChips(context) {
    const set = CHIP_SETS[context] || CHIP_SETS.work;
    const lang = isEnglish() ? 'en' : 'hi';
    chipsWrap.innerHTML = set.map((c, i) =>
      `<button type="button" class="kr-chip${i === 0 ? ' active' : ''}" data-tag="${c.tag}" data-en="${c.en}">${lang === 'en' ? c.en : c.hi}</button>`
    ).join('');
    chipsWrap.querySelectorAll('.kr-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chipsWrap.querySelectorAll('.kr-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderAll();
      });
    });
    renderAll();
  }

  function panelContext(panelId) {
    return (panelId === 'vehicleOfferPanel' || panelId === 'vehicleRequestPanel') ? 'vehicle' : 'work';
  }
  function activatePanel(panelId) {
    if (tabsWrap) {
      tabsWrap.querySelectorAll('.kr-tab').forEach(t => t.classList.toggle('active', t.dataset.panel === panelId));
    }
    document.querySelectorAll('#kaamResults .kr-panel').forEach(p => p.classList.toggle('active', p.id === panelId));
    renderChips(panelContext(panelId));
  }
  if (tabsWrap) {
    tabsWrap.querySelectorAll('.kr-tab').forEach(tab => {
      tab.addEventListener('click', () => activatePanel(tab.dataset.panel));
    });
  }

  // ------------------------------------------------------------------
  //  INTENT (from ?intent=... in the URL — set by kaam.js when it
  //  redirects here after "छोड़ें / Skip" or a finished post)
  // ------------------------------------------------------------------
  function setIntent(intent, scroll) {
    root.dataset.intent = intent;
    const lang = isEnglish() ? 'en' : 'hi';
    if (intentTextEl) intentTextEl.textContent = (INTENT_TEXT[intent] || INTENT_TEXT.both)[lang];
    activatePanel(INTENT_TO_PANEL[intent] || 'jobPanel');
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const urlIntent = new URLSearchParams(window.location.search).get('intent');
  setIntent(['worker', 'employer', 'vehicleNeed', 'vehicleGive', 'both'].includes(urlIntent) ? urlIntent : 'both', false);

  if (showAllBtn) showAllBtn.addEventListener('click', () => setIntent('both', true));

  // the intent badge text above is set via plain textContent (its wording
  // depends on which tab, not just hi/en), so re-apply it whenever the
  // visitor flips the हिं/EN switch — everything else with [data-en] is
  // already handled generically by fx.js's language toggle.
  document.querySelectorAll('#langSwitch .langbtn').forEach(btn => {
    btn.addEventListener('click', () => setIntent(root.dataset.intent || 'both', false));
  });

  // ------------------------------------------------------------------
  //  TOP NAV — mobile hamburger open/close (mirrors js/script.js's
  //  behaviour; kept local since this page doesn't load script.js).
  //  Nav buttons here are plain <a href="../index.html"> links, not
  //  section switchers, so they don't need a showSection() handler.
  // ------------------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburger');
  const mainnavEl    = document.getElementById('mainnav');
  const navOverlay   = document.getElementById('navOverlay');
  if (hamburgerBtn && mainnavEl && navOverlay) {
    function setMenu(open) {
      mainnavEl.classList.toggle('open', open);
      hamburgerBtn.classList.toggle('open', open);
      navOverlay.classList.toggle('open', open);
      hamburgerBtn.setAttribute('aria-expanded', open);
    }
    hamburgerBtn.addEventListener('click', () => setMenu(!mainnavEl.classList.contains('open')));
    navOverlay.addEventListener('click', () => setMenu(false));
    document.addEventListener('click', (e) => {
      if (!mainnavEl.classList.contains('open')) return;
      if (mainnavEl.contains(e.target) || hamburgerBtn.contains(e.target)) return;
      setMenu(false);
    });
  }

  // ------------------------------------------------------------------
  //  TOAST
  // ------------------------------------------------------------------
  const toast = document.getElementById('krToast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // ------------------------------------------------------------------
  //  POST MODAL (corner "रजिस्टर / पोस्ट करें" button) — same guided
  //  two-step flow as kaam.js: dropdown 1 = काम/गाड़ी, dropdown 2 = the
  //  specific need, then the detail fields reveal.
  // ------------------------------------------------------------------
  const overlay    = document.getElementById('krModalOverlay');
  const form       = document.getElementById('krForm');
  const modalTitle = document.getElementById('krModalTitle');
  const modalSub   = document.getElementById('krModalSub');
  const labelTitle = document.getElementById('krLabelTitle');
  const labelWage  = document.getElementById('krLabelWage');
  const fTitle  = document.getElementById('fTitle');
  const catSelect      = document.getElementById('catSelect');
  const catSelectBtn   = document.getElementById('catSelectBtn');
  const catSelectLabel = document.getElementById('catSelectLabel');
  const catSelectPanel = document.getElementById('catSelectPanel');
  const fPlace  = document.getElementById('fPlace');
  const fWage   = document.getElementById('fWage');
  const fUnit   = document.getElementById('fUnit');
  const fPhone  = document.getElementById('fPhone');
  const wageRow = document.getElementById('krWageRow');
  const submitBtn = document.getElementById('krSubmitBtn');
  const formFields = document.getElementById('krFormFields');
  const fab = document.getElementById('krSideCta');
  const modalClose = document.getElementById('krModalClose');
  const modalSkip  = document.getElementById('krModalSkip');

  const locCurrentBtn     = document.getElementById('locCurrentBtn');
  const locCurrentIc      = document.getElementById('locCurrentIc');
  const locCurrentBtnText = document.getElementById('locCurrentBtnText');
  const locStatus         = document.getElementById('locStatus');

  const kiPicker   = document.getElementById('kiPicker');
  const kiMain     = document.getElementById('kiMain');
  const kiSubField = document.getElementById('kiSubField');
  const kiSub      = document.getElementById('kiSub');
  const kiDivider  = document.getElementById('kiDivider');

  const KI_SUB_SETS = {
    work: [
      { value: 'job',    hi: '📢 मुझे मजदूर चाहिए',   en: '📢 I need workers' },
      { value: 'worker', hi: '🧑‍🔧 मुझे काम चाहिए',    en: '🧑\u200d🔧 I need work' },
    ],
    vehicle: [
      { value: 'vehicleRequest', hi: '🚜 मुझे गाड़ी/मशीन चाहिए', en: '🚜 I need a vehicle/machine' },
      { value: 'vehicleOffer',   hi: '🚗 मेरे पास गाड़ी है',      en: '🚗 I have a vehicle to give' },
    ],
  };

  const COPY = {
    job: {
      hi: { title: "काम पोस्ट करें", sub: "मजदूर चाहिए? यह जानकारी भरें", label: "आपका नाम", wage: "मजदूरी (₹)", btn: "✅ काम पोस्ट करें", toast: "✅ आपका काम पोस्ट हो गया — मजदूरों की सूची में जोड़ दिया गया!" },
      en: { title: "Post a Job", sub: "Need workers? Fill this in", label: "Your name", wage: "Wage (₹)", btn: "✅ Post the Job", toast: "✅ Your job has been posted!" },
    },
    worker: {
      hi: { title: "अपनी जानकारी डालें", sub: "काम चाहिए? यह जानकारी भरें", label: "आपका नाम", wage: "अपेक्षित मजदूरी (₹)", btn: "✅ प्रोफाइल पोस्ट करें", toast: "✅ आपकी प्रोफाइल पोस्ट हो गई — मालिक अब आपसे संपर्क कर सकते हैं!" },
      en: { title: "Post Yourself", sub: "Looking for work? Fill this in", label: "Your name", wage: "Expected wage (₹)", btn: "✅ Post my Profile", toast: "✅ Your profile is live — employers can now contact you!" },
    },
    vehicleOffer: {
      hi: { title: "अपनी गाड़ी पोस्ट करें", sub: "गाड़ी किराए पर देना चाहते हैं? यह जानकारी भरें", label: "आपका नाम", wage: "किराया (₹)", btn: "✅ गाड़ी पोस्ट करें", toast: "✅ आपकी गाड़ी पोस्ट हो गई — जरूरतमंद लोग अब आपसे संपर्क कर सकते हैं!" },
      en: { title: "Post your Vehicle", sub: "Want to give a vehicle on rent? Fill this in", label: "Your name", wage: "Rent (₹)", btn: "✅ Post the Vehicle", toast: "✅ Your vehicle has been posted!" },
    },
    vehicleRequest: {
      hi: { title: "गाड़ी की जरूरत बताएं", sub: "किस काम के लिए गाड़ी चाहिए? यह जानकारी भरें", label: "आपका नाम", wage: "अनुमानित किराया (₹)", btn: "✅ जरूरत पोस्ट करें", toast: "✅ आपकी जरूरत पोस्ट हो गई — गाड़ी मालिक अब आपसे संपर्क कर सकते हैं!" },
      en: { title: "Post your Requirement", sub: "What vehicle do you need? Fill this in", label: "Your name", wage: "Expected rent (₹)", btn: "✅ Post the Requirement", toast: "✅ Your requirement has been posted!" },
    }
  };
  const PLACEHOLDER = {
    job: { hi: "जैसे: सुरेश यादव", en: "e.g. Suresh Yadav" },
    worker: { hi: "जैसे: रामू यादव", en: "e.g. Ramu Yadav" },
    vehicleOffer: { hi: "जैसे: सुरेश यादव", en: "e.g. Suresh Yadav" },
    vehicleRequest: { hi: "जैसे: सुरेश यादव", en: "e.g. Suresh Yadav" },
  };

  let postType = 'job';
  let selectedCategory = ''; // tracks the chosen category value directly —
                              // the visible dropdown (#catSelectPanel) is a
                              // set of plain buttons, not a native <select>,
                              // so there's no element .value to read at submit time.

  function fillCategoryOptions(type) {
    const lang = isEnglish() ? 'en' : 'hi';
    const items = isVehicleType(type) ? VEHICLE_ITEMS : WORK_SKILLS;
    const groupOrder = isVehicleType(type) ? VEHICLE_GROUP_ORDER : WORK_GROUP_ORDER;

    catSelectPanel.innerHTML = groupOrder.map(group => {
      const groupLabel = lang === 'en' ? TAG_LABELS[group].en : TAG_LABELS[group].hi;
      const opts = items.filter(s => s.group === group).map(s =>
        `<button type="button" class="kr-cat-opt" data-value="${s.value}" role="option">${s.icon} <span data-en="${s.en}">${lang === 'en' ? s.en : s.hi}</span></button>`
      ).join('');
      return `<div class="kr-cat-group-label" data-en="${TAG_LABELS[group].en}">${groupLabel}</div>${opts}`;
    }).join('');

    catSelectPanel.querySelectorAll('.kr-cat-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        selectCategory(btn.dataset.value, items, true);
        closeCatPanel();
      });
    });

    const first = items.find(s => s.group === groupOrder[0]) || items[0];
    if (first) selectCategory(first.value, items, false);
  }

  function selectCategory(value, items, fireChange) {
    selectedCategory = value;
    const lang = isEnglish() ? 'en' : 'hi';
    const info = items.find(s => s.value === value);
    catSelectLabel.textContent = info ? `${info.icon} ${lang === 'en' ? info.en : info.hi}` : value;
    catSelectPanel.querySelectorAll('.kr-cat-opt').forEach(b => b.classList.toggle('active', b.dataset.value === value));
    if (fireChange) fillUnitOptions(postType, value);
  }

  function openCatPanel() {
    catSelectPanel.hidden = false;
    catSelectBtn.classList.add('open');
    catSelectBtn.setAttribute('aria-expanded', 'true');
  }
  function closeCatPanel() {
    catSelectPanel.hidden = true;
    catSelectBtn.classList.remove('open');
    catSelectBtn.setAttribute('aria-expanded', 'false');
  }
  catSelectBtn.addEventListener('click', () => {
    if (catSelectPanel.hidden) openCatPanel(); else closeCatPanel();
  });
  document.addEventListener('click', (e) => {
    if (!catSelect.contains(e.target)) closeCatPanel();
  });

  function fillUnitOptions(type, categoryValue) {
    const lang = isEnglish() ? 'en' : 'hi';
    let keys;
    if (isVehicleType(type)) {
      const info = VEHICLE_ITEM_MAP[categoryValue];
      const group = info ? info.group : 'other';
      keys = VEHICLE_UNIT_SETS[group] || VEHICLE_UNIT_SETS.other;
    } else {
      keys = WORK_UNIT_KEYS;
    }
    fUnit.innerHTML = keys.map(k => {
      const u = UNIT_LABELS[k];
      return `<option value="${k}" data-en="${u.en}">${lang === 'en' ? u.en : u.hi}</option>`;
    }).join('');
  }

  function configureFormFor(type) {
    postType = ['worker', 'vehicleOffer', 'vehicleRequest'].includes(type) ? type : 'job';
    const lang = isEnglish() ? 'en' : 'hi';
    const c = COPY[postType][lang];
    modalTitle.textContent = c.title;
    modalSub.textContent = c.sub;
    labelTitle.textContent = c.label;
    labelWage.textContent = c.wage;
    submitBtn.textContent = c.btn;
    fTitle.placeholder = PLACEHOLDER[postType][lang];
    fillCategoryOptions(postType);
    closeCatPanel();

    if (postType === 'vehicleRequest') {
      wageRow.hidden = true;
      fWage.required = false;
    } else {
      wageRow.hidden = false;
      fWage.required = true;
      fillUnitOptions(postType, selectedCategory);
    }
  }

  function openOverlay() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  window.closeKrModal = function () {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  function openGuidedModal() {
    const lang = isEnglish() ? 'en' : 'hi';
    modalTitle.textContent = lang === 'en' ? 'Let\u2019s find what you need' : 'बताएं, आपको क्या चाहिए';
    modalSub.textContent = lang === 'en' ? 'Answer 2 quick questions to get started' : 'शुरू करने के लिए 2 छोटे सवालों के जवाब दें';
    kiPicker.hidden = false;
    modalSkip.hidden = false;
    kiMain.value = '';
    kiSub.innerHTML = '<option value="">-- चुनें --</option>';
    kiSubField.hidden = true;
    kiDivider.hidden = true;
    formFields.hidden = true;
    submitBtn.hidden = true;
    form.reset();
    setLocStatus('');
    openOverlay();
  }
  if (fab) fab.addEventListener('click', openGuidedModal);

  kiMain.addEventListener('change', () => {
    const lang = isEnglish() ? 'en' : 'hi';
    const set = KI_SUB_SETS[kiMain.value];
    kiSubField.hidden = true;
    kiDivider.hidden = true;
    formFields.hidden = true;
    submitBtn.hidden = true;
    if (!set) return;
    kiSub.innerHTML = '<option value="">-- चुनें --</option>' + set.map(o =>
      `<option value="${o.value}" data-en="${o.en}">${lang === 'en' ? o.en : o.hi}</option>`
    ).join('');
    kiSub.value = '';
    kiSubField.hidden = false;
  });

  kiSub.addEventListener('change', () => {
    if (!kiSub.value) { kiDivider.hidden = true; formFields.hidden = true; submitBtn.hidden = true; return; }
    configureFormFor(kiSub.value);
    kiDivider.hidden = false;
    formFields.hidden = false;
    submitBtn.hidden = false;
    setTimeout(() => fTitle.focus(), 150);
  });

  // "छोड़ें" inside the modal — visitor doesn't want to post right now,
  // just close the modal and make sure everything is showing.
  modalSkip.addEventListener('click', () => {
    window.closeKrModal();
    setIntent('both', true);
  });
  modalClose.addEventListener('click', () => window.closeKrModal());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) window.closeKrModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) window.closeKrModal();
  });

  // ------------------------------------------------------------------
  //  "मेरी वर्तमान लोकेशन का उपयोग करें" — same reverse-geocode pattern
  //  as kaam.js, using the free OpenStreetMap Nominatim API.
  // ------------------------------------------------------------------
  function setLocStatus(text, kind) {
    locStatus.className = 'kr-loc-status' + (kind ? ' kr-loc-status-' + kind : '');
    if (!text) { locStatus.hidden = true; locStatus.textContent = ''; return; }
    locStatus.hidden = false;
    locStatus.textContent = text;
  }
  function setLocBtnLoading(isLoading) {
    locCurrentBtn.disabled = isLoading;
    const lang = isEnglish() ? 'en' : 'hi';
    if (isLoading) {
      locCurrentIc.textContent = '⏳';
      locCurrentBtnText.textContent = lang === 'en' ? 'Finding your location…' : 'आपकी लोकेशन खोजी जा रही है…';
    } else {
      locCurrentIc.textContent = '📍';
      locCurrentBtnText.textContent = lang === 'en' ? 'Use my current location' : 'मेरी वर्तमान लोकेशन का उपयोग करें';
    }
  }
  async function reverseGeocode(lat, lon) {
    const lang = isEnglish() ? 'en' : 'hi';
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=${lang}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('reverse geocode failed');
    const data = await res.json();
    const a = data.address || {};
    const place = a.village || a.town || a.suburb || a.city_district || a.city || '';
    const district = a.county || a.state_district || '';
    const state = a.state || '';
    const short = [place, district, state].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i).join(', ');
    return short || data.display_name || '';
  }
  locCurrentBtn.addEventListener('click', () => {
    const lang = isEnglish() ? 'en' : 'hi';
    if (!navigator.geolocation) {
      setLocStatus(lang === 'en' ? '⚠️ Location is not supported on this device — please type your address below.' : '⚠️ इस डिवाइस पर लोकेशन सपोर्ट नहीं है — कृपया नीचे पता खुद लिखें।', 'error');
      fPlace.focus();
      return;
    }
    setLocBtnLoading(true);
    setLocStatus(lang === 'en' ? 'Getting your location…' : 'आपकी लोकेशन ली जा रही है…', 'loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const address = await reverseGeocode(latitude, longitude);
          if (address) {
            fPlace.value = address;
            setLocStatus(lang === 'en' ? '✅ Location found — you can still edit it below.' : '✅ लोकेशन मिल गई — नीचे चाहें तो बदल भी सकते हैं।', 'success');
          } else {
            setLocStatus(lang === 'en' ? '⚠️ Could not read the address — please type it below.' : '⚠️ पता नहीं पढ़ पाए — कृपया नीचे खुद लिखें।', 'error');
            fPlace.focus();
          }
        } catch (err) {
          setLocStatus(lang === 'en' ? '⚠️ Could not read the address — please type it below.' : '⚠️ पता नहीं पढ़ पाए — कृपया नीचे खुद लिखें।', 'error');
          fPlace.focus();
        } finally {
          setLocBtnLoading(false);
        }
      },
      (err) => {
        setLocBtnLoading(false);
        let msg;
        if (err.code === err.PERMISSION_DENIED) {
          msg = lang === 'en' ? '⚠️ Location permission denied — please type your address below.' : '⚠️ आपने लोकेशन की अनुमति नहीं दी — कृपया नीचे पता खुद लिखें।';
        } else if (err.code === err.TIMEOUT) {
          msg = lang === 'en' ? '⚠️ Took too long to find location — please type your address below.' : '⚠️ लोकेशन खोजने में ज़्यादा समय लग गया — कृपया नीचे पता खुद लिखें।';
        } else {
          msg = lang === 'en' ? '⚠️ Could not get location — please type your address below.' : '⚠️ लोकेशन नहीं मिल पाई — कृपया नीचे पता खुद लिखें।';
        }
        setLocStatus(msg, 'error');
        fPlace.focus();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });

  // ------------------------------------------------------------------
  //  SUBMIT — builds the item, saves it to localStorage (so kaam.js's
  //  in-page widget sees it too), adds it to this page's in-memory
  //  lists, and re-renders — no page reload, same premium card grid.
  // ------------------------------------------------------------------
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const cat = selectedCategory;
    const lang = isEnglish() ? 'en' : 'hi';
    const isWork = !isVehicleType(postType);
    const info = isWork ? WORK_SKILL_MAP[cat] : VEHICLE_ITEM_MAP[cat];
    const group = info ? info.group : (isWork ? 'near' : 'other');
    const newItem = {
      title: fTitle.value.trim(),
      titleEn: fTitle.value.trim(),
      tag: group,
      tagLabel: info ? info.hi : TAG_LABELS[cat].hi,
      tagLabelEn: info ? info.en : TAG_LABELS[cat].en,
      place: fPlace.value.trim(),
      placeEn: fPlace.value.trim(),
      dist: postType === 'worker' ? 'काम के लिए तैयार' : postType === 'vehicleOffer' ? 'अभी उपलब्ध' : 'नई पोस्ट',
      distEn: postType === 'worker' ? 'available now' : postType === 'vehicleOffer' ? 'available now' : 'new post',
      wage: postType === 'vehicleRequest' ? null : (parseInt(fWage.value, 10) || 0),
      unit: postType === 'vehicleRequest' ? null : fUnit.value,
      unitEn: postType === 'vehicleRequest' ? null : fUnit.value,
      phone: fPhone.value.trim(),
      icon: info ? info.icon : (ICONS[postType][cat] || (postType === 'job' ? '💼' : isVehicleType(postType) ? '🚗' : '🧑‍🔧')),
      tile: TILES[group] || 'var(--brick)',
      _own: true,
    };

    if (postType === 'job') jobs.unshift(newItem);
    else if (postType === 'worker') workers.unshift(newItem);
    else if (postType === 'vehicleOffer') vehicleOffers.unshift(newItem);
    else if (postType === 'vehicleRequest') vehicleRequests.unshift(newItem);

    persistPost(postType, newItem);

    window.closeKrModal();
    showToast(COPY[postType][lang].toast);
    setIntent(POSTTYPE_TO_INTENT[postType], true);
  });

  // NOTE: no extra initial renderChips() call here — setIntent(...) above
  // (called right after reading ?intent= from the URL) already triggers
  // activatePanel() -> renderChips() with the correct chip set for
  // whichever tab/panel that intent points to.
})();
