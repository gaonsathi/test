// ======================================================================
//  योजना खोजें (Yojna Khojo) — SECTION-ONLY SCRIPT
//  Everything this section needs lives right here. You should never
//  have to open js/script.js (the shared file) to work on this page.
//
//  This file is loaded by index.html AFTER all sections are injected
//  into the page, so it's safe to look up #yojna elements immediately.
//
//  ⚠️ IMPORTANT FOR ANYONE EDITING THIS SECTION:
//  - ALL JavaScript for #yojna belongs in THIS file, and only this file.
//  - Do NOT add yojna-related functions, listeners, or variables into
//    js/script.js or into any other section's .js file.
//  - Keep everything wrapped in this IIFE (not global).
//  (Same pattern used by kaam/kaam.js — read the notes there for more.)
//
//  ⚠️ js/script.js (shared) still has an old "yojna filter" block from
//  before this section had its own script. It's left as-is on purpose
//  (untouched) — it targets #yojnaList .item-card, which no longer
//  exists (cards here are .yj-card), so it's a harmless no-op. It only
//  duplicates the .chip "active" class toggling, which this file
//  accounts for below (see the chip click listener).
// ======================================================================

(function () {
  const root = document.getElementById('yojna');
  if (!root) return; // section not loaded / removed — bail quietly

  const chipsWrap    = document.getElementById('yojnaChips');
  const listEl       = document.getElementById('yojnaList');
  const emptyEl      = document.getElementById('yojnaEmpty');
  const countEl      = document.getElementById('yjCount');
  const loadMoreWrap = document.getElementById('yjLoadMoreWrap');
  const loadMoreBtn  = document.getElementById('yjLoadMoreBtn');
  const expandBtn    = document.getElementById('yjFilterExpandBtn');
  const expandLabel  = document.getElementById('yjFilterExpandLabel');
  const searchInput  = document.getElementById('yjSearchInput');
  const searchClear  = document.getElementById('yjSearchClearBtn');

  if (!chipsWrap || !listEl) return;

  const PAGE_SIZE = 6;
  let visibleCount = PAGE_SIZE;
  let searchQuery = '';

  // ------------------------------------------------------------------
  //  SAVED / BOOKMARKED SCHEMES — stored locally so someone can shortlist
  //  a few schemes to revisit, without needing an account.
  // ------------------------------------------------------------------
  const SAVE_KEY = 'gs_saved_schemes';
  function getSaved() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); } catch (e) { return []; }
  }
  function isSaved(slug) { return slug && getSaved().includes(slug); }
  function toggleSaved(slug) {
    if (!slug) return false;
    let saved = getSaved();
    const already = saved.includes(slug);
    saved = already ? saved.filter(s => s !== slug) : saved.concat([slug]);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(saved)); } catch (e) {}
    return !already;
  }

  function daysUntil(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d)) return null;
    return Math.ceil((d - new Date()) / 86400000);
  }

  // ------------------------------------------------------------------
  //  DATA SOURCE — 100% admin panel (server/data/schemes.json via
  //  /api/schemes). There is no built-in/hardcoded scheme list anymore
  //  — whatever the admin adds & publishes at admin/admin.html is
  //  exactly what shows up here, nothing more, nothing less. Delete a
  //  scheme in admin → it disappears here on next load. Un-publish it
  //  (uncheck "वेबसाइट पर प्रकाशित करें") → same thing.
  // ------------------------------------------------------------------
  const ONGOING = "चालू — कभी भी आवेदन करें";
  const ONGOING_EN = "Ongoing — apply anytime";

  const TAG_TILE = {
    farmer: "var(--green)", women: "var(--pink)", student: "var(--sky)",
    elder: "var(--soil)", health: "var(--brick)", housing: "var(--saffron-dark)",
    employment: "var(--green-mid)", welfare: "var(--soil)", disability: "var(--pink)"
  };
  const TAG_LABEL = {
    farmer: ["किसान", "Farmer"], women: ["महिला", "Women"], student: ["छात्र", "Student"],
    elder: ["बुज़ुर्ग", "Elderly"], health: ["स्वास्थ्य", "Health"], housing: ["आवास", "Housing"],
    employment: ["रोज़गार", "Jobs & Business"], welfare: ["राशन/कल्याण", "Ration/Welfare"],
    disability: ["दिव्यांग", "Disabled"]
  };
  function firstLine(str) { return String(str || '').split(/\r?\n/)[0].trim(); }

  function adminItemToCard(a) {
    const lbl = TAG_LABEL[a.tag] || [a.tag || '', a.tag || ''];
    return {
      title: a.title, titleEn: a.titleEn || a.title,
      tag: a.tag, tagLabel: lbl[0], tagLabelEn: lbl[1],
      benefit: firstLine(a.benefit) || firstLine(a.oneLineSummary),
      benefitEn: firstLine(a.benefitEn) || firstLine(a.oneLineSummaryEn) || firstLine(a.benefit) || firstLine(a.oneLineSummary),
      eligibility: firstLine(a.eligibility), eligibilityEn: firstLine(a.eligibilityEn) || firstLine(a.eligibility),
      lastDate: a.lastDate || ONGOING, lastDateEn: a.lastDateEn || ONGOING_EN,
      icon: a.icon || '📋', tile: TAG_TILE[a.tag] || 'var(--accent)',
      articleSlug: a.slug, isNew: !!a.isNew
    };
  }

  // Populated entirely from the API — starts empty.
  let SCHEMES = [];
  let loadState = 'loading'; // 'loading' | 'ready' | 'error'

  async function loadAdminSchemes() {
    loadState = 'loading';
    render();
    try {
      const AI_PROXY_BASE = window.GAON_SATHI_API_BASE || "";
      const res = await fetch(`${AI_PROXY_BASE}/api/schemes`);
      if (!res.ok) throw new Error('bad response');
      const items = await res.json();
      SCHEMES = Array.isArray(items) ? items.map(adminItemToCard) : [];
      loadState = 'ready';
    } catch (err) {
      // Gaon Sathi server isn't running / unreachable.
      SCHEMES = [];
      loadState = 'error';
    }
    render();
  }

  // ------------------------------------------------------------------
  //  RENDER
  // ------------------------------------------------------------------
  function isEnglish() { return document.documentElement.lang === 'en'; }

  function cardHTML(item) {
    const en = isEnglish();
    const title       = en ? item.titleEn : item.title;
    const tagLbl      = en ? item.tagLabelEn : item.tagLabel;
    const benefit     = en ? item.benefitEn : item.benefit;
    const eligibility = en ? item.eligibilityEn : item.eligibility;
    const lastDate    = en ? item.lastDateEn : item.lastDate;
    const lastDateLbl = en ? 'Apply by' : 'आवेदन तिथि';
    const dl = daysUntil(lastDate);
    const isUrgent = dl !== null && dl >= 0 && dl <= 7;
    const newBadge = item.isNew && !isUrgent
      ? `<span class="yj-card-new">${en ? 'New' : 'नया'}</span>`
      : '';
    const urgentBadge = isUrgent
      ? `<span class="yj-card-urgent">${en ? `${dl}d left` : `${dl} दिन बाकी`}</span>`
      : '';
    const saved = isSaved(item.articleSlug);
    const saveBtn = item.articleSlug ? `
        <button type="button" class="yj-card-save${saved ? ' saved' : ''}" data-slug="${item.articleSlug}"
          aria-label="${en ? 'Save scheme' : 'योजना सेव करें'}" aria-pressed="${saved}">
          <span class="ic-off">🤍</span><span class="ic-on">❤️</span>
        </button>` : '';
    // Every scheme now comes from the admin panel, so this always opens
    // its full admin-written article page (yojna/article.html).
    const applyHref  = item.articleSlug ? `yojna/article.html?slug=${encodeURIComponent(item.articleSlug)}` : item.url;
    const applyLabel = item.articleSlug
      ? (en ? 'View Full Details →' : 'पूरी जानकारी देखें →')
      : (en ? 'Apply / Learn More →' : 'आवेदन करें / जानें →');
    const applyTarget = item.articleSlug ? '' : ' target="_blank" rel="noopener"';
    return `
      <div class="yj-card" data-tag="${item.tag}" style="--tile:${item.tile}">
        ${saveBtn}
        <div class="yj-card-top">
          <div class="yj-card-ic">${item.icon}</div>
          <div class="yj-card-badges">
            <span class="yj-card-tag">${tagLbl}</span>
            ${urgentBadge || newBadge}
          </div>
        </div>
        <h4>${title}</h4>
        <ul class="yj-points">
          <li><span class="yj-point-ic">✅</span><span class="yj-point-txt">${benefit}</span></li>
          <li><span class="yj-point-ic">✔️</span><span class="yj-point-txt">${eligibility}</span></li>
          <li><span class="yj-point-ic">📅</span><span class="yj-point-txt"><b>${lastDateLbl}:</b> ${lastDate}</span></li>
        </ul>
        <a class="yj-apply" href="${applyHref}"${applyTarget}>${applyLabel}</a>
      </div>`;
  }

  function activeTag() {
    const activeChip = chipsWrap.querySelector('.chip.active');
    return activeChip ? activeChip.dataset.tag : 'all';
  }

  function filteredSchemes() {
    const tag = activeTag();
    const en = isEnglish();
    const q = searchQuery.trim().toLowerCase();
    return SCHEMES
      .filter(item => tag === 'all' || item.tag === tag)
      .filter(item => {
        if (!q) return true;
        const haystack = [
          item.title, item.titleEn, item.benefit, item.benefitEn,
          item.eligibility, item.eligibilityEn, item.tagLabel, item.tagLabelEn
        ].join(' ').toLowerCase();
        return haystack.includes(q);
      })
      // "🆕 नई सबसे पहले" — new-launch schemes float to the top, otherwise
      // keep the curated order above.
      .sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  function render() {
    const en = isEnglish();

    // Still waiting on the admin API — show shimmering skeleton cards
    // (same grid shape as real cards) instead of a plain text line, so
    // the page feels fast and nothing jumps once real cards arrive.
    if (loadState === 'loading') {
      const skeletonCard = `
        <div class="yj-skel">
          <div class="yj-skel-row yj-skel-ic"></div>
          <div class="yj-skel-row yj-skel-title"></div>
          <div class="yj-skel-row yj-skel-line"></div>
          <div class="yj-skel-row yj-skel-line"></div>
          <div class="yj-skel-row yj-skel-line short"></div>
        </div>`;
      listEl.innerHTML = skeletonCard.repeat(6);
      if (emptyEl) emptyEl.hidden = true;
      if (countEl) countEl.textContent = en ? 'Loading…' : 'लोड हो रहा है…';
      if (loadMoreWrap) loadMoreWrap.classList.add('hidden');
      return;
    }

    // Server unreachable — say so clearly instead of showing a
    // silently-empty grid.
    if (loadState === 'error') {
      listEl.innerHTML = '';
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = en
          ? "Couldn't load schemes — the Gaon Sathi server may not be running."
          : 'योजनाएं लोड नहीं हो पाईं — शायद Gaon Sathi server चालू नहीं है।';
      }
      if (countEl) countEl.textContent = en ? '⚠️ Couldn\'t load' : '⚠️ लोड नहीं हो पाया';
      if (loadMoreWrap) loadMoreWrap.classList.add('hidden');
      return;
    }

    const all = filteredSchemes();
    const shown = all.slice(0, visibleCount);

    listEl.innerHTML = shown.map(cardHTML).join('');

    if (emptyEl) {
      emptyEl.hidden = all.length !== 0;
      if (all.length === 0 && SCHEMES.length > 0) {
        emptyEl.textContent = en
          ? '😕 No schemes found. Try a different search or filter.'
          : '😕 कोई योजना नहीं मिली। दूसरा शब्द या फ़िल्टर आज़माएं।';
      } else {
        emptyEl.textContent = en
          ? 'No schemes here yet — check back soon.'
          : 'अभी यहां कोई योजना नहीं है — जल्द जुड़ेंगी।';
      }
    }

    if (countEl) {
      countEl.textContent = en
        ? `🔎 ${all.length} scheme${all.length === 1 ? '' : 's'} found`
        : `🔎 ${all.length} योजनाएं मिलीं`;
    }

    if (loadMoreWrap) {
      loadMoreWrap.classList.toggle('hidden', visibleCount >= all.length);
    }
  }
  window.renderYojna = render; // hooked into the language toggle, see js/fx.js

  // ------------------------------------------------------------------
  //  FILTER CHIPS  (ResultRush-style: scrollable row + mobile expand)
  // ------------------------------------------------------------------
  // NOTE: js/script.js (shared) already has its own click listener on
  // these same .chip buttons that toggles the "active" class — that
  // file is intentionally left untouched. So this listener does NOT
  // touch the "active" class itself (that would double up / race with
  // script.js) — it only reacts by re-reading whichever chip is
  // active and re-rendering. No early-return guard here on purpose:
  // by the time this fires, script.js's listener (registered first,
  // since js/script.js loads before this file) has usually already
  // flipped the class, so checking "is this chip active" here would
  // often be wrong.
  let isAutoScrolling = false; // guards the scroll-collapse listener against our own smooth-scrolls

  function flashChip(chip) {
    chipsWrap.querySelectorAll('.chip--flash').forEach(el => {
      el.classList.remove('chip--flash');
      clearTimeout(el._flashTimer);
    });
    chip.classList.add('chip--flash');
    chip._flashTimer = setTimeout(() => chip.classList.remove('chip--flash'), 900);
  }

  function collapseFilterExpand() {
    if (isAutoScrolling || !expandBtn) return;
    if (!chipsWrap.classList.contains('yj-chips--expanded')) return;
    const en = isEnglish();
    chipsWrap.classList.remove('yj-chips--expanded');
    expandBtn.setAttribute('aria-expanded', 'false');
    if (expandLabel) expandLabel.textContent = en ? 'All Filters' : 'सभी फ़िल्टर';

    const activeChip = chipsWrap.querySelector('.chip.active');
    if (activeChip) {
      requestAnimationFrame(() => {
        const wrapRect = chipsWrap.getBoundingClientRect();
        const chipRect = activeChip.getBoundingClientRect();
        const target = chipsWrap.scrollLeft + (chipRect.left - wrapRect.left) - (wrapRect.width / 2) + (chipRect.width / 2);
        chipsWrap.scrollTo({ left: target, behavior: 'smooth' });
      });
    }
  }

  chipsWrap.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      visibleCount = PAGE_SIZE;
      render();

      isAutoScrolling = true;
      if (chipsWrap.classList.contains('yj-chips--expanded')) {
        chip.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const wrapRect = chipsWrap.getBoundingClientRect();
        const chipRect = chip.getBoundingClientRect();
        const target = chipsWrap.scrollLeft + (chipRect.left - wrapRect.left) - (wrapRect.width / 2) + (chipRect.width / 2);
        chipsWrap.scrollTo({ left: target, behavior: 'smooth' });
      }
      clearTimeout(window._yjScrollGuardTimer);
      window._yjScrollGuardTimer = setTimeout(() => { isAutoScrolling = false; }, 500);

      flashChip(chip);
    });
  });

  // Expand / collapse toggle (mobile "सभी फ़िल्टर")
  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      const en = isEnglish();
      const isExpanded = chipsWrap.classList.toggle('yj-chips--expanded');
      expandBtn.setAttribute('aria-expanded', String(isExpanded));
      if (expandLabel) expandLabel.textContent = isExpanded ? (en ? 'Collapse' : 'समेटें') : (en ? 'All Filters' : 'सभी फ़िल्टर');

      if (isExpanded) {
        const activeChip = chipsWrap.querySelector('.chip.active');
        if (activeChip) {
          isAutoScrolling = true;
          setTimeout(() => {
            activeChip.scrollIntoView({ behavior: 'smooth', block: 'center' });
            flashChip(activeChip);
            clearTimeout(window._yjScrollGuardTimer);
            window._yjScrollGuardTimer = setTimeout(() => { isAutoScrolling = false; }, 500);
          }, 50);
        }
      }
    });
  }

  // Auto-collapse the grid when the user scrolls the page
  let yjScrollTimer;
  window.addEventListener('scroll', () => {
    clearTimeout(yjScrollTimer);
    yjScrollTimer = setTimeout(collapseFilterExpand, 80);
  }, { passive: true });

  // ------------------------------------------------------------------
  //  LOAD MORE
  // ------------------------------------------------------------------
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      render();
    });
  }

  // ------------------------------------------------------------------
  //  SEARCH BOX — filters as you type; clear button resets it.
  // ------------------------------------------------------------------
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value || '';
      if (searchClear) searchClear.hidden = !searchQuery;
      visibleCount = PAGE_SIZE;
      render();
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchQuery = '';
      if (searchInput) { searchInput.value = ''; searchInput.focus(); }
      searchClear.hidden = true;
      visibleCount = PAGE_SIZE;
      render();
    });
  }

  // ------------------------------------------------------------------
  //  SAVE / BOOKMARK — delegated so it works for every re-rendered card.
  // ------------------------------------------------------------------
  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.yj-card-save');
    if (!btn) return;
    const nowSaved = toggleSaved(btn.dataset.slug);
    btn.classList.toggle('saved', nowSaved);
    btn.setAttribute('aria-pressed', String(nowSaved));
  });

  // ------------------------------------------------------------------
  //  INITIAL LOAD — everything comes from the admin API now, so the
  //  first render happens once that fetch settles (loadAdminSchemes
  //  itself renders the loading state immediately, then the real one).
  // ------------------------------------------------------------------
  loadAdminSchemes();

  // Support being linked to directly as index.html#yojna (used by
  // yojna/article.html's "← सभी योजनाएं" back link) by switching to
  // this section once everything has finished loading. Sections are
  // hidden-by-default (only .active shows, see css/style.css), so
  // without this the browser's native #yojna anchor jump would land
  // on a hidden section behind whichever one is active by default.
  window.addEventListener('load', () => {
    if (window.location.hash === '#yojna' && typeof window.showSection === 'function') {
      window.showSection('yojna');
    }
  });
})();
