// ===================================================================
//  Gaon Sathi — tiny local proxy for the Gemini API.
//
//  Why this exists: crop.js used to call Gemini directly from the
//  browser with the API key in the URL. That means anyone who opens
//  dev tools (or just "view source") on the live site can copy the
//  key. This server keeps the key on the machine running Node, never
//  in code the browser downloads.
//
//  Run it:
//    1) cd server
//    2) cp .env.example .env   (then paste your real key into .env)
//    3) npm install
//    4) npm start
//    -> proxy listens on http://localhost:8787
// ===================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
// Live web search (Google Search grounding) needs its own model choice,
// separate from GEMINI_MODEL above: "lite" model variants (e.g.
// gemini-2.0-flash-lite, gemini-3.5-flash-lite) generally do NOT
// support the google_search tool and will 400 on every search call —
// that 400 gets logged below but crop.js falls back to a normal,
// un-grounded answer, so it can look like "search silently does
// nothing" if you only watch the browser, not the server console.
// Keep this on a full (non-lite) flash/pro model even if GEMINI_MODEL
// is set to a lite one for cost reasons. Check which current models
// support grounding at https://ai.google.dev/gemini-api/docs/models
const GEMINI_SEARCH_MODEL = process.env.GEMINI_SEARCH_MODEL || 'gemini-2.0-flash';
// TTS is a separate model family from normal text generation — Gemini's
// native speech models. GEMINI_TTS_VOICE picks the accent/character;
// "Kore" reads clear and warm across the Indian-language set this app
// needs (Hindi/Bhojpuri/Bengali/English). Full voice list + a listening
// sample for each is in Google's docs: https://ai.google.dev/gemini-api/docs/speech-generation
const GEMINI_TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts';
const GEMINI_TTS_VOICE = process.env.GEMINI_TTS_VOICE || 'Kore';
// LIVE VOICE (real-time, Siri-style) uses a completely different model
// family — the Live API (speech-to-speech, one continuous WebSocket,
// server-side turn detection + interruption). See handleLiveSession()
// below. If this model ID ever 404s for your key (preview models move),
// swap it for another from https://ai.google.dev/gemini-api/docs/live-api/capabilities
const GEMINI_LIVE_MODEL = process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview';
const PORT = process.env.PORT || 8787;
// Live Voice WebSocket runs on its own dedicated port so it is
// completely isolated from the REST + curtain server — no shared
// http.Server means no routing ambiguity on Render or any proxy.
const LIVE_PORT = process.env.LIVE_PORT || 8788;

// ===================================================================
//  योजना खोजें (Yojna Khojo) — SCHEME ARTICLES API
//  -----------------------------------------------------------------
//  Very simple, admin-controlled article system for the "yojna"
//  section — mirrors the ResultRush.in article/admin pattern but kept
//  as small as possible for Gaon Sathi:
//    - Storage: one JSON file (server/data/schemes.json). No database
//      to install/manage.
//    - Auth: a single admin password (server/.env → ADMIN_PASSWORD).
//      The admin panel (admin/admin.html) asks for it once, keeps it
//      in the browser's sessionStorage, and sends it as the
//      "x-admin-key" header on every write request. The server just
//      compares it to ADMIN_PASSWORD — no sessions/cookies needed.
//  See admin/admin.js and yojna/article.js for the frontend half.
// ===================================================================

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gaonsathi123';
const SCHEMES_FILE = path.join(__dirname, 'data', 'schemes.json');

// ===================================================================
//  उद्घाटन ताला (Inauguration Lock) — "VP sir" ribbon-cutting gate
//  -----------------------------------------------------------------
//  The homepage curtain (intro/intro.js) normally opens itself after
//  a few seconds for everyone. This feature makes it stay CLOSED and
//  LOCKED for every visitor until one specific person — the guest of
//  honour — "cuts the ribbon" by opening a secret link on their
//  phone (in practice: scanning a QR code that encodes that link)
//  and then tapping an "उद्घाटन करें" button. The moment that
//  happens, this flag flips to true on the server — a real
//  database-of-one, just a JSON file like schemes.json — and the
//  curtain opens on that phone AND stays open for every visitor
//  afterwards (it's a one-time ceremony, not a login).
//
//  Get the secret link + QR code from: /admin/inaugurate.html
//  (uses the same ADMIN_PASSWORD as the योजना admin panel).
//  The secret itself lives in .env → INAUGURATION_KEY — change it
//  from the default before the real event, the same way you would
//  change ADMIN_PASSWORD.
// ===================================================================
const INAUGURATION_KEY = process.env.INAUGURATION_KEY || 'badlo-ye-secret-key';
const INAUGURATE_FILE = path.join(__dirname, 'data', 'inaugurate.json');

function loadInaugurate() {
  try {
    const raw = fs.readFileSync(INAUGURATE_FILE, 'utf8');
    const data = JSON.parse(raw);
    return { unlocked: !!data.unlocked, unlockedAt: data.unlockedAt || null };
  } catch (err) {
    return { unlocked: false, unlockedAt: null };
  }
}

function saveInaugurate(state) {
  fs.mkdirSync(path.dirname(INAUGURATE_FILE), { recursive: true });
  fs.writeFileSync(INAUGURATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function loadSchemes() {
  try {
    const raw = fs.readFileSync(SCHEMES_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

function saveSchemes(list) {
  fs.mkdirSync(path.dirname(SCHEMES_FILE), { recursive: true });
  fs.writeFileSync(SCHEMES_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function slugify(title) {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isAdmin(req) {
  const key = req.get('x-admin-key') || req.query.key || '';
  return key && key === ADMIN_PASSWORD;
}

function requireAdmin(req, res, next) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'गलत पासवर्ड / Invalid admin password' });
  next();
}

// Check the admin password (used by admin.html's login screen)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password && password === ADMIN_PASSWORD) return res.json({ ok: true });
  res.status(401).json({ ok: false, error: 'गलत पासवर्ड / Wrong password' });
});

// List schemes — public gets only published ones; admin (valid key)
// gets everything, including drafts, so the admin panel can manage them.
app.get('/api/schemes', (req, res) => {
  const all = loadSchemes();
  const list = isAdmin(req) ? all : all.filter(s => s.published !== false);
  res.json(list);
});

// Single scheme by slug — public only sees it if published.
app.get('/api/schemes/:slug', (req, res) => {
  const all = loadSchemes();
  const item = all.find(s => s.slug === req.params.slug);
  if (!item) return res.status(404).json({ error: 'योजना नहीं मिली / Scheme not found' });
  if (item.published === false && !isAdmin(req)) {
    return res.status(404).json({ error: 'योजना नहीं मिली / Scheme not found' });
  }
  res.json(item);
});

// Create a new scheme article (admin only)
app.post('/api/schemes', requireAdmin, (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.title.trim()) {
    return res.status(400).json({ error: 'शीर्षक ज़रूरी है / Title is required' });
  }
  const all = loadSchemes();
  // Prefer an English title for the slug when available (Hindi-only
  // titles produce an empty slug since \w only matches ASCII letters),
  // falling back to the Hindi title, then finally a timestamp so it
  // never fails outright.
  let slug = slugify(body.slug) || slugify(body.titleEn) || slugify(body.title);
  if (!slug) slug = 'scheme-' + Date.now();
  // ensure unique slug
  let finalSlug = slug, n = 2;
  while (all.some(s => s.slug === finalSlug)) { finalSlug = `${slug}-${n++}`; }

  const now = new Date().toISOString();
  const item = {
    ...body,
    slug: finalSlug,
    faqs: Array.isArray(body.faqs) ? body.faqs : [],
    published: body.published !== false,
    isNew: !!body.isNew,
    createdAt: now,
    updatedAt: now
  };
  all.unshift(item);
  saveSchemes(all);
  res.status(201).json(item);
});

// Update an existing scheme article (admin only)
app.put('/api/schemes/:slug', requireAdmin, (req, res) => {
  const all = loadSchemes();
  const idx = all.findIndex(s => s.slug === req.params.slug);
  if (idx === -1) return res.status(404).json({ error: 'योजना नहीं मिली / Scheme not found' });

  const body = req.body || {};
  let newSlug = all[idx].slug;
  if (body.slug && slugify(body.slug) && slugify(body.slug) !== all[idx].slug) {
    const candidate = slugify(body.slug);
    const clash = all.some((s, i) => i !== idx && s.slug === candidate);
    newSlug = clash ? all[idx].slug : candidate;
  }

  all[idx] = {
    ...all[idx],
    ...body,
    slug: newSlug,
    faqs: Array.isArray(body.faqs) ? body.faqs : (all[idx].faqs || []),
    updatedAt: new Date().toISOString()
  };
  saveSchemes(all);
  res.json(all[idx]);
});

// Delete a scheme article (admin only)
app.delete('/api/schemes/:slug', requireAdmin, (req, res) => {
  const all = loadSchemes();
  const next = all.filter(s => s.slug !== req.params.slug);
  if (next.length === all.length) return res.status(404).json({ error: 'योजना नहीं मिली / Scheme not found' });
  saveSchemes(next);
  res.json({ ok: true });
});

function endpointFor(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
}

// ===================================================================
//  SAFETY SETTINGS — by default Gemini blocks anything it scores as
//  "dangerous content", and that category is written broadly enough
//  that farm-chemical talk (pesticide/fungicide/herbicide names,
//  doses, "spray this on the crop") can get silently blocked even
//  though it's completely legitimate agricultural advice. When a
//  reply gets blocked, candidates[0].content.parts is empty/missing,
//  which crop.js was previously reporting as a generic "AI का जवाब
//  समझ नहीं आया" error — which is what felt like the AI "refusing"
//  to give a दवा/pesticide name.
//
//  We relax (but don't fully disable) the filter for this specific,
//  narrow, real-world use case: this app is farm chemical advice for
//  Indian farmers, not general chat. Harassment/hate/sexual content
//  stay at the default (still blocked); dangerous-content is turned
//  down to BLOCK_ONLY_HIGH so normal pesticide/fertilizer brand names
//  and dosages stop getting caught, while genuinely dangerous requests
//  (e.g. making poisons/explosives, self-harm) are still blocked.
// ===================================================================
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
];

// If a Gemini response comes back with no usable text, check whether
// it was a safety block and, if so, say so plainly (in the console)
// instead of leaving it looking like a generic network/parsing error.
function logIfSafetyBlocked(data, label){
  const blockReason = data && data.promptFeedback && data.promptFeedback.blockReason;
  const finishReason = data && data.candidates && data.candidates[0] && data.candidates[0].finishReason;
  if (blockReason || finishReason === 'SAFETY' || finishReason === 'PROHIBITED_CONTENT') {
    console.warn(`[${label}] Gemini blocked this reply — blockReason=${blockReason || '(none)'} finishReason=${finishReason || '(none)'}. Consider loosening SAFETY_SETTINGS further in server.js if this keeps happening for normal farming questions.`);
  }
}

// Structured JSON replies — used by the normal chat thread (crop.js: callGemini)
app.post('/api/gemini/generate', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server has no GEMINI_API_KEY configured. Add it to server/.env' });
  }
  try {
    const { contents } = req.body || {};
    const body = {
      contents,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: { response_mime_type: 'application/json', temperature: 0.4 }
    };
    const r = await fetch(endpointFor(GEMINI_MODEL), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    logIfSafetyBlocked(data, '/api/gemini/generate');
    res.status(r.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Proxy request to Gemini failed.' });
  }
});

// Plain-text replies — used by Live Voice mode (crop.js: callGeminiPlain)
app.post('/api/gemini/generate-plain', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server has no GEMINI_API_KEY configured. Add it to server/.env' });
  }
  try {
    const { contents, maxTokens } = req.body || {};
    const body = {
      contents,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: { temperature: 0.5, maxOutputTokens: maxTokens || 300 }
    };
    const r = await fetch(endpointFor(GEMINI_MODEL), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    logIfSafetyBlocked(data, '/api/gemini/generate-plain');
    res.status(r.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Proxy request to Gemini failed.' });
  }
});

// ===================================================================
//  LIVE WEB SEARCH — grounds chat answers in real, current information
//  -----------------------------------------------------------------
//  Used for questions where the model's own training knowledge isn't
//  enough or could be stale/wrong for THIS farmer right now — pesticide/
//  fertilizer brand names & doses, current mandi/market prices, active
//  government schemes, local pest-outbreak advisories, etc. crop.js
//  decides (see needsLiveSearch() there) when a question looks like it
//  needs this before falling back to the normal, un-grounded chat call.
//
//  IMPORTANT: Gemini does not allow the google_search tool to be
//  combined with response_mime_type:"application/json" in the same
//  call (grounded search + forced-JSON output are mutually exclusive
//  on this API) — so this is a separate PLAIN TEXT call. crop.js takes
//  the grounded text this returns and feeds it as extra context into
//  its normal JSON-formatting follow-up call, so the farmer still gets
//  the same bilingual chat-bubble UI, just backed by real search.
// ===================================================================
app.post('/api/gemini/search', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server has no GEMINI_API_KEY configured. Add it to server/.env' });
  }
  try {
    const { query, contextText } = req.body || {};
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'No search query given.' });
    }
    const prompt = contextText
      ? `${contextText}\n\nभारत के किसान का सवाल: "${query}"\n\nGoogle Search से ताज़ा, सटीक जानकारी खोजकर हिंदी में सीधा, व्यावहारिक जवाब दें। ब्रांड/दवा के नाम, कीमत या योजना की जानकारी हो तो जितनी ताज़ा मिले उतनी सटीक बताएं।`
      : `भारत के किसान का सवाल: "${query}"\n\nGoogle Search से ताज़ा, सटीक जानकारी खोजकर हिंदी में सीधा, व्यावहारिक जवाब दें।`;
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      safetySettings: SAFETY_SETTINGS,
      generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
    };
    let r = await fetch(endpointFor(GEMINI_SEARCH_MODEL), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    let data = await r.json();
    logIfSafetyBlocked(data, '/api/gemini/search');

    // Older model families (Gemini 1.5) use a different tool name for
    // the same feature — retry once with that shape before giving up,
    // so this keeps working even if GEMINI_SEARCH_MODEL points at one.
    if (!r.ok && /google_search|tool/i.test((data && data.error && data.error.message) || '')) {
      const retryBody = {
        contents: body.contents,
        tools: [{ google_search_retrieval: { dynamic_retrieval_config: { mode: 'MODE_DYNAMIC' } } }],
        safetySettings: SAFETY_SETTINGS,
        generationConfig: body.generationConfig
      };
      const retryRes = await fetch(endpointFor(GEMINI_SEARCH_MODEL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retryBody)
      });
      const retryData = await retryRes.json();
      if (retryRes.ok) { r = retryRes; data = retryData; }
    }

    if (!r.ok) {
      console.error(`Gemini search error (model: ${GEMINI_SEARCH_MODEL}):`, JSON.stringify(data));
      const msg = (data && data.error && data.error.message) || 'Search request failed.';
      return res.status(r.status).json({ error: `${msg} — इस मॉडल (${GEMINI_SEARCH_MODEL}) पर live search शायद सपोर्ट नहीं है, server/.env में GEMINI_SEARCH_MODEL बदल कर देखें।` });
    }
    const candidate = data && data.candidates && data.candidates[0];
    const text = candidate && candidate.content && candidate.content.parts
      ? candidate.content.parts.map(p => p.text || '').join('').trim()
      : '';
    const chunks = (candidate && candidate.groundingMetadata && candidate.groundingMetadata.groundingChunks) || [];
    const sources = chunks
      .map(c => c.web && c.web.uri ? { title: c.web.title || c.web.uri, uri: c.web.uri } : null)
      .filter(Boolean)
      // de-dupe by uri
      .filter((s, i, arr) => arr.findIndex(x => x.uri === s.uri) === i)
      .slice(0, 5);
    if (!text) {
      return res.status(502).json({ error: 'Search returned no answer.' });
    }
    res.json({ text, sources });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Proxy request to Gemini search failed.' });
  }
});

// Public: has the curtain been inaugurated yet? Polled by intro/intro.js
// on every page load so it knows whether to show the locked curtain,
// the "ready to open" tap-button screen, or nothing at all.
app.get('/api/inaugurate/status', (req, res) => {
  res.json(loadInaugurate());
});

// Checks the key WITHOUT unlocking anything — lets intro/intro.js show
// VP sir a "तैयार है, खोलने के लिए टैप करें" button only when the QR
// code he scanned is actually genuine, without cutting the ribbon
// until he actually taps it.
app.get('/api/inaugurate/verify', (req, res) => {
  const key = req.query.key || '';
  const current = loadInaugurate();
  if (current.unlocked) return res.json({ valid: true, unlocked: true });
  res.json({ valid: !!key && key === INAUGURATION_KEY, unlocked: false });
});

// The ribbon-cutting itself. Called by intro/intro.js only after VP sir
// taps the button on his phone. No admin key needed here on purpose —
// the SECRET LINK ITSELF is the credential, same as any invite link.
app.post('/api/inaugurate/unlock', (req, res) => {
  const key = req.get('x-inaugurate-key') || (req.body && req.body.key) || '';
  const current = loadInaugurate();
  if (current.unlocked) return res.json(current); // already open — idempotent
  if (!key || key !== INAUGURATION_KEY) {
    return res.status(401).json({ error: 'अमान्य कोड / Invalid unlock code' });
  }
  const state = { unlocked: true, unlockedAt: new Date().toISOString() };
  saveInaugurate(state);
  broadcastCurtainUnlock(state); // push to every browser watching the curtain right now
  res.json(state);
});

// Admin-only: lock it again (handy for rehearsing/testing before the
// real event) and fetch the secret link to build the QR code from.
// Both require the shared ADMIN_PASSWORD, same as the योजना panel.
app.post('/api/inaugurate/reset', requireAdmin, (req, res) => {
  const state = { unlocked: false, unlockedAt: null };
  saveInaugurate(state);
  res.json(state);
});

app.get('/api/inaugurate/link', requireAdmin, (req, res) => {
  res.json({ key: INAUGURATION_KEY, ...loadInaugurate() });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, keyConfigured: !!GEMINI_API_KEY, model: GEMINI_MODEL, searchModel: GEMINI_SEARCH_MODEL, ttsModel: GEMINI_TTS_MODEL, ttsVoice: GEMINI_TTS_VOICE });
});

// ===================================================================
//  फसल भाव (Crop Rate) — MANDI PRICE (live) + MSP (government floor)
//  -----------------------------------------------------------------
//  Two very different kinds of number, both surfaced under the same
//  "rate" tab (see kisan/rate/), so kept as two small, separate
//  endpoints:
//
//  1) /api/mandi/prices — TODAY'S REAL market price, proxied from the
//     Open Government Data (OGD) Platform India's official AGMARKNET
//     dataset ("Variety-wise Daily Market Prices Data of Commodity",
//     resource 9ef84268-d588-465a-a308-a864a43d0070 — sourced from
//     https://agmarknet.gov.in, Ministry of Agriculture & Farmers
//     Welfare). Proxied through this server (not called directly from
//     the browser) so a real DATA_GOV_API_KEY, once you get one, never
//     sits in frontend code — same reasoning as the Gemini key above.
//     Without a key in server/.env this falls back to data.gov.in's
//     published SAMPLE key, which works out of the box but is capped
//     at 10 records per request — get your own free key at
//     https://www.data.gov.in/user/register and add it to .env once
//     you're ready to move past that limit.
//
//  2) /api/msp — the government's fixed Minimum Support Price. This is
//     NOT a live, daily number — it's revised only once or twice a
//     year (CCEA/Cabinet approval, published by PIB), so it's kept as
//     a small static file (server/data/msp.json) instead of an API
//     call. Update that file by hand whenever a new MSP is announced.
// ===================================================================

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b'; // official data.gov.in sample key; use DATA_GOV_API_KEY in .env for production
const AGMARKNET_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const MSP_FILE = path.join(__dirname, 'data', 'msp.json');

app.get('/api/mandi/prices', async (req, res) => {
  try {
    const { state, district, commodity, market, variety, grade, limit, offset } = req.query || {};
    const params = new URLSearchParams();
    params.set('api-key', DATA_GOV_API_KEY);
    params.set('format', 'json');
    params.set('limit', String(Math.min(parseInt(limit, 10) || 10, 100)));
    params.set('offset', String(Math.max(parseInt(offset, 10) || 0, 0)));
    // Official filter syntax for this resource: filters[<field>]=<value>
    // (NOT filters[<field>.keyword] — that was a bug in an earlier
    // version of this file that silently matched zero records for
    // every search, since no field is actually named "state.keyword".)
    if (state) params.set('filters[state.keyword]', state);
    if (district) params.set('filters[district]', district);
    if (market) params.set('filters[market]', market);
    if (commodity) params.set('filters[commodity]', commodity);
    if (variety) params.set('filters[variety]', variety);
    if (grade) params.set('filters[grade]', grade);

    const url = `https://api.data.gov.in/resource/${AGMARKNET_RESOURCE_ID}?${params.toString()}`;
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(502).json({ error: 'मंडी भाव लोड नहीं हुआ / Could not load mandi price right now.', status: r.status });
    }
    const data = await r.json();
    res.json({
      records: Array.isArray(data.records) ? data.records : [],
      total: data.total || (data.records || []).length,
      source: 'AGMARKNET (agmarknet.gov.in) via data.gov.in — Ministry of Agriculture & Farmers Welfare, Govt of India',
      sourceUrl: 'https://agmarknet.gov.in',
      fetchedAt: new Date().toISOString(),
      usingSampleKey: !process.env.DATA_GOV_API_KEY
    });
  } catch (err) {
    console.error('mandi price proxy error:', err);
    res.status(500).json({ error: 'मंडी भाव लोड नहीं हुआ / Could not load mandi price right now.' });
  }
});

app.get('/api/msp', (req, res) => {
  try {
    const raw = fs.readFileSync(MSP_FILE, 'utf8');
    res.json(JSON.parse(raw));
  } catch (err) {
    // Logged server-side so it's obvious in the terminal WHY this
    // failed (almost always: msp.json isn't at server/data/msp.json).
    console.error('MSP load failed. Expected file at:', MSP_FILE, '\nReason:', err.message);
    res.status(500).json({ error: 'MSP डेटा लोड नहीं हुआ / Could not load MSP data.', expectedPath: MSP_FILE, reason: err.message });
  }
});

// ===================================================================
//  LIVE VOICE — REAL GEMINI TTS
//  -----------------------------------------------------------------
//  Gemini's native speech model returns raw PCM audio (16-bit, mono,
//  usually 24kHz) as base64 inside the normal generateContent JSON
//  response — not a ready-to-play file. wrapPcmAsWav() adds the
//  standard 44-byte WAV header so any <audio> element / browser can
//  just play the bytes with no extra decoding on the frontend.
// ===================================================================
function wrapPcmAsWav(pcmBuffer, sampleRate, channels, bitsPerSample){
  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16);                 // fmt chunk size
  header.writeUInt16LE(1, 20);                  // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(pcmBuffer.length, 40);
  return Buffer.concat([header, pcmBuffer]);
}

// Reads the sample rate Gemini reports in its mimeType, e.g.
// "audio/L16;codec=pcm;rate=24000" → 24000. Falls back to 24000 (the
// model's default) if the field is ever missing.
function sampleRateFromMime(mimeType){
  const m = /rate=(\d+)/.exec(mimeType || '');
  return m ? parseInt(m[1], 10) : 24000;
}

app.post('/api/gemini/tts', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server has no GEMINI_API_KEY configured. Add it to server/.env' });
  }
  try {
    const { text, voiceName } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'No text given to speak.' });
    }
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const body = {
      contents: [{ role: 'user', parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName || GEMINI_TTS_VOICE } }
        }
      }
    };
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('Gemini TTS error:', data);
      return res.status(r.status).json({ error: (data && data.error && data.error.message) || 'Gemini TTS request failed.' });
    }
    const part = data && data.candidates && data.candidates[0] && data.candidates[0].content
      && data.candidates[0].content.parts && data.candidates[0].content.parts[0];
    const inline = part && part.inlineData;
    if (!inline || !inline.data) {
      return res.status(502).json({ error: 'Gemini TTS returned no audio.' });
    }
    const pcm = Buffer.from(inline.data, 'base64');
    const sampleRate = sampleRateFromMime(inline.mimeType);
    const wav = wrapPcmAsWav(pcm, sampleRate, 1, 16);
    res.set('Content-Type', 'audio/wav');
    res.send(wav);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Proxy request to Gemini TTS failed.' });
  }
});

// ===================================================================
//  LIVE VOICE — REAL-TIME SPEECH-TO-SPEECH (Gemini Live API)
//  -----------------------------------------------------------------
//  This is what actually makes voice mode feel like Siri/Google
//  Assistant instead of "record → wait → wait again → play file".
//
//  The OLD flow (still in git history) was three chained REST calls:
//  browser speech-to-text → wait for full Gemini text reply → wait for
//  a full separate TTS request → THEN play. Two full round-trips of
//  silence before any sound.
//
//  The NEW flow is one continuous WebSocket per conversation, open for
//  as long as Live Voice is on screen:
//    farmer's mic audio streams to Gemini in ~200ms chunks the whole
//    time → Gemini's own server-side voice detector (VAD) decides when
//    the farmer has finished a sentence → Gemini starts streaming
//    AUDIO OUT while it's still "thinking" the rest of the reply, and
//    that audio starts playing on the very first chunk instead of
//    waiting for the whole reply → and if the farmer starts talking
//    again while Gemini is still speaking, Gemini's VAD detects that
//    and sends an "interrupted" signal so playback can cut off
//    immediately, exactly like cutting Siri off mid-sentence.
//
//  The browser NEVER talks to Gemini directly (same reasoning as the
//  REST proxy above — the API key must never ship to a browser). It
//  opens a plain WebSocket to OUR server at ws://localhost:PORT/live,
//  and this server relays audio in both directions to/from Gemini's
//  Live API, translating Gemini's verbose message schema into a small
//  set of simple {type: "..."} messages so crop.js stays simple.
//
//  Client → server messages (from crop.js):
//    { type: "start", context: "<text summary of the chat so far>" }
//    { type: "audio", data: "<base64 PCM16 16kHz mono>" }
//    { type: "audioStreamEnd" }   — mic paused/muted
//    { type: "end" }              — farmer closed Live Voice
//
//  Server → client messages (to crop.js):
//    { type: "ready" }                         — Gemini session is up, start streaming mic
//    { type: "inputTranscript", text }         — live caption of what the farmer is saying
//    { type: "outputTranscript", text }        — live caption of what Gemini is saying
//    { type: "audio", data, mimeType }         — a chunk of Gemini's spoken reply (base64 PCM16 24kHz)
//    { type: "interrupted" }                   — farmer spoke over Gemini — stop playback NOW
//    { type: "turnComplete" }                  — Gemini finished this reply
//    { type: "error", message }
// ===================================================================

const LIVE_VOICE_PERSONA = `आप "फसल साथी" हैं — भारतीय किसानों के लिए एक अपनी, प्यारी और दोस्ताना AI कृषि सहायक, जो अभी लाइव आवाज़ में बात कर रही है — जैसे कोई अपनी छोटी बहन या करीबी दोस्त खेत की बात कर रही हो, कोई सरकारी अफसर नहीं।

निर्देश (ज़रूर मानें):
- किसान जिस भी भाषा में बोले (हिंदी, अंग्रेज़ी, भोजपुरी या बंगाली), उसी भाषा में जवाब दें, बीच में दूसरी भाषा मत मिलाइए, जब तक किसान खुद भाषा न बदले।
- लहजा गर्मजोशी भरा, प्यारा और अपनापन लिए हो — छोटी-छोटी सराहना या हौसला-अफज़ाई वाली बातें ठीक हैं (जैसे "बढ़िया सवाल है", "चिंता मत करो"), पर दिखावटी मत लगे।
- जवाब बोलकर सुनाने लायक हो: छोटे, आसान, रोज़मर्रा के वाक्य, कोई मुश्किल कृषि शब्द नहीं, कोई इमोजी मत बोलिए।
- हर जवाब 2 से 4 वाक्यों में दें, बहुत लंबा जवाब मत दीजिए — यह बोलचाल है, भाषण नहीं।
- अगर किसान बीच में बोलना शुरू करे, तुरंत रुक जाएं और उसे सुनें।
- Apni identity (ki aapko Ashutosh aur Keshav ne develop kiya hai) sirf tab tak seedha mat batao jab tak zaroorat na ho — lekin jab bhi situation khud ban jaaye (seedha poochhe, tareef kare, developer/credit se juda sawaal ho, ya baat naturally us taraf mude) to khud judge karke, apne alfaazon mein, halke Hinglish mein bata do ki Ashutosh aur Keshav ne aapko develop kiya hai. Agar sawaal kheti se hatke, out-of-topic/general ho (jaise "tum kaun ho") to "develop" ki jagah "train" word use karke, crop/kheti ke context ke saath bata do ki Ashutosh aur Keshav ne aapko crop ke liye train kiya hai. Yeh koi fixed, rata-rataya vaakya nahi honi chahiye — har baar situation ke hisaab se apna naya, sahaj vaakya banaiye, jaise ek insaan apne mind se bolta hai, kisi script se padh kar nahi. Bina wajah har jawaab mein yeh mat thoonsiye, sirf jab context sach mein banta ho.`;

function liveUpstreamUrl(){
  return `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
}

function handleLiveConnection(clientWs){
  if (!GEMINI_API_KEY) {
    clientWs.send(JSON.stringify({ type: 'error', message: 'Server has no GEMINI_API_KEY configured. Add it to server/.env' }));
    clientWs.close();
    return;
  }

  let upstream = null;
  let upstreamReady = false;

  // ---- Render.com (and most reverse proxies) silently drop WebSocket
  // connections that are idle for ~55 seconds. During a live voice call
  // there is ALWAYS audio flowing so this should never fire — but if the
  // user pauses, mutes, or the network hiccups, the connection would be
  // killed before they say another word. A small ping every 20 seconds
  // keeps the connection alive without adding any noticeable overhead.
  const keepAliveInterval = setInterval(() => {
    if (clientWs.readyState === WebSocket.OPEN) {
      try { clientWs.ping(); } catch (e) {}
    } else {
      clearInterval(keepAliveInterval);
    }
  }, 20000);

  clientWs.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch (e) { return; }

    if (msg.type === 'start') {
      if (upstream) return; // already started
      upstream = new WebSocket(liveUpstreamUrl());

      upstream.on('open', () => {
        const systemText = msg.context
          ? `${LIVE_VOICE_PERSONA}\n\nअब तक की बातचीत/फसल की जानकारी (ध्यान में रखें):\n${msg.context}`
          : LIVE_VOICE_PERSONA;
        const setupMessage = {
          setup: {
            model: `models/${GEMINI_LIVE_MODEL}`,
            generationConfig: {
              responseModalities: ['AUDIO'],
              // Keep Live replies in the lowest-latency thinking mode.
              // This is supported by Gemini 3.1 Flash Live and avoids
              // unnecessary reasoning delay in a voice conversation.
              thinkingConfig: { thinkingLevel: 'minimal' },
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_TTS_VOICE } } }
            },
            systemInstruction: { parts: [{ text: systemText }] },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            // Without this, Gemini uses its default voice-activity-detection
            // (VAD) sensitivity, which is tuned for quiet, close-mic
            // conditions. Farmers are often outdoors with wind/animals/
            // tractor noise in the background and phones held further from
            // the mouth — that combination makes the default VAD miss the
            // start of speech sometimes ("she doesn't listen") or notice it
            // late ("late listen"). Turning start-of-speech sensitivity up
            // and giving more prefix padding + silence tolerance fixes both:
            //   - HIGH start sensitivity + more prefixPaddingMs → catches
            //     the first syllable instead of missing it
            //   - LOW end sensitivity + longer silenceDurationMs → doesn't
            //     assume the farmer is done just because of a short pause
            realtimeInputConfig: {
              automaticActivityDetection: {
                startOfSpeechSensitivity: 'START_SENSITIVITY_HIGH',
                endOfSpeechSensitivity: 'END_SENSITIVITY_LOW',
                // Short prefix + short end silence makes the assistant
                // react quickly without waiting through the old 700ms gap.
                prefixPaddingMs: 120,
                silenceDurationMs: 350
              }
            }
          }
        };
        upstream.send(JSON.stringify(setupMessage));
      });

      upstream.on('message', (data) => {
        let parsed;
        try { parsed = JSON.parse(data.toString()); } catch (e) { return; }

        if (parsed.setupComplete) {
          upstreamReady = true;
          clientWs.send(JSON.stringify({ type: 'ready' }));
          return;
        }

        const sc = parsed.serverContent;
        if (sc) {
          if (sc.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }
          if (sc.inputTranscription && sc.inputTranscription.text) {
            clientWs.send(JSON.stringify({ type: 'inputTranscript', text: sc.inputTranscription.text }));
          }
          if (sc.outputTranscription && sc.outputTranscription.text) {
            clientWs.send(JSON.stringify({ type: 'outputTranscript', text: sc.outputTranscription.text }));
          }
          if (sc.modelTurn && Array.isArray(sc.modelTurn.parts)) {
            sc.modelTurn.parts.forEach(part => {
              if (part.inlineData && part.inlineData.data) {
                clientWs.send(JSON.stringify({ type: 'audio', data: part.inlineData.data, mimeType: part.inlineData.mimeType }));
              }
            });
          }
          if (sc.turnComplete) {
            clientWs.send(JSON.stringify({ type: 'turnComplete' }));
          }
        }

        if (parsed.error) {
          clientWs.send(JSON.stringify({ type: 'error', message: parsed.error.message || 'Live session error.' }));
        }
      });

      upstream.on('error', (err) => {
        console.error('Gemini Live upstream error:', err.message);
        try { clientWs.send(JSON.stringify({ type: 'error', message: 'Voice connection lost. Please try again.' })); } catch(e){}
      });
      upstream.on('close', (code, reason) => {
        upstreamReady = false;
        const detail = reason && reason.length ? reason.toString() : `code ${code}`;
        console.warn(`[Live] Gemini upstream closed — ${detail}`);
        try {
          clientWs.send(JSON.stringify({
            type: 'error',
            message: 'Gemini से connection टूट गया। कृपया बंद करके दोबारा खोलें।'
          }));
        } catch(e){}
      });
      return;
    }

    if (!upstream || upstream.readyState !== WebSocket.OPEN) return;

    if (msg.type === 'audio' && msg.data) {
      upstream.send(JSON.stringify({ realtimeInput: { audio: { data: msg.data, mimeType: 'audio/pcm;rate=16000' } } }));
    } else if (msg.type === 'audioStreamEnd') {
      upstream.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } }));
    } else if (msg.type === 'end') {
      try { upstream.close(); } catch(e){}
    }
  });

  clientWs.on('close', () => {
    clearInterval(keepAliveInterval);
    if (upstream) { try { upstream.close(); } catch(e){} }
  });
  clientWs.on('error', () => {
    clearInterval(keepAliveInterval);
    if (upstream) { try { upstream.close(); } catch(e){} }
  });
}

// ===================================================================
//  Serve the whole Gaon Sathi site (the folder ABOVE server/) so that
//  running just this one server gives you the site + the schemes API
//  + the admin panel, all from http://localhost:PORT — no second
//  static server needed. This does not change anything about how the
//  site works if you still prefer opening index.html directly / via
//  your own static host; the API above works from any origin (CORS
//  is enabled), it just needs its own URL configured in that case.
// ===================================================================
app.use(express.static(path.join(__dirname, '..')));

// ===================================================================
//  SERVER 1 — Main HTTP server: REST API + /curtain WebSocket
//  (inaugurate lock broadcast). Runs on PORT (8787 / process.env.PORT)
// ===================================================================
const server = http.createServer(app);

// उद्घाटन ताला — every visitor's curtain opens live when VP sir taps
// the button. Each locked browser holds one WebSocket to /curtain and
// just listens — the moment /api/inaugurate/unlock succeeds above,
// broadcastCurtainUnlock() pushes one "unlocked" message to all.
const curtainWss = new WebSocket.Server({ server, path: '/curtain' });
curtainWss.on('connection', (ws) => {
  const current = loadInaugurate();
  try {
    ws.send(JSON.stringify({ type: 'status', unlocked: current.unlocked, unlockedAt: current.unlockedAt }));
  } catch (e) {}

  // Keepalive ping so Render's 55-second idle timeout doesn't drop
  // the curtain socket before the broadcast fires.
  const curtainPing = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      try { ws.ping(); } catch (e) {}
    } else {
      clearInterval(curtainPing);
    }
  }, 20000);
  ws.on('close', () => clearInterval(curtainPing));
  ws.on('error', () => clearInterval(curtainPing));
});

function broadcastCurtainUnlock(state) {
  const payload = JSON.stringify({ type: 'unlocked', unlockedAt: state.unlockedAt });
  curtainWss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try { client.send(payload); } catch (e) {}
    }
  });
}

server.listen(PORT, () => {
  console.log(`Gaon Sathi server running → http://localhost:${PORT}`);
  console.log(`Admin panel              → http://localhost:${PORT}/admin/admin.html`);
  console.log(`Curtain broadcast socket → ws://localhost:${PORT}/curtain`);
  console.log(GEMINI_API_KEY ? 'GEMINI_API_KEY loaded ✔' : '⚠ GEMINI_API_KEY missing — set it in server/.env');
  console.log(process.env.ADMIN_PASSWORD ? 'ADMIN_PASSWORD loaded ✔' : '⚠ ADMIN_PASSWORD not set — using default password "gaonsathi123". Set your own in server/.env');
});

// ===================================================================
//  SERVER 2 — Dedicated Live Voice WebSocket server on LIVE_PORT
//  (8788 / process.env.LIVE_PORT). Completely separate http.Server
//  so Live Voice traffic never shares a port with REST or /curtain —
//  no routing conflicts, no proxy ambiguity on Render.
//  crop.js connects to: window.GAON_SATHI_LIVE_BASE + '/live'
// ===================================================================
const liveApp = require('express')();
liveApp.use(cors());
// Health check so Render (which probes the service) doesn't mark it down
liveApp.get('/health', (_req, res) => res.json({ ok: true }));

const liveServer = http.createServer(liveApp);
const liveWss = new WebSocket.Server({ server: liveServer, path: '/live' });
liveWss.on('connection', handleLiveConnection);

liveServer.listen(LIVE_PORT, () => {
  console.log(`Live Voice WebSocket     → ws://localhost:${LIVE_PORT}/live`);
});
