// ======================================================================
//  योजना Admin Panel — logic
//  Talks to /api/schemes... (see server/server.js). Auth is a single
//  shared password (server/.env → ADMIN_PASSWORD) sent as the
//  "x-admin-key" header on every write/list-all request. Kept in
//  sessionStorage so it clears when the browser tab is closed.
// ======================================================================

(function () {
  const KEY_STORAGE = 'gs_admin_key';

  const loginSection = document.getElementById('admLogin');
  const dashSection  = document.getElementById('admDash');
  const formWrap     = document.getElementById('admFormWrap');
  const logoutBtn    = document.getElementById('admLogoutBtn');

  const passwordInput = document.getElementById('admPassword');
  const loginBtn       = document.getElementById('admLoginBtn');
  const loginError     = document.getElementById('admLoginError');

  const listEl   = document.getElementById('admList');
  const newBtn   = document.getElementById('admNewBtn');

  const form        = document.getElementById('admForm');
  const formTitle   = document.getElementById('admFormTitle');
  const formError   = document.getElementById('admFormError');
  const closeBtn    = document.getElementById('admFormClose');
  const cancelBtn   = document.getElementById('admCancelBtn');
  const faqListEl   = document.getElementById('admFaqList');
  const addFaqBtn   = document.getElementById('admAddFaqBtn');

  function getKey() {
    try { return sessionStorage.getItem(KEY_STORAGE) || ''; } catch (e) { return ''; }
  }
  function setKey(key) {
    try { sessionStorage.setItem(KEY_STORAGE, key); } catch (e) {}
  }
  function clearKey() {
    try { sessionStorage.removeItem(KEY_STORAGE); } catch (e) {}
  }

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---- SCREEN SWITCHING ----
  function showDashboard() {
    loginSection.hidden = true;
    dashSection.hidden = false;
    formWrap.hidden = true;
    logoutBtn.hidden = false;
    loadList();
  }
  function showLogin() {
    loginSection.hidden = false;
    dashSection.hidden = true;
    formWrap.hidden = true;
    logoutBtn.hidden = true;
  }

  // ---- LOGIN ----
  async function tryLogin(password) {
    loginError.hidden = true;
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.ok) {
        setKey(password);
        showDashboard();
      } else {
        loginError.textContent = 'गलत पासवर्ड। दोबारा कोशिश करें।';
        loginError.hidden = false;
      }
    } catch (err) {
      loginError.textContent = 'सर्वर से जुड़ नहीं पाया। क्या Gaon Sathi server चालू है?';
      loginError.hidden = false;
    }
  }
  loginBtn.addEventListener('click', () => {
    const pw = passwordInput.value.trim();
    if (pw) {
      tryLogin(pw);
    } else {
      loginError.textContent = 'पहले पासवर्ड डालें।';
      loginError.hidden = false;
      passwordInput.focus();
    }
  });
  passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });

  logoutBtn.addEventListener('click', () => { clearKey(); showLogin(); });

  // ---- LOAD LIST ----
  async function loadList() {
    listEl.innerHTML = '<p class="adm-empty">लोड हो रहा है…</p>';
    try {
      const res = await fetch('/api/schemes?all=1', { headers: { 'x-admin-key': getKey() } });
      if (res.status === 401) { clearKey(); showLogin(); return; }
      const items = await res.json();
      renderList(items);
    } catch (err) {
      listEl.innerHTML = '<p class="adm-empty">सूची लोड नहीं हो पाई।</p>';
    }
  }

  function renderList(items) {
    if (!items.length) {
      listEl.innerHTML = '<p class="adm-empty">अभी कोई योजना नहीं जोड़ी गई है। "+ नई योजना जोड़ें" दबाएं।</p>';
      return;
    }
    listEl.innerHTML = items.map(item => `
      <div class="adm-row" data-slug="${esc(item.slug)}">
        <div class="adm-row-ic">${item.icon || '📋'}</div>
        <div class="adm-row-main">
          <div class="adm-row-title">${esc(item.title)}</div>
          <div class="adm-row-meta">/${esc(item.slug)}</div>
        </div>
        <span class="adm-badge ${item.published !== false ? 'pub' : 'draft'}">${item.published !== false ? 'प्रकाशित' : 'ड्राफ्ट'}</span>
        <div class="adm-row-actions">
          <button type="button" class="edit">✏️ बदलें</button>
          <button type="button" class="del">🗑️ हटाएं</button>
        </div>
      </div>`).join('');

    listEl.querySelectorAll('.adm-row').forEach(row => {
      const slug = row.dataset.slug;
      row.querySelector('.edit').addEventListener('click', () => openEdit(slug));
      row.querySelector('.del').addEventListener('click', () => deleteItem(slug));
    });
  }

  async function deleteItem(slug) {
    if (!confirm('क्या आप वाकई इस योजना को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/schemes/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': getKey() }
      });
      if (res.status === 401) { clearKey(); showLogin(); return; }
      loadList();
    } catch (err) {
      alert('हटाने में समस्या हुई।');
    }
  }

  // ---- FAQ ROWS ----
  function faqRowHTML(i, faq) {
    faq = faq || {};
    return `
      <div class="adm-faq-row" data-i="${i}">
        <button type="button" class="adm-faq-remove" aria-label="हटाएं">✕</button>
        <div class="adm-grid2">
          <label>सवाल (हिंदी)<input type="text" class="faq_q" value="${esc(faq.q)}"></label>
          <label>Question (English)<input type="text" class="faq_qEn" value="${esc(faq.qEn)}"></label>
        </div>
        <div class="adm-grid2">
          <label>जवाब (हिंदी)<textarea class="faq_a" rows="2">${esc(faq.a)}</textarea></label>
          <label>Answer (English)<textarea class="faq_aEn" rows="2">${esc(faq.aEn)}</textarea></label>
        </div>
      </div>`;
  }
  function addFaqRow(faq) {
    const div = document.createElement('div');
    div.innerHTML = faqRowHTML(faqListEl.children.length, faq);
    const row = div.firstElementChild;
    row.querySelector('.adm-faq-remove').addEventListener('click', () => row.remove());
    faqListEl.appendChild(row);
  }
  addFaqBtn.addEventListener('click', () => addFaqRow());

  function collectFaqs() {
    return Array.from(faqListEl.querySelectorAll('.adm-faq-row')).map(row => ({
      q: row.querySelector('.faq_q').value.trim(),
      qEn: row.querySelector('.faq_qEn').value.trim(),
      a: row.querySelector('.faq_a').value.trim(),
      aEn: row.querySelector('.faq_aEn').value.trim()
    })).filter(f => f.q && f.a);
  }

  // ---- FORM OPEN/CLOSE ----
  const fields = ['title', 'titleEn', 'tag', 'icon', 'officialLink', 'ministry', 'ministryEn',
    'oneLineSummary', 'oneLineSummaryEn', 'description', 'descriptionEn', 'benefit', 'benefitEn', 'lastDate', 'lastDateEn',
    'eligibility', 'eligibilityEn', 'documentsRequired', 'documentsRequiredEn',
    'howToApply', 'howToApplyEn'];

  function resetForm() {
    document.getElementById('f_slug').value = '';
    fields.forEach(f => { document.getElementById('f_' + f).value = ''; });
    document.getElementById('f_isNew').checked = false;
    document.getElementById('f_published').checked = true;
    document.getElementById('f_lastDate').value = 'चालू — कभी भी आवेदन करें';
    document.getElementById('f_lastDateEn').value = 'Ongoing — apply anytime';
    faqListEl.innerHTML = '';
    formError.hidden = true;
  }

  function openNew() {
    resetForm();
    formTitle.textContent = 'नई योजना जोड़ें';
    dashSection.hidden = true;
    formWrap.hidden = false;
  }

  function openEdit(slug) {
    fetch(`/api/schemes/${encodeURIComponent(slug)}`, { headers: { 'x-admin-key': getKey() } })
      .then(r => r.json())
      .then(item => {
        resetForm();
        formTitle.textContent = 'योजना बदलें';
        document.getElementById('f_slug').value = item.slug || '';
        fields.forEach(f => { document.getElementById('f_' + f).value = item[f] || ''; });
        document.getElementById('f_isNew').checked = !!item.isNew;
        document.getElementById('f_published').checked = item.published !== false;
        (item.faqs || []).forEach(addFaqRow);
        dashSection.hidden = true;
        formWrap.hidden = false;
      })
      .catch(() => alert('योजना लोड नहीं हो पाई।'));
  }

  newBtn.addEventListener('click', openNew);
  closeBtn.addEventListener('click', showDashboard);
  cancelBtn.addEventListener('click', showDashboard);

  // ---- SAVE ----
  form.addEventListener('submit', async e => {
    e.preventDefault();
    formError.hidden = true;

    const body = {};
    fields.forEach(f => { body[f] = document.getElementById('f_' + f).value.trim(); });
    body.isNew = document.getElementById('f_isNew').checked;
    body.published = document.getElementById('f_published').checked;
    body.faqs = collectFaqs();

    if (!body.title) {
      formError.textContent = 'शीर्षक (हिंदी) भरना ज़रूरी है।';
      formError.hidden = false;
      return;
    }

    const slug = document.getElementById('f_slug').value;
    const url = slug ? `/api/schemes/${encodeURIComponent(slug)}` : '/api/schemes';
    const method = slug ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() }
      , body: JSON.stringify(body) });
      if (res.status === 401) { clearKey(); showLogin(); return; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        formError.textContent = err.error || 'सेव नहीं हो पाया।';
        formError.hidden = false;
        return;
      }
      showDashboard();
    } catch (err) {
      formError.textContent = 'सर्वर से जुड़ नहीं पाया।';
      formError.hidden = false;
    }
  });

  // ---- INIT ----
  const savedKey = getKey();
  if (savedKey) {
    // Verify the stored key is still valid before showing the dashboard.
    fetch('/api/schemes?all=1', { headers: { 'x-admin-key': savedKey } })
      .then(res => { if (res.status === 401) { clearKey(); showLogin(); } else { showDashboard(); } })
      .catch(() => showLogin());
  } else {
    showLogin();
  }
})();
