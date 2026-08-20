// ======================================================================
//  काम खोजो (Kaam Khojo) — SECTION-ONLY SCRIPT
//  Everything this section needs lives right here. You should never
//  have to open js/script.js (the shared file) to work on this page.
//
//  This file is loaded by index.html AFTER all sections are injected
//  into the page, so it's safe to look up #kaam elements immediately.
//
//  ⚠️ IMPORTANT FOR ANYONE EDITING THIS SECTION:
//  - ALL JavaScript for #kaam belongs in THIS file, and only this file.
//  - Do NOT add kaam-related functions, listeners, or variables into
//    js/script.js or into any other section's .js file — even
//    "just one small helper". If it's logic for the kaam section, it
//    goes here, inside the existing (function(){ ... })() wrapper.
//  - Keep everything wrapped in this IIFE (not global) unless the HTML
//    needs to call it directly via onclick="..." (like openKaamModal
//    below) — those must be attached to window, same pattern used here.
// ======================================================================

(function () {
  const root = document.getElementById('kaam');
  if (!root) return; // section not loaded / removed — bail quietly

  const chipsWrap   = document.getElementById('kaamChips');
  const searchInput = document.getElementById('kaamSearch');
  const jobList     = document.getElementById('jobList');
  const workerList  = document.getElementById('workerList');
  const jobEmpty    = document.getElementById('jobEmpty');
  const workerEmpty = document.getElementById('workerEmpty');
  const tabsWrap    = document.getElementById('kaamTabs');
  const jobsCountEl    = document.getElementById('jobsCount');
  const workersCountEl = document.getElementById('workersCount');

  // vehicle panels ("मुझे गाड़ी चाहिए" / "मेरे पास गाड़ी है" intents)
  const vehicleOfferList    = document.getElementById('vehicleOfferList');
  const vehicleRequestList  = document.getElementById('vehicleRequestList');
  const vehicleOfferEmpty   = document.getElementById('vehicleOfferEmpty');
  const vehicleRequestEmpty = document.getElementById('vehicleRequestEmpty');
  const vehicleOffersCountEl   = document.getElementById('vehicleOffersCount');
  const vehicleRequestsCountEl = document.getElementById('vehicleRequestsCount');

  if (!chipsWrap || !searchInput || !jobList || !workerList) return;

  // ------------------------------------------------------------------
  //  SHARED STORAGE — visitor-submitted posts are also saved here so
  //  kaam/results.html (the separate page shown after "छोड़ें / Skip"
  //  or after finishing a post) can pick them up and show them too,
  //  even though it's a different page/script.
  // ------------------------------------------------------------------
  const KAAM_STORAGE_KEY = 'gsKaamPosts';
  function persistKaamPost(type, item) {
    try {
      const raw = localStorage.getItem(KAAM_STORAGE_KEY);
      const store = Object.assign({ job: [], worker: [], vehicleOffer: [], vehicleRequest: [] }, raw ? JSON.parse(raw) : {});
      if (!store[type]) store[type] = [];
      store[type].unshift(item);
      localStorage.setItem(KAAM_STORAGE_KEY, JSON.stringify(store));
    } catch (e) { /* storage disabled/full — ignore, the post still shows in this session */ }
  }

  // ------------------------------------------------------------------
  //  DATA — Flipkart-style "product" cards.
  //  "jobs"    = posted by employers ("मुझे मजदूर चाहिए")
  //  "workers" = posted by job-seekers ("मुझे काम चाहिए")
  //  tile: a --tile colour used on the square icon media of the card.
  // ------------------------------------------------------------------
  let jobs = [
    { title: "खेत मजदूर चाहिए", titleEn: "Farm labourer needed", tag: "daily", tagLabel: "रोज़ का काम", tagLabelEn: "Daily Work", place: "पूर्णिया", placeEn: "Purnia", dist: "2 किमी दूर", distEn: "2 km away", wage: 350, unit: "day", unitEn: "day", phone: "9876500001", icon: "🌾", tile: "var(--brick)" },
    { title: "राजमिस्त्री (Mason)", titleEn: "Mason needed", tag: "skilled", tagLabel: "हुनरमंद", tagLabelEn: "Skilled", place: "कटिहार", placeEn: "Katihar", dist: "8 किमी दूर", distEn: "8 km away", wage: 600, unit: "day", unitEn: "day", phone: "9876500002", icon: "🧱", tile: "var(--soil)" },
    { title: "सिलाई कारीगर चाहिए", titleEn: "Tailoring artisan needed", tag: "women", tagLabel: "महिलाओं के लिए", tagLabelEn: "For Women", place: "पूर्णिया", placeEn: "Purnia", dist: "घर से काम", distEn: "work from home", wage: 8000, unit: "month", unitEn: "month", phone: "9876500003", icon: "🧵", tile: "var(--pink)" },
    { title: "ड्राइवर चाहिए (LMV)", titleEn: "Driver needed (LMV)", tag: "skilled", tagLabel: "हुनरमंद", tagLabelEn: "Skilled", place: "पूर्णिया", placeEn: "Purnia", dist: "4 किमी दूर", distEn: "4 km away", wage: 12000, unit: "month", unitEn: "month", phone: "9876500004", icon: "🚗", tile: "var(--sky)" },
    { title: "निर्माण मजदूर चाहिए", titleEn: "Construction labourer needed", tag: "daily", tagLabel: "रोज़ का काम", tagLabelEn: "Daily Work", place: "अररिया", placeEn: "Araria", dist: "12 किमी दूर", distEn: "12 km away", wage: 400, unit: "day", unitEn: "day", phone: "9876500005", icon: "🏗️", tile: "var(--brick)" },
  ];

  let workers = [
    { title: "रामू यादव — राजमिस्त्री", titleEn: "Ramu Yadav — Mason", tag: "skilled", tagLabel: "हुनरमंद", tagLabelEn: "Skilled", place: "पूर्णिया", placeEn: "Purnia", dist: "काम के लिए तैयार", distEn: "available now", wage: 650, unit: "day", unitEn: "day", phone: "9876511001", icon: "🧑‍🔧", tile: "var(--green)" },
    { title: "सुनीता देवी — सिलाई", titleEn: "Sunita Devi — Tailoring", tag: "women", tagLabel: "महिलाओं के लिए", tagLabelEn: "For Women", place: "कटिहार", placeEn: "Katihar", dist: "घर से काम", distEn: "work from home", wage: 7000, unit: "month", unitEn: "month", phone: "9876511002", icon: "👩‍🦱", tile: "var(--pink)" },
    { title: "मोहन कुमार — खेत मजदूर", titleEn: "Mohan Kumar — Farm labour", tag: "daily", tagLabel: "रोज़ का काम", tagLabelEn: "Daily Work", place: "अररिया", placeEn: "Araria", dist: "काम के लिए तैयार", distEn: "available now", wage: 320, unit: "day", unitEn: "day", phone: "9876511003", icon: "🧑‍🌾", tile: "var(--soil)" },
  ];

  // vehicleOffers = posted by vehicle owners ("मेरे पास गाड़ी है") — shown to
  // someone who needs a vehicle ("मुझे गाड़ी चाहिए").
  let vehicleOffers = [
    { title: "ट्रैक्टर उपलब्ध — खेत जुताई के लिए", titleEn: "Tractor available — for ploughing", tag: "tractor", tagLabel: "ट्रैक्टर", tagLabelEn: "Tractor", place: "पूर्णिया", placeEn: "Purnia", dist: "3 किमी दूर", distEn: "3 km away", wage: 800, unit: "day", unitEn: "day", phone: "9876522001", icon: "🚜", tile: "var(--green)" },
    { title: "पिकअप ट्रक उपलब्ध — सामान ढुलाई", titleEn: "Pickup truck available — for transport", tag: "truck", tagLabel: "ट्रक/पिकअप", tagLabelEn: "Truck/Pickup", place: "कटिहार", placeEn: "Katihar", dist: "6 किमी दूर", distEn: "6 km away", wage: 1200, unit: "day", unitEn: "day", phone: "9876522002", icon: "🚚", tile: "var(--sky)" },
    { title: "थ्रेशर मशीन उपलब्ध", titleEn: "Thresher machine available", tag: "thresher", tagLabel: "थ्रेशर/हार्वेस्टर", tagLabelEn: "Thresher/Harvester", place: "अररिया", placeEn: "Araria", dist: "10 किमी दूर", distEn: "10 km away", wage: 1500, unit: "day", unitEn: "day", phone: "9876522003", icon: "🌾", tile: "var(--brick)" },
  ];

  // vehicleRequests = posted by people who need a vehicle ("मुझे गाड़ी चाहिए")
  // — shown to vehicle owners ("मेरे पास गाड़ी है").
  let vehicleRequests = [
    { title: "जुताई के लिए ट्रैक्टर चाहिए", titleEn: "Need tractor for ploughing", tag: "tractor", tagLabel: "ट्रैक्टर", tagLabelEn: "Tractor", place: "पूर्णिया", placeEn: "Purnia", dist: "आज के लिए चाहिए", distEn: "needed today", wage: 700, unit: "day", unitEn: "day", phone: "9876533001", icon: "🚜", tile: "var(--green)" },
    { title: "फसल ढुलाई के लिए ट्रक चाहिए", titleEn: "Need truck for crop transport", tag: "truck", tagLabel: "ट्रक/पिकअप", tagLabelEn: "Truck/Pickup", place: "कटिहार", placeEn: "Katihar", dist: "इस हफ्ते चाहिए", distEn: "needed this week", wage: 1000, unit: "day", unitEn: "day", phone: "9876533002", icon: "🚚", tile: "var(--sky)" },
  ];

  // icons offered when a user posts, based on chosen category + type
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

  // Specific, researched work/skill categories shown in the post form's
  // "श्रेणी चुनें" dropdown for job/worker posts (grouped by <optgroup>
  // under the 4 broad buckets the rest of the site already filters by —
  // daily/skilled/women/near — so every specific trade still slots into
  // the existing chip-filter + tag-badge system automatically).
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

  // Specific, researched vehicle/machinery categories for the post
  // form's "श्रेणी चुनें" dropdown on vehicle posts — grouped under the
  // same 4 broad buckets (tractor/truck/thresher→farm-machinery/other)
  // the chip filters + tile colours already use, same pattern as
  // WORK_SKILLS above. Covers what villagers actually rent/lend:
  // ploughing & transport, common farm machinery, and construction/
  // water/passenger vehicles.
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

  // Pricing unit ("प्रति ...") shown next to the ₹ amount — researched to
  // match how rural India actually prices each kind of vehicle/machine:
  // farm implements are usually priced per land-area (कट्ठा/बीघा) or per
  // hour, road vehicles per km/trip, job/worker postings stay per day/month.
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
    tractor:  ["katha", "bigha", "hour", "day"],  // ploughing etc. — land-area or time based
    truck:    ["km", "trip", "day"],              // transport — distance/trip based
    thresher: ["katha", "bigha", "hour", "day"],  // farm machinery — land-area or time based
    other:    ["hour", "day", "trip"],            // JCB/bullock cart/other
  };

  // the two category dropdown option-sets offered inside the post modal —
  // "work" for job/worker posts, "vehicle" for vehicleOffer/vehicleRequest posts
  // the chip filter row shown above the grids — "work" for job/worker
  // panels, "vehicle" for vehicleOffer/vehicleRequest panels
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

  // ------------------------------------------------------------------
  //  RENDER
  // ------------------------------------------------------------------
  function isEnglish() { return document.documentElement.lang === 'en'; }

  function cardHTML(item, isOwnPost) {
    const en = isEnglish();
    const title   = en ? (item.titleEn || item.title) : item.title;
    const tagLbl  = en ? (item.tagLabelEn || item.tagLabel) : item.tagLabel;
    const place   = en ? (item.placeEn || item.place) : item.place;
    const dist    = en ? (item.distEn || item.dist) : item.dist;
    const unitInfo = item.unit ? UNIT_LABELS[item.unit] : null;
    const unit    = unitInfo ? (en ? unitInfo.en : unitInfo.hi) : (en ? (item.unitEn || item.unit) : item.unit);
    const badge   = isOwnPost
      ? `<span class="pc-badge own" data-en="New">नया</span>`
      : '';
    // vehicle-request posts (someone looking FOR a vehicle) don't collect a
    // rent amount, so skip the price line entirely when there's no wage.
    const priceHTML = item.wage
      ? `<p class="pc-price">₹${item.wage.toLocaleString('en-IN')}<span>/${unit}</span></p>`
      : '';
    return `
      <div class="product-card reveal in" data-tag="${item.tag}">
        <div class="pc-media" style="--tile:${item.tile}">
          ${badge}
          <span class="pc-icon">${item.icon}</span>
        </div>
        <div class="pc-body">
          <span class="pc-tag" style="--tag-bg:var(--accent-light);">${tagLbl}</span>
          <h4>${title}</h4>
          <p class="pc-meta">📍 ${place} • ${dist}</p>
          ${priceHTML}
        </div>
        <a class="pc-call" href="tel:${item.phone}">📞 <span data-en="Call Now">कॉल करें</span></a>
      </div>`;
  }

  function renderGrid(list, container, emptyEl, countEl) {
    if (!container) return; // panel not present on this page — skip quietly
    const activeChip = chipsWrap.querySelector('.chip.active');
    const tag = activeChip ? activeChip.dataset.tag : 'all';
    const q = searchInput.value.trim().toLowerCase();

    const filtered = list.filter(item => {
      const tagMatch = tag === 'all' || item.tag === tag;
      const hay = (item.title + ' ' + item.titleEn + ' ' + item.place + ' ' + item.placeEn).toLowerCase();
      return tagMatch && hay.includes(q);
    });

    container.innerHTML = filtered.map(item => cardHTML(item, item._own)).join('');
    if (emptyEl) emptyEl.hidden = filtered.length !== 0;
    if (countEl) countEl.textContent = list.length;

    // re-apply the current language to any freshly-rendered nodes so
    // dynamically added cards immediately match the site language.
    if (typeof window.gsSetLanguage === 'function') {
      window.gsSetLanguage(document.documentElement.lang === 'en' ? 'en' : 'hi');
    }
  }

  function renderAll() {
    renderGrid(jobs, jobList, jobEmpty, jobsCountEl);
    renderGrid(workers, workerList, workerEmpty, workersCountEl);
    renderGrid(vehicleOffers, vehicleOfferList, vehicleOfferEmpty, vehicleOffersCountEl);
    renderGrid(vehicleRequests, vehicleRequestList, vehicleRequestEmpty, vehicleRequestsCountEl);
  }

  // ------------------------------------------------------------------
  //  FILTER CHIPS + SEARCH
  //  Chips are generated dynamically because the categories differ for
  //  work (daily/skilled/women/near) vs vehicles (tractor/truck/...).
  // ------------------------------------------------------------------
  function renderChips(context) {
    const set = CHIP_SETS[context] || CHIP_SETS.work;
    const lang = isEnglish() ? 'en' : 'hi';
    chipsWrap.innerHTML = set.map((c, i) =>
      `<button type="button" class="chip${i === 0 ? ' active' : ''}" data-tag="${c.tag}" data-en="${c.en}">${lang === 'en' ? c.en : c.hi}</button>`
    ).join('');
    chipsWrap.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chipsWrap.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderAll();
      });
    });
    renderAll();
  }
  searchInput.addEventListener('input', renderAll);

  // ------------------------------------------------------------------
  //  TABS (jobs <-> workers <-> vehicle offers <-> vehicle requests)
  // ------------------------------------------------------------------
  function panelContext(panelId) {
    return (panelId === 'vehicleOfferPanel' || panelId === 'vehicleRequestPanel') ? 'vehicle' : 'work';
  }

  function activatePanel(panelId) {
    if (tabsWrap) {
      tabsWrap.querySelectorAll('.ktab').forEach(t => t.classList.toggle('active', t.dataset.panel === panelId));
    }
    document.querySelectorAll('#kaam .kaam-panel').forEach(p => p.classList.toggle('active', p.id === panelId));
    renderChips(panelContext(panelId)); // also re-renders the grids
  }

  if (tabsWrap) {
    tabsWrap.querySelectorAll('.ktab').forEach(tab => {
      tab.addEventListener('click', () => activatePanel(tab.dataset.panel));
    });
  }

  // ------------------------------------------------------------------
  //  INTENT PICKER — a single "शुरू करें / Start" button reveals the
  //  full combined view (all 4 tabs: jobs/workers/vehicle-offers/
  //  vehicle-requests) by calling setIntent('both'), same as the old
  //  skip button used to. setIntent also still accepts 'worker' /
  //  'employer' / 'vehicleNeed' / 'vehicleGive' to show just one half
  //  of the section (see .for-worker / .for-employer rules in
  //  kaam.css) — that logic is kept as-is even though there's no
  //  button wired to it right now, in case it's needed again later.
  //  Visitors can tap "बदलें" (intentChangeBtn) to go back to this
  //  picker at any time.
  // ------------------------------------------------------------------
  const intentPicker    = document.getElementById('kaamIntentPicker');
  const kaamContent      = document.getElementById('kaamContent');
  const intentBar        = document.getElementById('kaamIntentBar');
  const intentBarText    = document.getElementById('kaamIntentBarText');
  const intentChangeBtn  = document.getElementById('kaamIntentChange');
  const intentStartBtn   = document.getElementById('kaamIntentStart');

  const INTENT_BAR_COPY = {
    worker:      { hi: '🧑\u200d🔧 आप काम ढूंढ रहे हैं',              en: '🧑\u200d🔧 You are looking for work' },
    employer:    { hi: '📢 आप मजदूर ढूंढ रहे हैं',                    en: '📢 You are looking to hire' },
    vehicleNeed: { hi: '🚜 आप गाड़ी/मशीन ढूंढ रहे हैं',               en: '🚜 You are looking for a vehicle/machine' },
    vehicleGive: { hi: '🚗 आप अपनी गाड़ी किराए पे देना चाहते हैं',    en: '🚗 You want to give your vehicle on rent' },
    both:        { hi: '📋 सबकुछ दिख रहा है',                        en: '📋 Showing everything' },
  };

  // NOTE: no longer called anywhere in this file — "छोड़ें/Skip" and a
  // finished guided-flow post both now redirect to kaam/results.html
  // instead of revealing #kaamContent inline on this page (see
  // skipKaamGuided and the form submit handler below). Left in place
  // (along with #kaamContent / give-need-cards in kaam.html) in case
  // an inline reveal is ever wanted again — it still works standalone.
  function setIntent(intent) {
    root.dataset.intent = intent; // 'worker' | 'employer' | 'vehicleNeed' | 'vehicleGive' | 'both'
    intentPicker.hidden = true;
    kaamContent.hidden = false;
    if (intentBarText) {
      const lang = isEnglish() ? 'en' : 'hi';
      intentBarText.textContent = INTENT_BAR_COPY[intent][lang];
    }
    // jump straight to the panel that matches their choice
    if (intent === 'worker') activatePanel('jobPanel');
    else if (intent === 'employer') activatePanel('workerPanel');
    else if (intent === 'vehicleNeed') activatePanel('vehicleOfferPanel');
    else if (intent === 'vehicleGive') activatePanel('vehicleRequestPanel');
    else activatePanel('jobPanel'); // 'both' — default starting tab
    kaamContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resetIntent() {
    root.removeAttribute('data-intent');
    kaamContent.hidden = true;
    intentPicker.hidden = false;
    intentPicker.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // "शुरू करें / Start" now opens the guided picker modal (see
  // openKaamGuidedModal below, wired via onclick in the HTML) instead of
  // jumping straight to the combined view — the modal itself calls
  // setIntent(...) once the visitor finishes (or taps the browse link).
  if (intentChangeBtn) intentChangeBtn.addEventListener('click', resetIntent);

  // ------------------------------------------------------------------
  //  POST MODAL — shared for "मुझे मजदूर चाहिए" (job) and
  //  "मुझे काम चाहिए" (worker) buttons.
  // ------------------------------------------------------------------
  const overlay   = document.getElementById('kaamModalOverlay');
  const form      = document.getElementById('kaamForm');
  const modalTitle = document.getElementById('kaamModalTitle');
  const modalSub   = document.getElementById('kaamModalSub');
  const labelTitle = document.getElementById('labelTitle');
  const labelWage  = document.getElementById('labelWage');
  const fTitle  = document.getElementById('fTitle');
  const fCategory = document.getElementById('fCategory');
  const catSelect      = document.getElementById('catSelect');
  const catSelectBtn   = document.getElementById('catSelectBtn');
  const catSelectLabel = document.getElementById('catSelectLabel');
  const catSelectPanel = document.getElementById('catSelectPanel');
  const fPlace  = document.getElementById('fPlace');
  const fWage   = document.getElementById('fWage');
  const fUnit   = document.getElementById('fUnit');
  const fPhone  = document.getElementById('fPhone');
  const kaamWageRow = document.getElementById('kaamWageRow');
  const submitBtn = document.getElementById('kaamSubmitBtn');
  const toast = document.getElementById('kaamToast');
  const formFields = document.getElementById('kaamFormFields');

  // "use my current location" picker (sits right under the category
  // dropdown, replacing the old plain "जगह" text-only field)
  const locCurrentBtn     = document.getElementById('locCurrentBtn');
  const locCurrentIc      = document.getElementById('locCurrentIc');
  const locCurrentBtnText = document.getElementById('locCurrentBtnText');
  const locStatus         = document.getElementById('locStatus');

  // guided picker elements (the two-level dropdown shown only when the
  // modal is opened from "शुरू करें")
  const kiPicker    = document.getElementById('kiPicker');
  const kiMain      = document.getElementById('kiMain');
  const kiSubField  = document.getElementById('kiSubField');
  const kiSub       = document.getElementById('kiSub');
  const kiDivider    = document.getElementById('kiDivider');
  const modalSkip     = document.getElementById('kaamModalSkip');

  let postType = 'job'; // 'job' | 'worker' | 'vehicleOffer' | 'vehicleRequest'
  let isGuidedFlow = false; // true when modal opened via "शुरू करें" (openKaamGuidedModal)

  // maps a post type to the "intent" that should be revealed after that
  // post is made — same mapping setIntent()/INTENT_BAR_COPY already use,
  // e.g. someone posting a job (needs workers) is shown the worker list.
  const POSTTYPE_TO_INTENT = {
    job: 'employer', worker: 'worker', vehicleOffer: 'vehicleGive', vehicleRequest: 'vehicleNeed',
  };

  // dropdown-2 option sets, keyed by dropdown-1 value — reuses the same
  // wording as the give/need cards so the language stays consistent
  // wherever a visitor sees these four choices.
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
    job:            { hi: "जैसे: सुरेश यादव",                        en: "e.g. Suresh Yadav" },
    worker:         { hi: "जैसे: रामू यादव",                        en: "e.g. Ramu Yadav" },
    vehicleOffer:   { hi: "जैसे: सुरेश यादव",             en: "e.g. Suresh Yadav" },
    vehicleRequest: { hi: "जैसे: सुरेश यादव",                        en: "e.g. Suresh Yadav" },
  };

  function fillCategoryOptions(type) {
    const lang = isEnglish() ? 'en' : 'hi';
    const items = isVehicleType(type) ? VEHICLE_ITEMS : WORK_SKILLS;
    const groupOrder = isVehicleType(type) ? VEHICLE_GROUP_ORDER : WORK_GROUP_ORDER;

    // hidden native <select> — kept fully in sync so every existing
    // fCategory.value / .addEventListener('change', ...) read elsewhere
    // in this file keeps working exactly as before.
    fCategory.innerHTML = groupOrder.map(group => {
      const groupLabel = lang === 'en' ? TAG_LABELS[group].en : TAG_LABELS[group].hi;
      const opts = items.filter(s => s.group === group).map(s =>
        `<option value="${s.value}" data-en="${s.icon} ${s.en}">${s.icon} ${lang === 'en' ? s.en : s.hi}</option>`
      ).join('');
      return `<optgroup label="${groupLabel}" data-en="${TAG_LABELS[group].en}">${opts}</optgroup>`;
    }).join('');

    // visible custom dropdown — a normal element positioned inside the
    // modal (not a native OS select popup, which ignores the modal's
    // rounds/height and renders as a huge overlay outside it). Scrolls
    // within its own max-height instead.
    catSelectPanel.innerHTML = groupOrder.map(group => {
      const groupLabel = lang === 'en' ? TAG_LABELS[group].en : TAG_LABELS[group].hi;
      const opts = items.filter(s => s.group === group).map(s =>
        `<button type="button" class="cat-opt" data-value="${s.value}" role="option">${s.icon} <span data-en="${s.en}">${lang === 'en' ? s.en : s.hi}</span></button>`
      ).join('');
      return `<div class="cat-group-label" data-en="${TAG_LABELS[group].en}">${groupLabel}</div>${opts}`;
    }).join('');

    catSelectPanel.querySelectorAll('.cat-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        selectCategory(btn.dataset.value, items, true);
        closeCatPanel();
      });
    });

    // default to the first item (mirrors a native <select>'s default
    // first-option selection) — no synthetic change event on first fill.
    const first = items.find(s => s.group === groupOrder[0]) || items[0];
    if (first) selectCategory(first.value, items, false);
  }

  function selectCategory(value, items, fireChange) {
    fCategory.value = value;
    const lang = isEnglish() ? 'en' : 'hi';
    const info = items.find(s => s.value === value);
    catSelectLabel.textContent = info ? `${info.icon} ${lang === 'en' ? info.en : info.hi}` : value;
    catSelectPanel.querySelectorAll('.cat-opt').forEach(b => b.classList.toggle('active', b.dataset.value === value));
    if (fireChange) fCategory.dispatchEvent(new Event('change'));
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
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCatPanel();
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

  // configures the detail-form half of the modal (title/labels/placeholder/
  // category options) for a given postType — shared by the direct
  // give/need-card open and the guided flow's step 2.
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
    closeCatPanel(); // always start collapsed on a fresh open

    // "मुझे गाड़ी/मशीन चाहिए" (vehicleRequest) posts don't collect a rent
    // amount at all — the poster is asking, not pricing. Every other type
    // keeps the wage/rent row, with the "प्रति ..." unit dropdown tailored
    // to the chosen category (see fillUnitOptions).
    if (postType === 'vehicleRequest') {
      kaamWageRow.hidden = true;
      fWage.required = false;
    } else {
      kaamWageRow.hidden = false;
      fWage.required = true;
      fillUnitOptions(postType, fCategory.value);
    }
  }

  function openOverlay() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // opened directly from a give/need card — type is already known, so the
  // guided picker stays hidden and the detail fields show right away.
  window.openKaamModal = function (type) {
    isGuidedFlow = false;
    kiPicker.hidden = true;
    modalSkip.hidden = true;
    formFields.hidden = false;
    submitBtn.hidden = false;
    configureFormFor(type);
    form.reset();
    setLocStatus('');
    openOverlay();
    setTimeout(() => fTitle.focus(), 150);
  };

  // opened from "शुरू करें" — shows the two-level dropdown first; the
  // detail fields only reveal once dropdown 2 is answered (see kiSub
  // change handler below).
  window.openKaamGuidedModal = function () {
    isGuidedFlow = true;
    const lang = isEnglish() ? 'en' : 'hi';
    modalTitle.textContent = lang === 'en' ? 'Let\u2019s find what you need' : 'बताएं, आपको क्या चाहिए';
    modalSub.textContent = lang === 'en' ? 'Answer 2 quick questions to get started' : 'शुरू करने के लिए 2 छोटे सवालों के जवाब दें';
    kiPicker.hidden = false;
    modalSkip.hidden = false;
    modalSkip.textContent = lang === 'en' ? 'Skip →' : 'छोड़ें →';
    kiMain.value = '';
    kiSub.innerHTML = '<option value="">-- चुनें --</option>';
    kiSubField.hidden = true;
    kiDivider.hidden = true;
    formFields.hidden = true;
    submitBtn.hidden = true;
    form.reset();
    setLocStatus('');
    openOverlay();
  };

  // dropdown 1 (काम / गाड़ी) — populates dropdown 2 with the matching
  // sub-options and resets everything below it.
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

  // dropdown 2 (specific need) — configures + reveals the detail fields.
  kiSub.addEventListener('change', () => {
    if (!kiSub.value) { kiDivider.hidden = true; formFields.hidden = true; submitBtn.hidden = true; return; }
    configureFormFor(kiSub.value);
    kiDivider.hidden = false;
    formFields.hidden = false;
    submitBtn.hidden = false;
    setTimeout(() => fTitle.focus(), 150);
  });

  // if the visitor changes the category dropdown themselves (after the
  // form is already showing), keep the "प्रति ..." unit list matching
  // whatever they picked — e.g. switching from Tractor to Truck should
  // switch "प्रति कट्ठा" to "प्रति किमी".
  fCategory.addEventListener('change', () => {
    if (postType !== 'vehicleRequest') fillUnitOptions(postType, fCategory.value);
  });

  // top-right "छोड़ें / Skip" — visible the moment the guided modal opens
  // (next to the ✕), for visitors who don't want to answer either
  // dropdown at all and just want to see everything straight away.
  // Takes them to the separate results page (kaam/results.html) instead
  // of revealing the list inline on this same page — that page shows
  // the premium filter-wise profile cards and has its own corner
  // "register / post" button for anyone who changes their mind.
  window.skipKaamGuided = function () {
    window.closeKaamModal();
    window.location.href = 'kaam/results.html?intent=both';
  };

  window.closeKaamModal = function () {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  // ------------------------------------------------------------------
  //  "मेरी वर्तमान लोकेशन का उपयोग करें" — same pattern shopping apps
  //  (Flipkart/Amazon etc.) use: tap → browser asks permission → GPS
  //  co-ordinates → reverse-geocoded into a readable address that fills
  //  the (still-editable) address box below. No key/backend needed —
  //  uses the free OpenStreetMap Nominatim reverse-geocoding API.
  // ------------------------------------------------------------------
  function setLocStatus(text, kind) {
    // kind: 'loading' | 'success' | 'error' | '' (clear)
    locStatus.className = 'loc-status' + (kind ? ' loc-status-' + kind : '');
    if (!text) { locStatus.hidden = true; locStatus.textContent = ''; return; }
    locStatus.hidden = false;
    locStatus.textContent = text;
  }

  function setLocBtnLoading(isLoading) {
    locCurrentBtn.disabled = isLoading;
    locCurrentBtn.classList.toggle('loc-loading', isLoading);
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
    // build a short, human-friendly address instead of the very long
    // official display_name — village/town + district is enough here
    const place = a.village || a.town || a.suburb || a.city_district || a.city || '';
    const district = a.county || a.state_district || '';
    const state = a.state || '';
    const short = [place, district, state].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i).join(', ');
    return short || data.display_name || '';
  }

  locCurrentBtn.addEventListener('click', () => {
    const lang = isEnglish() ? 'en' : 'hi';
    if (!navigator.geolocation) {
      setLocStatus(lang === 'en'
        ? '⚠️ Location is not supported on this device — please type your address below.'
        : '⚠️ इस डिवाइस पर लोकेशन सपोर्ट नहीं है — कृपया नीचे पता खुद लिखें।', 'error');
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
          msg = lang === 'en'
            ? '⚠️ Location permission denied — please type your address below.'
            : '⚠️ आपने लोकेशन की अनुमति नहीं दी — कृपया नीचे पता खुद लिखें।';
        } else if (err.code === err.TIMEOUT) {
          msg = lang === 'en'
            ? '⚠️ Took too long to find location — please type your address below.'
            : '⚠️ लोकेशन खोजने में ज़्यादा समय लग गया — कृपया नीचे पता खुद लिखें।';
        } else {
          msg = lang === 'en'
            ? '⚠️ Could not get location — please type your address below.'
            : '⚠️ लोकेशन नहीं मिल पाई — कृपया नीचे पता खुद लिखें।';
        }
        setLocStatus(msg, 'error');
        fPlace.focus();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) window.closeKaamModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) window.closeKaamModal();
  });

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const cat = fCategory.value;
    const lang = isEnglish() ? 'en' : 'hi';
    const isWork = !isVehicleType(postType);
    const info = isWork ? WORK_SKILL_MAP[cat] : VEHICLE_ITEM_MAP[cat];
    const group = info ? info.group : (isWork ? 'near' : 'other'); // broad bucket used for chip-filtering & tile color
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

    if (postType === 'job') {
      jobs.unshift(newItem);
    } else if (postType === 'worker') {
      workers.unshift(newItem);
    } else if (postType === 'vehicleOffer') {
      vehicleOffers.unshift(newItem);
    } else if (postType === 'vehicleRequest') {
      vehicleRequests.unshift(newItem);
    }
    persistKaamPost(postType, newItem);

    window.closeKaamModal();
    showToast(COPY[postType][lang].toast);

    if (isGuidedFlow) {
      // came from "शुरू करें" → instead of revealing the list inline on
      // this same page, take them to the separate results page, jumping
      // straight to the list that matches what they just posted (e.g.
      // posting a job → see available workers to call there).
      window.location.href = 'kaam/results.html?intent=' + encodeURIComponent(POSTTYPE_TO_INTENT[postType]);
      return;
    }

    // opened directly from a give/need card, so content is already
    // visible. The panel that LISTS this postType (e.g. posting a job
    // fills the "jobs" list, which is what a worker browses — not the
    // poster) is only relevant to show right now if every tab is visible,
    // i.e. the visitor chose "सबकुछ दिखाएं". In a single-intent view that
    // panel is deliberately hidden (it belongs to the *other* side), so
    // jumping to it would just show a blank grid — refresh the current
    // panel instead.
    if (root.dataset.intent === 'both') {
      const targetPanel = {
        job: 'jobPanel', worker: 'workerPanel',
        vehicleOffer: 'vehicleOfferPanel', vehicleRequest: 'vehicleRequestPanel',
      }[postType];
      activatePanel(targetPanel);
    } else {
      renderAll();
    }
  });

  // ------------------------------------------------------------------
  //  INITIAL RENDER — jobPanel is the default active panel, so start
  //  with the "work" chip set (this also triggers the first renderAll)
  // ------------------------------------------------------------------
  renderChips('work');
})();
