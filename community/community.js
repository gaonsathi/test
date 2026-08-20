// ======================================================================
//  समुदाय (Community) — SECTION-ONLY SCRIPT
//  ⚠️ IMPORTANT FOR ANYONE EDITING THIS SECTION:
//  - ALL JavaScript for #community belongs in THIS file, and only this
//    file. Do NOT add community-related functions/listeners into
//    js/script.js or any other section's .js file.
//  - Everything is wrapped in the IIFE below (not global) except
//    window.renderCommunity, which js/fx.js calls after a language
//    switch so this section's JS-rendered content (the message feed)
//    updates too — same pattern as renderMandi / renderFeed / renderYojna
//    used by the other sections.
//  - This file is loaded AFTER every section's HTML is injected into
//    the page, so it's safe to look up #community elements immediately.
//
//  This section is deliberately a SIMPLE CHAT WALL: write a message,
//  optionally attach one photo/video, send. See everyone else's
//  messages in one stream, like them, reply to them. That's it — no
//  tabs, groups, leaderboard, events, search, or filters. Please keep
//  it that way; that complexity was tried before and removed because
//  it wasn't easy for villagers to use.
// ======================================================================

(function () {
  const root = document.getElementById('community');
  if (!root) return; // section not loaded / removed — bail quietly

  const feedList      = document.getElementById('cmFeedList');
  const feedEmpty      = document.getElementById('cmFeedEmpty');
  const tabAll         = document.getElementById('cmTabAll');
  const tabMine        = document.getElementById('cmTabMine');
  const postInput      = document.getElementById('cmPostInput');
  const postBtn        = document.getElementById('cmPostBtn');
  const mediaInput     = document.getElementById('cmMediaInput');
  const previewWrap    = document.getElementById('cmPreview');
  const previewImg     = document.getElementById('cmPreviewImg');
  const previewVid     = document.getElementById('cmPreviewVid');
  const previewRemove  = document.getElementById('cmPreviewRemove');

  if (!feedList || !postInput || !postBtn) return;

  // ------------------------------------------------------------------
  //  HIDE THE SITE FOOTER WHILE THIS SECTION IS OPEN — the fixed
  //  composer bar sits on top of it anyway, and it doesn't make sense
  //  right under a live chat wall. Footer is shared/global (lives in
  //  index.html, outside any section), so this file only toggles its
  //  visibility — it never touches the footer's markup/CSS itself.
  //  Self-contained here: watches #community's own "active" class
  //  (set by js/script.js's showSection()) instead of editing that
  //  shared file.
  // ------------------------------------------------------------------
  const footerEl = document.querySelector('footer');
  function syncFooterVisibility() {
    if (!footerEl) return;
    footerEl.style.display = root.classList.contains('active') ? 'none' : '';
  }
  syncFooterVisibility();
  new MutationObserver(syncFooterVisibility)
    .observe(root, { attributes: true, attributeFilter: ['class'] });

  const isEn = () => document.documentElement.lang === 'en';

  // small helper so user-typed text can never break the HTML we build
  // with template strings.
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ------------------------------------------------------------------
  //  STORAGE — everything (seed + new messages + likes + replies)
  //  lives in localStorage so a villager's own posts survive a page
  //  refresh, even though there's no server backing this section.
  // ------------------------------------------------------------------
  const STORAGE_KEY = 'gs_community_chat_v1';

  function seedPosts() {
    return [
      { id: 1, name: 'ग्राम पंचायत कार्यालय', nameEn: 'Gram Panchayat Office',
        avatarColor: 'var(--brick)', avatarLetter: '🏛️',
        time: '2 घंटे पहले', timeEn: '2 hours ago',
        text: 'सोमवार को टंकी की सफाई के कारण सुबह 10 से दोपहर 2 बजे तक पानी की सप्लाई बंद रहेगी। कृपया पहले से पानी भरकर रखें।',
        textEn: 'Water supply will be off Monday 10 AM–2 PM for tank cleaning. Please store water in advance.',
        media: null, likes: 64, liked: false, open: false,
        comments: [{ name: 'सुरेश यादव', nameEn: 'Suresh Yadav', text: 'जानकारी के लिए धन्यवाद 🙏', textEn: 'Thanks for the info 🙏' }] },

      { id: 2, name: 'अनिल कुमार', nameEn: 'Anil Kumar',
        avatarColor: 'var(--green)', avatarLetter: 'अ',
        time: '4 घंटे पहले', timeEn: '4 hours ago',
        text: 'इस साल धान की रोपाई कब शुरू करना ठीक रहेगा? किसी भाई ने शुरू किया क्या?',
        textEn: 'When is the right time to start planting rice this year? Has anyone started?',
        media: null, likes: 12, liked: false, open: false,
        comments: [
          { name: 'रामेश्वर सिंह', nameEn: 'Rameshwar Singh', text: 'मानसून थोड़ा देर से है, 10-15 जून के बाद शुरू करें तो बेहतर।', textEn: 'Monsoon is a bit late this year, better to start after June 10-15.' }
        ] },

      { id: 3, name: 'पूजा कुमारी', nameEn: 'Pooja Kumari',
        avatarColor: 'var(--pink)', avatarLetter: 'पू',
        time: 'कल', timeEn: 'Yesterday',
        text: 'गाँव साथी के "काम खोजो" सेक्शन से सिलाई का ऑर्डर मिला, अब हर महीने अपनी कमाई कर रही हूं। बहुत-बहुत धन्यवाद 🙏',
        textEn: 'Found tailoring orders through the "Find Work" section — now earning my own income every month. Thank you so much 🙏',
        media: null, likes: 138, liked: false, open: false, comments: [] },

      { id: 4, name: 'सोहन महतो', nameEn: 'Sohan Mahto',
        avatarColor: 'var(--sky)', avatarLetter: 'सो',
        time: '4 दिन पहले', timeEn: '4 days ago',
        text: 'मुख्य सड़क पर गड्ढा बन गया है, कल एक बाइक फिसल गई। शाम के बाद बहुत अंधेरा रहता है, संभल कर जाएं।',
        textEn: 'A pothole has formed on the main road, a bike skidded yesterday. Very dark after evening — be careful.',
        media: null, likes: 31, liked: false, open: false,
        comments: [{ name: 'ग्राम पंचायत कार्यालय', nameEn: 'Gram Panchayat Office', text: 'सूचना के लिए धन्यवाद, मरम्मत की मांग भेज दी गई है।', textEn: 'Thanks for reporting — a repair request has been sent.' }] }
    ];
  }

  let posts = [];
  let postSeq = 100;
  let activeTab = 'all'; // 'all' | 'mine' — which tab is currently shown

  function loadPosts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          posts = parsed;
          // migration: posts sent before the "मेरी पोस्ट" tab existed don't
          // have a `mine` flag yet — infer it from the "आप/You" author so
          // older self-posts still show up under My Posts.
          posts.forEach(p => { if (p.mine === undefined) p.mine = (p.name === 'आप'); });
          postSeq = posts.reduce((max, p) => Math.max(max, p.id), postSeq);
          return;
        }
      }
    } catch (e) { /* corrupt/blocked storage — fall back to seed */ }
    posts = seedPosts();
  }

  function savePosts() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); }
    catch (e) { /* storage full (large photo/video) — post still shows for this session */ }
  }

  loadPosts();

  // ------------------------------------------------------------------
  //  MEDIA ATTACH (photo / video) — read as a data URL so the message
  //  can be shown and saved without needing any server.
  // ------------------------------------------------------------------
  let pendingMedia = null; // { type:'image'|'video', url:'data:...' }
  const MAX_MEDIA_BYTES = 6 * 1024 * 1024; // ~6MB, keeps localStorage happy

  // Send button lights up (dark/accent) only once there's something to
  // send — text typed or a photo/video picked. Stays light/inactive-
  // looking otherwise, same idea as WhatsApp/Instagram.
  function syncSendBtnState() {
    if (!postBtn) return;
    const hasContent = postInput.value.trim().length > 0 || !!pendingMedia;
    postBtn.classList.toggle('has-content', hasContent);
  }

  function clearPreview() {
    pendingMedia = null;
    if (mediaInput) mediaInput.value = '';
    if (previewWrap) previewWrap.hidden = true;
    if (previewImg) { previewImg.hidden = true; previewImg.src = ''; }
    if (previewVid) { previewVid.hidden = true; previewVid.src = ''; }
    syncSendBtnState();
  }

  if (mediaInput) {
    mediaInput.addEventListener('change', () => {
      const file = mediaInput.files && mediaInput.files[0];
      if (!file) return;
      if (file.size > MAX_MEDIA_BYTES) {
        alert(isEn()
          ? 'This file is too large. Please pick a smaller photo/video.'
          : 'यह फ़ाइल बहुत बड़ी है। कृपया छोटी फोटो/वीडियो चुनें।');
        mediaInput.value = '';
        return;
      }
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = () => {
        pendingMedia = { type: isVideo ? 'video' : 'image', url: reader.result };
        if (previewWrap) previewWrap.hidden = false;
        if (isVideo) {
          if (previewVid) { previewVid.src = pendingMedia.url; previewVid.hidden = false; }
          if (previewImg) previewImg.hidden = true;
        } else {
          if (previewImg) { previewImg.src = pendingMedia.url; previewImg.hidden = false; }
          if (previewVid) previewVid.hidden = true;
        }
        syncSendBtnState();
      };
      reader.readAsDataURL(file);
    });
  }

  if (previewRemove) previewRemove.addEventListener('click', clearPreview);
  postInput.addEventListener('input', syncSendBtnState);
  syncSendBtnState(); // set correct initial state on load

  // ------------------------------------------------------------------
  //  RENDER
  // ------------------------------------------------------------------
  function mediaHTML(media) {
    if (!media) return '';
    if (media.type === 'video') {
      return `<div class="cm-post-media"><video src="${media.url}" controls></video></div>`;
    }
    return `<div class="cm-post-media"><img src="${media.url}" alt=""></div>`;
  }

  function commentsHTML(post) {
    const en = isEn();
    const list = post.comments.map(c => `
      <div class="cm-comment">
        <div class="avatar" style="background:var(--cream2);color:var(--ink-soft);">${esc((en ? c.nameEn : c.name).charAt(0))}</div>
        <div class="cm-comment-body"><b>${esc(en ? c.nameEn : c.name)}</b><br>${esc(en ? c.textEn : c.text)}</div>
      </div>`).join('');
    return `
      <div class="cm-comments${post.open ? ' open' : ''}" id="cmComments-${post.id}">
        ${list}
        <form class="cm-comment-form" data-id="${post.id}">
          <input type="text" autocomplete="off" required
            placeholder="${en ? 'Write a reply…' : 'जवाब लिखें…'}">
          <button type="submit">${en ? 'Send' : 'भेजें'}</button>
        </form>
      </div>`;
  }

  // Status badge — only on the current villager's own posts ("आप/You"),
  // so they can tell at a glance whether their question got a reply.
  // "Answered" = has at least one reply; "Pending" = no reply yet.
  function statusBadgeHTML(post) {
    if (!post.mine) return '';
    const en = isEn();
    const answered = post.comments.length > 0;
    const cls = answered ? 'answered' : 'pending';
    const icon = answered ? '✅' : '⏳';
    const label = answered
      ? (en ? 'Answered' : 'उत्तर मिला')
      : (en ? 'Waiting for reply' : 'जवाब का इंतज़ार');
    return `<div><span class="cm-status-badge ${cls}">${icon} ${esc(label)}</span></div>`;
  }

  // Edit/delete — tucked behind a 3-dot (⋮) menu on the top-right of the
  // post card, and ONLY on the "मेरी पोस्ट / My Posts" tab (never in
  // "सभी पोस्ट / All Posts", even for your own post there — keeps that
  // feed a plain read-only wall for everyone). Edit swaps the message
  // text for a small inline textarea + Save/Cancel (no popup dialogs).
  // Delete asks for confirmation first since it can't be undone.
  function kebabHTML(post) {
    if (!post.mine || activeTab !== 'mine') return '';
    const en = isEn();
    const open = post.menuOpen ? ' open' : '';
    return `
      <div class="cm-kebab-wrap${open}">
        <button type="button" class="cm-kebab-btn" data-id="${post.id}" aria-label="${en ? 'Options' : 'विकल्प'}">⋮</button>
        <div class="cm-kebab-menu">
          <button type="button" class="cm-kebab-item cm-edit-btn" data-id="${post.id}">
            <span class="ic">✏️</span> ${en ? 'Edit' : 'बदलें'}
          </button>
          <button type="button" class="cm-kebab-item cm-delete-btn" data-id="${post.id}">
            <span class="ic">🗑️</span> ${en ? 'Delete' : 'हटाएं'}
          </button>
        </div>
      </div>`;
  }

  function editFormHTML(post) {
    const en = isEn();
    return `
      <form class="cm-edit-form" data-id="${post.id}">
        <input type="text" autocomplete="off" required
          value="${esc(en ? post.textEn : post.text)}">
        <div class="cm-edit-form-actions">
          <button type="submit" class="cm-edit-save">${en ? 'Save' : 'सहेजें'}</button>
          <button type="button" class="cm-edit-cancel" data-id="${post.id}">${en ? 'Cancel' : 'रद्द करें'}</button>
        </div>
      </form>`;
  }

  function postHTML(post) {
    const en = isEn();
    return `
      <div class="cm-post" data-id="${post.id}">
        <div class="cm-post-head">
          <div class="avatar" style="background:${post.avatarColor};">${esc(post.avatarLetter)}</div>
          <div>
            <div class="cm-post-name-row">
              <b>${esc(en ? post.nameEn : post.name)}</b>
              <span class="cm-post-time">${esc(en ? post.timeEn : post.time)}</span>
            </div>
          </div>
          ${kebabHTML(post)}
        </div>
        ${post.editing ? editFormHTML(post)
          : (post.text ? `<p class="cm-post-text">${esc(en ? post.textEn : post.text)}</p>` : '')}
        ${mediaHTML(post.media)}
        ${statusBadgeHTML(post)}
        <div class="cm-post-actions">
          <button type="button" class="cm-action-btn cm-like-btn${post.liked ? ' liked' : ''}" data-id="${post.id}">
            <span class="ic">${post.liked ? '❤️' : '🤍'}</span> <span>${post.likes}</span>
          </button>
          <button type="button" class="cm-action-btn cm-comment-toggle" data-id="${post.id}">
            <span class="ic">💬</span> <span>${post.comments.length} ${en ? 'Replies' : 'जवाब'}</span>
          </button>
        </div>
        ${commentsHTML(post)}
      </div>`;
  }

  function render() {
    const en = isEn();
    const visible = activeTab === 'mine' ? posts.filter(p => p.mine) : posts;

    if (feedEmpty) {
      feedEmpty.hidden = visible.length > 0;
      feedEmpty.textContent = activeTab === 'mine'
        ? (en ? '😕 You haven\u2019t posted anything yet. Ask your first question above!'
              : '😕 आपने अभी तक कोई पोस्ट नहीं की है। ऊपर से अपना पहला सवाल पूछें!')
        : (en ? '😕 No messages yet. Be the first to write something!'
              : '😕 अभी कोई पोस्ट नहीं है। सबसे पहले आप कुछ लिखें!');
    }
    feedList.innerHTML = visible.map(postHTML).join('');
  }
  window.renderCommunity = render;

  // ------------------------------------------------------------------
  //  TABS — सभी पोस्ट (all) / मेरी पोस्ट (mine)
  // ------------------------------------------------------------------
  function setTab(tab) {
    activeTab = tab;
    if (tabAll) { tabAll.classList.toggle('active', tab === 'all'); tabAll.setAttribute('aria-selected', tab === 'all'); }
    if (tabMine) { tabMine.classList.toggle('active', tab === 'mine'); tabMine.setAttribute('aria-selected', tab === 'mine'); }
    render();
  }
  if (tabAll) tabAll.addEventListener('click', () => setTab('all'));
  if (tabMine) tabMine.addEventListener('click', () => setTab('mine'));

  // ------------------------------------------------------------------
  //  SEND A MESSAGE
  // ------------------------------------------------------------------
  function sendMessage() {
    const val = postInput.value.trim();
    if (!val && !pendingMedia) return;
    postSeq += 1;
    posts.unshift({
      id: postSeq,
      name: 'आप', nameEn: 'You',
      avatarColor: 'var(--pink)', avatarLetter: 'आ',
      time: 'अभी', timeEn: 'Just now',
      text: val, textEn: val,
      media: pendingMedia, likes: 0, liked: false, open: false, comments: [],
      mine: true // so it shows under "मेरी पोस्ट" (My Posts) with a status badge
    });
    postInput.value = '';
    clearPreview();
    savePosts();
    render();
  }

  postBtn.addEventListener('click', sendMessage);

  // Enter key sends too, same as every chat app (single-line input here,
  // so no need to reserve Enter for a newline).
  postInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
  });

  // ------------------------------------------------------------------
  //  LIKE / REPLY-TOGGLE / REPLY-SUBMIT — delegated on the list
  //  container since it's re-rendered often.
  // ------------------------------------------------------------------
  feedList.addEventListener('click', (e) => {
    const likeBtn = e.target.closest('.cm-like-btn');
    if (likeBtn) {
      const id = Number(likeBtn.dataset.id);
      const p = posts.find(x => x.id === id);
      if (p) { p.liked = !p.liked; p.likes += p.liked ? 1 : -1; savePosts(); render(); }
      return;
    }
    const toggle = e.target.closest('.cm-comment-toggle');
    if (toggle) {
      const id = Number(toggle.dataset.id);
      const p = posts.find(x => x.id === id);
      if (p) { p.open = !p.open; render(); }
      return;
    }
    // 3-dot menu open/close — only one open at a time, so opening one
    // closes any other that was already open.
    const kebabBtn = e.target.closest('.cm-kebab-btn');
    if (kebabBtn) {
      const id = Number(kebabBtn.dataset.id);
      posts.forEach(p => { p.menuOpen = (p.id === id) ? !p.menuOpen : false; });
      render();
      return;
    }
    const editBtn = e.target.closest('.cm-edit-btn');
    if (editBtn) {
      const id = Number(editBtn.dataset.id);
      const p = posts.find(x => x.id === id);
      if (p) { p.editing = true; p.menuOpen = false; render(); }
      return;
    }
    const cancelBtn = e.target.closest('.cm-edit-cancel');
    if (cancelBtn) {
      const id = Number(cancelBtn.dataset.id);
      const p = posts.find(x => x.id === id);
      if (p) { p.editing = false; render(); }
      return;
    }
    const deleteBtn = e.target.closest('.cm-delete-btn');
    if (deleteBtn) {
      const id = Number(deleteBtn.dataset.id);
      posts = posts.filter(x => x.id !== id);
      savePosts();
      render();
      return;
    }
    // any other click inside the feed (like the post body) closes an
    // open menu, same as tapping outside it would
    if (posts.some(p => p.menuOpen)) {
      posts.forEach(p => { p.menuOpen = false; });
      render();
    }
  });

  // clicking anywhere outside the feed (composer bar, tabs, etc.)
  // should also close an open 3-dot menu. Uses composedPath() (captured
  // at click time) instead of feedList.contains(e.target) — the feed's
  // own click handler above re-renders (replacing the DOM) before this
  // listener runs, which would detach e.target and make contains()
  // wrongly report "outside" right after opening the menu.
  document.addEventListener('click', (e) => {
    const path = e.composedPath ? e.composedPath() : [];
    if (path.includes(feedList)) return; // handled by the feed's own listener above
    if (posts.some(p => p.menuOpen)) {
      posts.forEach(p => { p.menuOpen = false; });
      render();
    }
  });

  feedList.addEventListener('submit', (e) => {
    const editForm = e.target.closest('.cm-edit-form');
    if (!editForm) return;
    e.preventDefault();
    const id = Number(editForm.dataset.id);
    const input = editForm.querySelector('input');
    const val = input.value.trim();
    if (!val) return;
    const p = posts.find(x => x.id === id);
    if (p) {
      p.text = val; p.textEn = val;
      p.editing = false;
      savePosts();
      render();
    }
  });

  feedList.addEventListener('submit', (e) => {
    const form = e.target.closest('.cm-comment-form');
    if (!form) return;
    e.preventDefault();
    const id = Number(form.dataset.id);
    const input = form.querySelector('input');
    const val = input.value.trim();
    if (!val) return;
    const p = posts.find(x => x.id === id);
    if (p) {
      p.comments.push({ name: 'आप', nameEn: 'You', text: val, textEn: val });
      p.open = true;
      savePosts();
      render();
    }
  });

  // ------------------------------------------------------------------
  //  INIT
  // ------------------------------------------------------------------
  render();

})();
