// ======================================================================
//  योजना विवरण पेज — SECTION-ONLY SCRIPT
//  Reads ?slug=... from the URL, fetches that scheme from the admin
//  API (GET /api/schemes/:slug) and renders it. All content comes from
//  the admin panel (admin/admin.html) — nothing scheme-specific is
//  hardcoded here (except a few generic, non-scheme-specific trust/
//  safety notes, same as any real govt-scheme info site shows on
//  every article regardless of which scheme it is).
//
//  Layout/components are modeled directly on ResultRush.in's article
//  page (quick-info header+grid card, checklist boxes, howto-box with
//  trust note, common-mistakes card, source line) — recolored to
//  Gaon Sathi's own palette per scheme category.
// ======================================================================

(function () {
  const wrap = document.getElementById('artWrap');
  if (!wrap) return;

  const STORAGE_KEY = 'gs_lang';
  function isEnglish() {
    let saved = 'hi';
    try { saved = localStorage.getItem(STORAGE_KEY) || 'hi'; } catch (e) {}
    return saved === 'en';
  }

  const TAG_META = {
    farmer:     { label: 'किसान',        labelEn: 'Farmer',            tile: 'var(--green)',      tileLt: 'var(--green-light)' },
    women:      { label: 'महिला',        labelEn: 'Women',             tile: 'var(--pink)',       tileLt: 'var(--pink-light)' },
    student:    { label: 'छात्र',        labelEn: 'Student',           tile: 'var(--sky)',        tileLt: 'var(--sky-light)' },
    elder:      { label: 'बुज़ुर्ग',      labelEn: 'Elderly',           tile: 'var(--soil)',       tileLt: 'var(--soil-light)' },
    health:     { label: 'स्वास्थ्य',     labelEn: 'Health',            tile: 'var(--brick)',      tileLt: 'var(--brick-light)' },
    housing:    { label: 'आवास',         labelEn: 'Housing',           tile: 'var(--saffron-dark)', tileLt: 'var(--cream2)' },
    employment: { label: 'रोज़गार',       labelEn: 'Jobs & Business',   tile: 'var(--green-mid)',  tileLt: 'var(--green-light)' },
    welfare:    { label: 'राशन/कल्याण',  labelEn: 'Ration/Welfare',    tile: 'var(--soil)',       tileLt: 'var(--soil-light)' },
    disability: { label: 'दिव्यांग',      labelEn: 'Disabled',          tile: 'var(--pink)',       tileLt: 'var(--pink-light)' }
  };

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Admin types one point per line in a textarea — turn that into a
  // clean array of points for lists/steps.
  function toPoints(str) {
    if (!str) return [];
    return String(str).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  function getSlug() {
    return new URLSearchParams(window.location.search).get('slug') || '';
  }

  function hostnameOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  }

  function formatDate(iso, en) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(en ? 'en-IN' : 'hi-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return ''; }
  }

  function daysUntil(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d)) return null;
    return Math.ceil((d - new Date()) / 86400000);
  }

  // ── Smart icon picker — scans a checklist point's text (Hindi + English)
  //  and returns the single most meaningful icon for it, so a reader can
  //  scan the icon column alone and get the gist, instead of one repeated
  //  generic bullet. Falls back to the section's default icon. ──────────
  const ICON_RULES = [
    [/aadhaar|आधार/i, '🆔'],
    [/pan\s?card|पैन/i, '💳'],
    [/voter/i, '🗳️'],
    [/ration\s?card|राशन/i, '🍚'],
    [/caste|जाति/i, '📜'],
    [/income\s?certificate|आय\s?प्रमाण/i, '📄'],
    [/birth\s?certificate|जन्म/i, '👶'],
    [/disab|divyang|विकलांग|handicap/i, '♿'],
    [/photo|फोटो/i, '📷'],
    [/bank|passbook|खाता|खाते/i, '🏦'],
    [/mobile|phone|मोबाइल/i, '📱'],
    [/address|domicile|residen|निवास|पता/i, '🏠'],
    [/land|khasra|khatauni|ज़मीन|जमीन|भूमि|खसरा|खतौनी/i, '🌾'],
    [/age|उम्र|आयु|years? old/i, '🎂'],
    [/income|आय/i, '💵'],
    [/pregnan|गर्भवती/i, '🤰'],
    [/widow|विधवा/i, '👵'],
    [/senior citizen|बुजुर्ग|बुज़ुर्ग|elderly|60\s?years/i, '👴'],
    [/women|female|महिला|बेटी|बेटियों/i, '👩'],
    [/student|छात्र|स्कूल/i, '🎓'],
    [/unemploy|बेरोजगार/i, '🧑\u200d💼'],
    [/farmer|किसान|kisan/i, '🌾'],
    [/bpl|below poverty|गरीब/i, '🏚️'],
    [/family|परिवार/i, '👨\u200d👩\u200d👧']
  ];
  function smartIcon(text, fallback) {
    if (!text) return fallback;
    for (const [re, ic] of ICON_RULES) if (re.test(text)) return ic;
    return fallback;
  }

  let currentArticle = null;

  // ------------------------------------------------------------------
  //  SAVED / BOOKMARKED SCHEMES — same localStorage key as the listing
  //  page (yojna/yojna.js), so saving here shows up as saved there too.
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

  // ---- Breadcrumb ----
  function breadcrumbHTML(title, en) {
    return `
      <nav class="art-breadcrumb" aria-label="Breadcrumb">
        <a href="../index.html#home">${en ? 'Home' : 'होम'}</a>
        <span class="art-breadcrumb-sep">›</span>
        <a href="../index.html#yojna">${en ? 'Schemes' : 'योजनाएं'}</a>
        <span class="art-breadcrumb-sep">›</span>
        <span class="art-breadcrumb-current">${esc(title)}</span>
      </nav>`;
  }

  // ---- Description ("About this scheme") — real explanatory text, not
  // just the one-line summary, so a reader actually understands what the
  // scheme is and how it works before jumping into facts/eligibility. ----
  function descriptionHTML(a, en) {
    const desc = en ? (a.descriptionEn || a.description) : a.description;
    if (!desc) return '';
    const paras = toPoints(desc).map(p => `<p>${esc(p)}</p>`).join('');
    return `
      <div class="art-section">
        <div class="art-section__title">📖 ${en ? 'About this scheme' : 'यह योजना क्या है'}</div>
        <div class="art-description">${paras}</div>
      </div>`;
  }

  // ---- Quick Info Card: hero stat (benefit) + header strip + clean
  //  vertical rows + CTA. The benefit amount is the single most
  //  persuasive fact on the page, so it gets its own prominent stat
  //  block instead of being buried as just another row in the list. ----
  function quickInfoHTML(a, en, meta, title) {
    const items = [];
    function addItem(icon, label, value, opts) {
      if (value === undefined || value === null || value === '') return;
      opts = opts || {};
      items.push({ icon, label, value: String(value), urgent: !!opts.urgent });
    }

    const ministry = en ? a.ministryEn : a.ministry;
    addItem('🏛️', en ? 'Department' : 'विभाग', ministry);

    const dl = daysUntil(a.lastDate);
    const lastDateRaw = en ? a.lastDateEn : a.lastDate;
    addItem('📅', en ? 'Apply by' : 'आवेदन तिथि', lastDateRaw,
      { urgent: dl !== null && dl <= 7 && dl >= 0 });

    const benefit = en ? (a.benefitEn || a.benefit) : a.benefit;
    const statHtml = benefit ? `
      <div class="qi-stat">
        <span class="qi-stat__icon">🎁</span>
        <div class="qi-stat__body">
          <div class="qi-stat__label">${en ? 'You get' : 'आपको क्या मिलेगा'}</div>
          <div class="qi-stat__value">${esc(benefit)}</div>
        </div>
      </div>` : '';

    const rowsHtml = items.map(it => {
      const cls = 'qi-row' + (it.urgent ? ' qi-row--urgent' : '');
      return `<div class="${cls}">
        <span class="qi-row__icon">${it.icon}</span>
        <div class="qi-row__body">
          <div class="qi-row__label">${esc(it.label)}</div>
          <div class="qi-row__value">${esc(it.value)}</div>
        </div>
      </div>`;
    }).join('');

    const ctas = a.officialLink
      ? `<a href="${esc(a.officialLink)}" target="_blank" rel="noopener" class="qi-cta qi-cta--primary">${en ? 'Apply Now' : 'आवेदन करें'} <span class="qi-cta__arrow">→</span></a>`
      : '';

    return `
      <div class="qi-card">
        <div class="qi-card__header">
          <span class="qi-card__header-icon">${a.icon || '🏛️'}</span>
          <span class="qi-card__header-title">${en ? 'Scheme Details' : 'योजना विवरण'}</span>
          <span class="qi-card__header-cat">${en ? meta.labelEn : meta.label}</span>
        </div>
        ${statHtml}
        ${rowsHtml ? `<div class="qi-rows">${rowsHtml}</div>` : ''}
        ${ctas ? `<div class="qi-ctas">${ctas}</div>` : ''}
      </div>`;
  }

  // ---- Eligibility + Documents checklist (two columns) ----
  function checklistHTML(a, en) {
    const eligPoints = toPoints(en ? (a.eligibilityEn || a.eligibility) : a.eligibility);
    const docPoints  = toPoints(en ? (a.documentsRequiredEn || a.documentsRequired) : a.documentsRequired);
    if (!eligPoints.length && !docPoints.length) return '';

    function box(title, icon, points, fallbackIcon, kind) {
      if (!points.length) return '';
      const items = points.map(p => `<li><span class="checklist-box__icon">${smartIcon(p, fallbackIcon)}</span><span class="checklist-box__text">${esc(p)}</span></li>`).join('');
      return `<div class="checklist-box checklist-box--${kind}">
        <div class="checklist-box__title">${icon} ${title}</div>
        <ul class="checklist-box__items">${items}</ul>
      </div>`;
    }

    const eligCol = box(en ? 'Am I eligible?' : 'इसके लिए कौन पात्र है', '✅', eligPoints, '✔️', 'elig');
    const docCol  = box(en ? 'Documents needed' : 'ज़रूरी दस्तावेज़', '📄', docPoints, '🔸', 'doc');
    const inner = (eligCol && docCol) ? `<div class="art-checklist-grid">${eligCol}${docCol}</div>` : (eligCol || docCol);

    return `<div class="art-section">${inner}</div>`;
  }

  // ---- How to apply: steps + trust/fee note ----
  function howToHTML(a, en) {
    const steps = toPoints(en ? (a.howToApplyEn || a.howToApply) : a.howToApply);
    if (!steps.length) return '';
    const hostname = hostnameOf(a.officialLink);

    const stepsHtml = steps.map(s => `<li><span class="howto-step__text">${esc(s)}</span></li>`).join('');
    const trustNote = en
      ? `Applying is <strong>free</strong> — never pay anyone, not even an "agent".${hostname ? ` Apply only on <strong>${esc(hostname)}</strong>.` : ''}`
      : `आवेदन करना <strong>बिल्कुल मुफ़्त</strong> है — किसी को भी, किसी "एजेंट" को भी पैसे न दें।${hostname ? ` सिर्फ़ <strong>${esc(hostname)}</strong> पर ही आवेदन करें।` : ''}`;

    return `
      <div class="art-section">
        <div class="art-section__title">📝 ${en ? 'How to apply' : 'आवेदन कैसे करें'}</div>
        <ol class="howto-box__steps">${stepsHtml}</ol>
        <div class="help-note-box"><span>🛡️</span><span>${trustNote}</span></div>
      </div>`;
  }

  // ---- FAQ ----
  function faqHTML(faqs, en) {
    if (!faqs || !faqs.length) return '';
    const items = faqs.map((f, i) => {
      const q = en ? (f.qEn || f.q) : f.q;
      const a = en ? (f.aEn || f.a) : f.a;
      if (!q || !a) return '';
      return `
        <div class="art-faq-item" data-faq="${i}">
          <div class="art-faq-q"><span>${esc(q)}</span><span class="art-faq-arrow">+</span></div>
          <div class="art-faq-a">${esc(a)}</div>
        </div>`;
    }).join('');
    if (!items) return '';
    return `
      <div class="art-section">
        <div class="art-section__title">❓ ${en ? 'Frequently Asked Questions' : 'अक्सर पूछे जाने वाले सवाल'}</div>
        ${items}
      </div>`;
  }

  // ---- Source & last updated ----
  function sourceHTML(a, en) {
    const hostname = hostnameOf(a.officialLink);
    const updated = a.updatedAt ? formatDate(a.updatedAt, en) : '';
    if (!hostname && !updated) return '';
    return `
      <div class="scheme-source">
        ${hostname ? `<strong>${en ? 'Source' : 'स्रोत'}:</strong> ${esc(hostname)} (${en ? 'official government website' : 'आधिकारिक सरकारी वेबसाइट'}). ` : ''}
        ${updated ? `<strong>${en ? 'Last checked' : 'अंतिम जांच'}:</strong> ${esc(updated)}.` : ''}
      </div>`;
  }

  function render() {
    const a = currentArticle;
    if (!a) return;
    const en = isEnglish();
    document.documentElement.lang = en ? 'en' : 'hi';

    const meta = TAG_META[a.tag] || { label: a.tag || '', labelEn: a.tag || '', tile: 'var(--accent)', tileLt: 'var(--cream2)' };
    const title = en ? (a.titleEn || a.title) : a.title;
    const ministry = en ? a.ministryEn : a.ministry;
    const summary = en ? (a.oneLineSummaryEn || a.oneLineSummary) : a.oneLineSummary;
    const updated = a.updatedAt ? formatDate(a.updatedAt, en) : '';

    document.title = `${title} | Gaon Sathi`;

    // Meta row: department, apply-by date, last-updated — small muted
    // icon+text items, same pattern as ResultRush's article-meta row.
    const metaItems = [];
    if (ministry) metaItems.push(['🏛️', ministry]);
    const lastDateRaw = en ? a.lastDateEn : a.lastDate;
    if (lastDateRaw) metaItems.push(['📅', (en ? 'Apply by ' : 'आवेदन तिथि: ') + lastDateRaw]);
    if (updated) metaItems.push(['🕒', (en ? 'Updated ' : 'अपडेट: ') + updated]);
    const metaHtml = metaItems.map(([ic, txt]) =>
      `<span class="art-meta-item"><span class="art-meta-item__icon">${ic}</span>${esc(txt)}</span>`).join('');

    // Actions row: WhatsApp share + copy link — sits right under the
    // meta row, near the top, instead of buried at the bottom.
    const shareText = en
      ? `${title} — ${a.benefitEn || a.benefit || ''}\nSee full details: ${window.location.href}`
      : `${title} — ${a.benefit || ''}\nपूरी जानकारी यहां देखें: ${window.location.href}`;
    const saved = isSaved(a.slug);
    const actionsHtml = `
      <div class="art-actions">
        <a href="https://wa.me/?text=${encodeURIComponent(shareText)}" target="_blank" rel="noopener" class="art-btn art-btn--whatsapp">📤 WhatsApp ${en ? 'Share' : 'पर शेयर करें'}</a>
        <button class="art-btn" id="artCopyLinkBtn" type="button">🔗 ${en ? 'Copy Link' : 'लिंक कॉपी करें'}</button>
        <button class="art-btn${saved ? ' saved' : ''}" id="artSaveBtn" type="button" aria-pressed="${saved}">
          ${saved ? '❤️' : '🤍'} ${saved ? (en ? 'Saved' : 'सेव किया') : (en ? 'Save' : 'सेव करें')}
        </button>
      </div>`;

    wrap.style.setProperty('--tile', meta.tile);
    wrap.style.setProperty('--tile-lt', meta.tileLt);
    wrap.innerHTML = `
      ${breadcrumbHTML(title, en)}

      <div class="art-layout">
        <div class="art-hero-block">
          <div class="art-hero-block__ribbon" aria-hidden="true"></div>
          <div class="art-emblem" aria-hidden="true">${a.icon || '📋'}</div>
          <div class="art-eyebrow">🛡️ ${en ? 'Verified Government Scheme' : 'सत्यापित सरकारी योजना'}</div>
          <div class="art-hero-badges">
            <span class="art-tag">${en ? meta.labelEn : meta.label}</span>
            ${a.isNew ? `<span class="art-new">${en ? 'New' : 'नया'}</span>` : ''}
          </div>
          <h1>${esc(title)}</h1>
          ${metaHtml ? `<div class="art-meta">${metaHtml}</div>` : ''}
          ${actionsHtml}
          ${summary ? `<div class="art-summary" style="margin-top:14px;">${esc(summary)}</div>` : ''}
        </div>

        <aside class="art-sidebar">
          ${quickInfoHTML(a, en, meta, title)}
        </aside>

        <div class="art-main">
          <div class="art-shell">
            ${descriptionHTML(a, en)}
            ${checklistHTML(a, en)}
            ${howToHTML(a, en)}
            ${faqHTML(a.faqs, en)}
          </div>
          <div id="artRelated"></div>
          ${sourceHTML(a, en)}
        </div>
      </div>
    `;

    wrap.querySelectorAll('.art-faq-q').forEach(q => {
      q.addEventListener('click', () => q.closest('.art-faq-item').classList.toggle('open'));
    });

    const copyBtn = document.getElementById('artCopyLinkBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          copyBtn.textContent = en ? '✅ Copied!' : '✅ कॉपी हो गया!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = `🔗 ${en ? 'Copy Link' : 'लिंक कॉपी करें'}`;
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      });
    }

    const saveBtn = document.getElementById('artSaveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const nowSaved = toggleSaved(a.slug);
        saveBtn.classList.toggle('saved', nowSaved);
        saveBtn.setAttribute('aria-pressed', String(nowSaved));
        saveBtn.innerHTML = `${nowSaved ? '❤️' : '🤍'} ${nowSaved ? (en ? 'Saved' : 'सेव किया') : (en ? 'Save' : 'सेव करें')}`;
      });
    }

    renderRelated(a, en);
  }

  // ---- Related schemes — same category, excluding this one, max 3 ----
  let allSchemesCache = null;
  async function renderRelated(a, en) {
    const holder = document.getElementById('artRelated');
    if (!holder) return;
    try {
      if (!allSchemesCache) {
        const res = await fetch('/api/schemes');
        allSchemesCache = res.ok ? await res.json() : [];
      }
      const related = allSchemesCache
        .filter(s => s.slug !== a.slug && s.tag === a.tag)
        .slice(0, 3);
      if (!related.length) { holder.innerHTML = ''; return; }

      const cards = related.map(s => {
        const meta = TAG_META[s.tag] || {};
        const rTitle = en ? (s.titleEn || s.title) : s.title;
        const rBenefit = en ? (firstLineOf(s.benefitEn) || firstLineOf(s.oneLineSummaryEn)) : (firstLineOf(s.benefit) || firstLineOf(s.oneLineSummary));
        return `
          <a class="art-related__card" href="article.html?slug=${encodeURIComponent(s.slug)}" style="--tile:${meta.tile || 'var(--accent)'}">
            <div class="art-related__ic">${s.icon || '📋'}</div>
            <div class="art-related__name">${esc(rTitle)}</div>
            ${rBenefit ? `<div class="art-related__benefit">${esc(rBenefit)}</div>` : ''}
            <div class="art-related__more">${en ? 'View details' : 'विवरण देखें'} <span>→</span></div>
          </a>`;
      }).join('');

      holder.innerHTML = `
        <div class="art-related">
          <div class="art-related__title">🔗 ${en ? 'You may also like' : 'ये योजनाएं भी देखें'}</div>
          <div class="art-related__grid">${cards}</div>
        </div>`;
    } catch (err) {
      holder.innerHTML = '';
    }
  }
  function firstLineOf(str) { return String(str || '').split(/\r?\n/)[0].trim(); }
  window.renderYojnaArticle = render; // re-rendered on language switch too, see below

  async function load() {
    const slug = getSlug();
    if (!slug) {
      wrap.innerHTML = `<p class="art-error">${isEnglish()
        ? 'No scheme selected. <a href="../index.html#yojna">← Back to all schemes</a>'
        : 'कोई योजना नहीं चुनी गई। <a href="../index.html#yojna">← सभी योजनाओं पर जाएं</a>'}</p>`;
      return;
    }
    try {
      const res = await fetch(`/api/schemes/${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error('not found');
      currentArticle = await res.json();
      render();
    } catch (err) {
      wrap.innerHTML = `<p class="art-error">${isEnglish()
        ? "This scheme's details couldn't be loaded — the page may have moved, or the site's server isn't running. <a href=\"../index.html#yojna\">← Back to all schemes</a>"
        : 'यह योजना लोड नहीं हो पाई — हो सकता है पेज हटा दिया गया हो, या साइट का सर्वर चालू न हो। <a href="../index.html#yojna">← सभी योजनाओं पर जाएं</a>'}</p>`;
    }
  }

  // Re-render in the newly picked language whenever the toggle is used.
  // fx.js owns the actual switching + storage + re-render call
  // (see window.renderYojnaArticle hookup above) — no listener needed
  // here, since a local one here used to race fx.js's own listener
  // and read localStorage before it was updated.

  load();

  // --------------------------------------------------------------
  //  MOBILE NAV (hamburger menu) — same look/behaviour as the nav on
  //  the section pages (index.html), reimplemented standalone here
  //  since this is a separate page and js/script.js's version assumes
  //  `main section` elements exist alongside #mainnav (they don't
  //  here — nav items are plain links back to index.html#section).
  // --------------------------------------------------------------
  (function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburger');
    const mainnavEl = document.getElementById('mainnav');
    const navOverlay = document.getElementById('navOverlay');
    if (!hamburgerBtn || !mainnavEl || !navOverlay) return;

    function setMenu(open) {
      mainnavEl.classList.toggle('open', open);
      hamburgerBtn.classList.toggle('open', open);
      navOverlay.classList.toggle('open', open);
      hamburgerBtn.setAttribute('aria-expanded', open);
    }

    hamburgerBtn.addEventListener('click', () => setMenu(!mainnavEl.classList.contains('open')));
    navOverlay.addEventListener('click', () => setMenu(false));
    document.addEventListener('click', e => {
      if (!mainnavEl.classList.contains('open')) return;
      if (mainnavEl.contains(e.target) || hamburgerBtn.contains(e.target)) return;
      setMenu(false);
    });
    window.addEventListener('scroll', () => {
      if (mainnavEl.classList.contains('open')) setMenu(false);
    }, { passive: true });
  })();
})();
