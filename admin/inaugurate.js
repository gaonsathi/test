// ======================================================================
//  उद्घाटन Admin — logic
//  Talks to /api/inaugurate/... (see server/server.js). Reuses the same
//  shared admin password + sessionStorage key as admin.js, so if you're
//  already logged into the योजना admin panel in this browser, you're
//  logged in here too.
// ======================================================================
(function () {
  const KEY_STORAGE = 'gs_admin_key';

  const loginSection = document.getElementById('admLogin');
  const dashSection  = document.getElementById('admDash');
  const logoutBtn    = document.getElementById('admLogoutBtn');
  const passwordInput = document.getElementById('admPassword');
  const loginBtn       = document.getElementById('admLoginBtn');
  const loginError     = document.getElementById('admLoginError');

  const statusEl   = document.getElementById('inaStatus');
  const qrWrap      = document.getElementById('inaQrWrap');
  const linkInput   = document.getElementById('inaLinkInput');
  const copyBtn     = document.getElementById('inaCopyBtn');
  const refreshBtn  = document.getElementById('inaRefreshBtn');
  const resetBtn    = document.getElementById('inaResetBtn');

  function getKey() {
    try { return sessionStorage.getItem(KEY_STORAGE) || ''; } catch (e) { return ''; }
  }
  function setKey(key) {
    try { sessionStorage.setItem(KEY_STORAGE, key); } catch (e) {}
  }
  function clearKey() {
    try { sessionStorage.removeItem(KEY_STORAGE); } catch (e) {}
  }

  function showDashboard() {
    loginSection.hidden = true;
    dashSection.hidden = false;
    logoutBtn.hidden = false;
    loadInfo();
  }
  function showLogin() {
    loginSection.hidden = false;
    dashSection.hidden = true;
    logoutBtn.hidden = true;
  }

  async function tryLogin(password) {
    loginError.hidden = true;
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.ok) { setKey(password); showDashboard(); }
      else { loginError.textContent = data.error || 'गलत पासवर्ड'; loginError.hidden = false; }
    } catch (e) {
      loginError.textContent = 'सर्वर से जुड़ नहीं पाए — क्या सर्वर चालू है?';
      loginError.hidden = false;
    }
  }

  function renderQR(url) {
    qrWrap.innerHTML = '';
    if (window.QRCode) {
      new QRCode(qrWrap, { text: url, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M });
    } else {
      qrWrap.innerHTML = '<p style="font-size:12.5px;color:var(--brick,#a92318)">QR लाइब्रेरी लोड नहीं हुई — लिंक नीचे कॉपी करके किसी भी QR जनरेटर में इस्तेमाल करें।</p>';
    }
  }

  async function loadInfo() {
    statusEl.className = 'ina-status locked';
    statusEl.textContent = '⏳ लोड हो रहा है...';
    try {
      const res = await fetch('/api/inaugurate/link', { headers: { 'x-admin-key': getKey() } });
      if (res.status === 401) { clearKey(); showLogin(); return; }
      const data = await res.json();
      const url = window.location.origin + '/?vp=' + encodeURIComponent(data.key);
      linkInput.value = url;
      renderQR(url);
      if (data.unlocked) {
        statusEl.className = 'ina-status open';
        statusEl.textContent = '✅ उद्घाटन हो चुका है (' + (data.unlockedAt ? new Date(data.unlockedAt).toLocaleString('hi-IN') : '') + ') — साइट सबके लिए खुली है';
      } else {
        statusEl.className = 'ina-status locked';
        statusEl.textContent = '🔒 अभी लॉक है — VP सर के स्कैन का इंतज़ार';
      }
    } catch (e) {
      statusEl.textContent = 'सर्वर से जुड़ नहीं पाए';
    }
  }

  async function resetLock() {
    if (!confirm('क्या आप पर्दा फिर से लॉक करना चाहते हैं? (सिर्फ़ रिहर्सल/टेस्टिंग के लिए)')) return;
    try {
      await fetch('/api/inaugurate/reset', { method: 'POST', headers: { 'x-admin-key': getKey() } });
      loadInfo();
    } catch (e) {}
  }

  loginBtn.addEventListener('click', () => tryLogin(passwordInput.value));
  passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(passwordInput.value); });
  logoutBtn.addEventListener('click', () => { clearKey(); showLogin(); });
  refreshBtn.addEventListener('click', loadInfo);
  resetBtn.addEventListener('click', resetLock);
  copyBtn.addEventListener('click', () => {
    linkInput.select();
    navigator.clipboard && navigator.clipboard.writeText(linkInput.value).catch(() => {});
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
  });

  if (getKey()) showDashboard(); else showLogin();
})();
