// ===================================================================
//  CROP SATHI — AI crop chat tool logic, split out of kisan.js.
//  This script is LAZY-LOADED by kisan/kisan.js only the first time a
//  visitor opens the "crop" sub-section, after crop.html has been
//  injected into #cropLayoutMount. It must NOT be added to the eager
//  script list in index.html — that would defeat the whole point of
//  splitting it out (this file, plus crop.css, is the bulk of the
//  weight the AI chat tool adds to the page).
// ===================================================================

(function(){
  // Directory this script itself was loaded from (trailing slash kept),
  // used only to locate mic-worklet-processor.js next to crop.js —
  // document.currentScript is only reliable synchronously at top-level
  // script execution, so it's captured here rather than inside lvStartMic.
  const SCRIPT_DIR = (function(){
    const src = document.currentScript && document.currentScript.src;
    return src ? src.replace(/[^/]*$/, '') : './';
  })();

  function isEn(){ return document.documentElement.lang === 'en'; }

  // Rough FALLBACK-ONLY language guess, used only if the model ever
  // omits reply_lang from its JSON (see buildFollowupPrompt/
  // buildGeneralPrompt below). Deliberately not used as the primary
  // signal: it just checks script (Devanagari vs Latin), and a lot of
  // farmers type Hindi using English letters ("kya haal hai"), which
  // this would wrongly call English. The model itself judges the real
  // language from the words/meaning — this is just a safety net.
  function detectLangFromText(text){
    if(!text || !/[a-zA-Z\u0900-\u097F]/.test(text)) return isEn() ? 'en' : 'hi';
    return /[\u0900-\u097F]/.test(text) ? 'hi' : 'en';
  }

  // Guard: only run if crop.html's markup is actually in the DOM.
  const chatThreadGuard = document.getElementById('chatThread');
  if(!chatThreadGuard) return;

  // =========================================================
  //  2) TEXT-TO-SPEECH — reads AI replies aloud for anyone who
  //      cannot read. Uses Gemini's real native voice model via our
  //      server proxy (server/server.js → /api/gemini/tts) so it
  //      sounds natural instead of the browser's robotic built-in
  //      voice. Falls back to the browser voice only if the server
  //      is unreachable or Gemini TTS errors out, so reading-aloud
  //      never just silently does nothing.
  // =========================================================
  let activeTTSAudio = null; // currently-playing Gemini TTS <audio>, if any

  function stopAllSpeech(){
    if(activeTTSAudio){
      try{ activeTTSAudio.pause(); }catch(e){}
      activeTTSAudio = null;
    }
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  // Fetches real Gemini speech audio for `text` and plays it. Calls
  // onStart when playback begins and onEnd when it finishes (either
  // naturally or via stopAllSpeech()). Resolves true if Gemini audio
  // played, false if the caller should fall back to browser speech.
  async function speakWithGemini(text, onStart, onEnd){
    try{
      const res = await fetch(`${AI_PROXY_BASE}/api/gemini/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if(!res.ok) return false;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      activeTTSAudio = audio;
      audio.onended = () => { URL.revokeObjectURL(url); if(activeTTSAudio === audio) activeTTSAudio = null; if(onEnd) onEnd(); };
      audio.onerror = () => { URL.revokeObjectURL(url); if(activeTTSAudio === audio) activeTTSAudio = null; if(onEnd) onEnd(); };
      if(onStart) onStart();
      await audio.play();
      return true;
    }catch(e){
      return false;
    }
  }

  function speakText(text, btn, lang){
    if(!text) return;
    stopAllSpeech();
    const start = () => { if(btn) btn.classList.add('speaking'); };
    const end = () => { if(btn) btn.classList.remove('speaking'); };
    speakWithGemini(text, start, end).then(played => {
      if(played) return;
      // fallback — browser's built-in voice
      if(!('speechSynthesis' in window)) return;
      try{
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = (lang || (isEn() ? 'en' : 'hi')) === 'en' ? 'en-IN' : 'hi-IN';
        utter.rate = 0.95;
        utter.onstart = start;
        utter.onend = end;
        utter.onerror = end;
        window.speechSynthesis.speak(utter);
      }catch(e){ /* speech not available, ignore silently */ }
    });
  }

  function timeNow(){
    try{
      return new Date().toLocaleTimeString(isEn() ? 'en-IN' : 'hi-IN', {hour:'2-digit', minute:'2-digit'});
    }catch(e){ return ''; }
  }

  // =========================================================
  //  3) AI PROXY — the browser NEVER holds the Gemini API key.
  //     crop.js calls our own tiny local server (see /server), and
  //     that server attaches the key from server/.env when it talks
  //     to Google. Start it with: cd server && npm install && npm start
  // =========================================================
  const AI_PROXY_BASE = window.GAON_SATHI_API_BASE || "http://localhost:8787";

  async function callGemini(contents){
    const res = await fetch(`${AI_PROXY_BASE}/api/gemini/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    }).catch(() => null);
    if(!res){
      throw new Error(isEn() ? 'Could not reach the AI proxy. Is server/ running?' : 'AI proxy से जुड़ नहीं पाया। क्या server/ चालू है?');
    }
    if(res.status === 400 || res.status === 403 || res.status === 500){
      throw new Error(isEn() ? 'Crop Sathi is temporarily unavailable. Please try again later.' : 'फसल साथी अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद कोशिश करें।');
    }
    if(!res.ok){
      throw new Error(isEn() ? 'AI service did not respond. Please try again.' : 'AI सेवा से जवाब नहीं मिला। कृपया दोबारा कोशिश करें।');
    }
    const data = await res.json();
    const textOut = data && data.candidates && data.candidates[0] && data.candidates[0].content
      && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    if(!textOut){
      // Empty parts usually means Gemini's safety filter blocked this
      // particular reply (blockReason / finishReason:"SAFETY") rather
      // than a network hiccup — surface that distinctly so callers can
      // fall back to the raw search text instead of just erroring out.
      const blockReason = data && data.promptFeedback && data.promptFeedback.blockReason;
      const finishReason = data && data.candidates && data.candidates[0] && data.candidates[0].finishReason;
      if(blockReason || finishReason === 'SAFETY' || finishReason === 'PROHIBITED_CONTENT'){
        const blockedErr = new Error(isEn() ? 'AI response was filtered.' : 'AI का जवाब फ़िल्टर हो गया।');
        blockedErr.safetyBlocked = true;
        throw blockedErr;
      }
      throw new Error(isEn() ? 'Could not read AI response. Please try again.' : 'AI का जवाब समझ नहीं आया। कृपया दोबारा कोशिश करें।');
    }
    let parsed;
    try{ parsed = JSON.parse(textOut); }
    catch(e){ throw new Error(isEn() ? 'Could not read AI response. Please try again.' : 'AI का जवाब समझ नहीं आया। कृपया दोबारा कोशिश करें।'); }
    return { parsed, raw: textOut };
  }

  // Plain-text variant (no forced JSON) — used by Live Voice mode, where
  // the reply just needs to be short, natural, speakable text.
  async function callGeminiPlain(contents, maxTokens){
    const res = await fetch(`${AI_PROXY_BASE}/api/gemini/generate-plain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, maxTokens })
    }).catch(() => null);
    if(!res){
      throw new Error(isEn() ? 'Could not reach the AI proxy. Is server/ running?' : 'AI proxy से जुड़ नहीं पाया। क्या server/ चालू है?');
    }
    if(res.status === 400 || res.status === 403 || res.status === 500){
      throw new Error(isEn() ? 'Crop Sathi is temporarily unavailable. Please try again later.' : 'फसल साथी अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद कोशिश करें।');
    }
    if(!res.ok){
      throw new Error(isEn() ? 'AI service did not respond. Please try again.' : 'AI सेवा से जवाब नहीं मिला। कृपया दोबारा कोशिश करें।');
    }
    const data = await res.json();
    let textOut = data && data.candidates && data.candidates[0] && data.candidates[0].content
      && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    if(!textOut) throw new Error(isEn() ? 'Could not read AI response. Please try again.' : 'AI का जवाब समझ नहीं आया। कृपया दोबारा कोशिश करें।');
    // Strip stray markdown fences in case the model adds them anyway.
    textOut = textOut.trim().replace(/^```[a-z]*\n?/i, '').replace(/```$/,'').trim();
    return textOut;
  }

  // =========================================================
  //  4) ATTACH MENU (the "+" button — take photo / choose gallery)
  // =========================================================
  const waPlusBtn = document.getElementById('waPlusBtn');
  const waAttachMenu = document.getElementById('waAttachMenu');
  const cropImageInputCamera = document.getElementById('cropImageInputCamera');
  const cropImageInputGallery = document.getElementById('cropImageInputGallery');
  const takePicBtn = document.getElementById('takePicBtn');
  const galleryBtn = document.getElementById('galleryBtn');

  function openAttachMenu(){
    if(!waAttachMenu) return;
    waAttachMenu.hidden = false;
    if(waPlusBtn){ waPlusBtn.classList.add('open'); waPlusBtn.setAttribute('aria-expanded','true'); }
  }
  function closeAttachMenu(){
    if(!waAttachMenu) return;
    waAttachMenu.hidden = true;
    if(waPlusBtn){ waPlusBtn.classList.remove('open'); waPlusBtn.setAttribute('aria-expanded','false'); }
  }
  if(waPlusBtn){
    waPlusBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      if(waAttachMenu && waAttachMenu.hidden) openAttachMenu(); else closeAttachMenu();
    });
  }
  document.addEventListener('click', (e)=>{
    if(!waAttachMenu || waAttachMenu.hidden) return;
    if(waAttachMenu.contains(e.target) || (waPlusBtn && waPlusBtn.contains(e.target))) return;
    closeAttachMenu();
  });
  if(takePicBtn && cropImageInputCamera){
    takePicBtn.addEventListener('click', ()=>{ closeAttachMenu(); cropImageInputCamera.click(); });
  }
  if(galleryBtn && cropImageInputGallery){
    galleryBtn.addEventListener('click', ()=>{ closeAttachMenu(); cropImageInputGallery.click(); });
  }
  [cropImageInputCamera, cropImageInputGallery].forEach(input=>{
    if(!input) return;
    input.addEventListener('change', ()=>{
      const file = input.files && input.files[0];
      if(file) handleFile(file);
      input.value = '';
    });
  });

  // =========================================================
  //  5) LIVE LOCATION + WEATHER + SEASON
  //      Everything here is REAL data, not the model guessing:
  //      - weather: Open-Meteo, from the farmer's actual GPS coords
  //      - place name: reverse-geocoded from the same coords
  //      - season: computed from today's real date against the Indian
  //        crop-calendar (Kharif/Rabi/Zaid), not left to the AI
  //      All three get folded into EVERY prompt below (analysis,
  //      general chat, follow-up chat) so answers — dose, timing,
  //      "spray now or wait", which crop cycle — are grounded in the
  //      farmer's actual place and moment, not a generic answer.
  // =========================================================
  const weatherChip = document.getElementById('weatherChip');
  let weatherContext = null; // { summaryHi, summaryEn }
  let locationContext = null; // { hi, en, lat, lon }

  // Indian agricultural seasons by month (deterministic — no AI guessing):
  //   Kharif (खरीफ): sown with the monsoon, ~June–October
  //   Rabi   (रबी):   sown after monsoon, ~October–March
  //   Zaid   (ज़ायद):  short summer season, ~March–June
  function getIndianSeason(date){
    const m = (date || new Date()).getMonth() + 1; // 1-12
    if(m >= 6 && m <= 10) return { key:'kharif', hi:'खरीफ का मौसम (मानसून की फसल)', en:'Kharif season (monsoon crop cycle)' };
    if(m >= 10 || m <= 3) return { key:'rabi', hi:'रबी का मौसम (सर्दी की फसल)', en:'Rabi season (winter crop cycle)' };
    return { key:'zaid', hi:'ज़ायद का मौसम (गर्मी की छोटी फसल)', en:'Zaid season (short summer crop cycle)' };
  }
  const seasonContext = getIndianSeason();

  // Builds the block of real, current context every prompt below
  // includes: location, season, weather. Anything unavailable is
  // simply left out rather than guessed at.
  function buildContextBlock(){
    const lines = [];
    lines.push(`आज की तारीख: ${new Date().toLocaleDateString('hi-IN', { day:'numeric', month:'long', year:'numeric' })}, मौसम-चक्र: ${seasonContext.hi}`);
    if(locationContext) lines.push(`किसान की जगह: ${locationContext.hi}`);
    lines.push(weatherContext ? `वर्तमान मौसम: ${weatherContext.summaryHi}` : 'वर्तमान मौसम की जानकारी उपलब्ध नहीं है।');
    return lines.join('\n');
  }

  const WMO = {
    0:{hi:'साफ आसमान',en:'Clear sky'}, 1:{hi:'ज़्यादातर साफ',en:'Mostly clear'},
    2:{hi:'आंशिक बादल',en:'Partly cloudy'}, 3:{hi:'बादल छाए हुए',en:'Overcast'},
    45:{hi:'कोहरा',en:'Fog'}, 48:{hi:'घना कोहरा',en:'Dense fog'},
    51:{hi:'हल्की बूंदाबांदी',en:'Light drizzle'}, 53:{hi:'बूंदाबांदी',en:'Drizzle'}, 55:{hi:'तेज़ बूंदाबांदी',en:'Heavy drizzle'},
    61:{hi:'हल्की बारिश',en:'Light rain'}, 63:{hi:'बारिश',en:'Rain'}, 65:{hi:'तेज़ बारिश',en:'Heavy rain'},
    71:{hi:'हल्की बर्फबारी',en:'Light snow'}, 73:{hi:'बर्फबारी',en:'Snow'}, 75:{hi:'तेज़ बर्फबारी',en:'Heavy snow'},
    80:{hi:'बौछारें',en:'Rain showers'}, 81:{hi:'तेज़ बौछारें',en:'Heavy rain showers'}, 82:{hi:'बहुत तेज़ बौछारें',en:'Violent rain showers'},
    95:{hi:'आंधी-तूफान',en:'Thunderstorm'}, 96:{hi:'ओलों के साथ आंधी',en:'Thunderstorm with hail'}, 99:{hi:'भारी ओलों के साथ आंधी',en:'Thunderstorm with heavy hail'}
  };

  function setWeatherChip(html, cls){
    if(!weatherChip) return;
    weatherChip.className = 'wa-daypill wa-weather-pill' + (cls ? ' ' + cls : '');
    weatherChip.innerHTML = html;
  }

  function loadWeather(){
    if(!weatherChip) return;
    if(!('geolocation' in navigator)){
      weatherContext = null;
      setWeatherChip('<span class="wc-ic">⚠️</span><span>' + (isEn()?'Location not available — advice will skip weather':'लोकेशन उपलब्ध नहीं — सलाह में मौसम शामिल नहीं होगा') + '</span>', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      const {latitude, longitude, accuracy} = pos.coords;
      // Real GPS pin (same coords Google Maps itself would use) —
      // shown as a tappable link so the farmer can open it in Maps
      // and see/verify the exact dot themselves.
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

      // Reverse-geocode in parallel with weather — free, no-key
      // BigDataCloud endpoint, CORS-enabled for browser calls. If it
      // fails we just skip the place name; weather still works.
      const geocodePromise = fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=hi`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      try{
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`;
        const res = await fetch(url);
        if(!res.ok) throw new Error('weather fetch failed');
        const data = await res.json();
        const c = data.current;
        const cond = WMO[c.weather_code] || {hi:'सामान्य मौसम', en:'Normal weather'};
        const summaryHi = `तापमान ${Math.round(c.temperature_2m)}°C, नमी ${c.relative_humidity_2m}%, हालत: ${cond.hi}, बारिश ${c.precipitation} mm, हवा ${Math.round(c.wind_speed_10m)} km/h`;
        const summaryEn = `Temperature ${Math.round(c.temperature_2m)}°C, humidity ${c.relative_humidity_2m}%, condition: ${cond.en}, precipitation ${c.precipitation} mm, wind ${Math.round(c.wind_speed_10m)} km/h`;
        weatherContext = {summaryHi, summaryEn};

        const geo = await geocodePromise;
        if(geo){
          const place = geo.city || geo.locality || geo.principalSubdivision || '';
          const district = geo.localityInfo && geo.localityInfo.administrative
            ? (geo.localityInfo.administrative.find(a => a.adminLevel === 6 || /district|ज़िला|जिला/i.test(a.name || ''))||{}).name
            : '';
          const state = geo.principalSubdivision || '';
          const parts = [place, district && district !== place ? district : '', state].filter(Boolean);
          if(parts.length){
            locationContext = {
              hi: parts.join(', '),
              en: parts.join(', '),
              lat: latitude, lon: longitude,
              accuracy, mapsUrl
            };
          }
        }
        // Even if reverse-geocoding fails or returns nothing useful,
        // still keep the raw coords + Maps link — that's the actual
        // "exact" part; the place NAME is just a nice label on top.
        if(!locationContext){
          locationContext = { hi:'', en:'', lat: latitude, lon: longitude, accuracy, mapsUrl };
        }

        const placeLabel = locationContext.hi ? locationContext.hi : (isEn() ? 'Exact location' : 'सटीक लोकेशन');
        const placeSuffix = ` — 📍 <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="wc-maps-link">${escapeHtml(placeLabel)}</a>`;
        setWeatherChip(`<span class="wc-ic">${weatherIcon(c.weather_code)}</span><span>${(isEn() ? summaryEn : summaryHi)}${placeSuffix}</span>`, 'ready');
      } catch(err){
        weatherContext = null;
        setWeatherChip('<span class="wc-ic">⚠️</span><span>' + (isEn()?'Could not load weather — advice will skip it':'मौसम लोड नहीं हुआ — सलाह में मौसम शामिल नहीं होगा') + '</span>', 'error');
      }
    }, ()=>{
      weatherContext = null;
      setWeatherChip('<span class="wc-ic">⚠️</span><span>' + (isEn()?'Location permission denied — advice will skip weather':'लोकेशन की अनुमति नहीं मिली — सलाह में मौसम शामिल नहीं होगा') + '</span>', 'error');
    }, {
      // enableHighAccuracy=true tells the phone to use its actual GPS
      // chip (satellite fix) instead of the fast-but-rough
      // network/cell-tower estimate, which is what was making this
      // feel off compared to Google Maps (that can be several hundred
      // metres to a few km out). maximumAge:0 stops it from reusing an
      // old cached fix from earlier. Takes a bit longer the first time
      // — worth it for the accuracy — so the timeout is raised too.
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    });
  }
  function weatherIcon(code){
    if(code===0||code===1) return '☀️';
    if(code===2) return '⛅';
    if(code===3) return '☁️';
    if(code>=45&&code<=48) return '🌫️';
    if(code>=51&&code<=67) return '🌦️';
    if(code>=71&&code<=77) return '❄️';
    if(code>=80&&code<=82) return '🌧️';
    if(code>=95) return '⛈️';
    return '🌤️';
  }
  loadWeather();

  // =========================================================
  //  6) CHAT THREAD — one continuous WhatsApp-style conversation.
  //     Sending a photo (via the + menu) triggers the first AI
  //     check automatically; after that the farmer can keep
  //     asking anything, either by typing or by tapping the mic.
  // =========================================================
  const chatThread = document.getElementById('chatThread');
  const chatHeadStatus = document.getElementById('chatHeadStatus');
  const scanError = document.getElementById('scanError');
  const composerQuick = document.getElementById('composerQuick');
  const waResetBtn = document.getElementById('waResetBtn');

  let chatHistory = [];        // Gemini "contents" array — full conversation, incl. image
  let chatBusy = false;
  let selectedImageMime = 'image/jpeg';

  function hideInlineError(){ if(scanError){ scanError.hidden = true; scanError.textContent = ''; } }
  function showInlineError(msg){
    if(scanError){ scanError.hidden = false; scanError.textContent = msg; }
    scrollThreadToBottom();
  }
  function setHeadStatus(hi, en){
    if(!chatHeadStatus) return;
    chatHeadStatus.textContent = isEn() ? en : hi;
  }
  function scrollThreadToBottom(){
    if(chatThread) requestAnimationFrame(()=>{ chatThread.scrollTop = chatThread.scrollHeight; });
  }

  function resetAll(){
    if(typeof lvSessionOpen !== 'undefined' && lvSessionOpen) closeLiveVoice();
    chatHistory = [];
    chatBusy = false;
    if(chatThread){
      chatThread.querySelectorAll('.wa-msg').forEach(n => n.remove());
    }
    if(composerQuick){ composerQuick.hidden = true; composerQuick.innerHTML = ''; }
    hideInlineError();
    setComposerBusy(false);
    setHeadStatus('ऑनलाइन', 'Online');
    scrollThreadToBottom();
  }
  if(waResetBtn) waResetBtn.addEventListener('click', resetAll);

  function el(tag, cls, html){
    const e = document.createElement('div');
    if(cls) e.className = cls;
    if(html !== undefined) e.innerHTML = html;
    return e;
  }

  function addTypingBubble(){
    const row = el('div', 'chat-row chat-row-ai chat-row-typing wa-msg');
    row.innerHTML = `
      <span class="chat-avatar">🌱</span>
      <div class="chat-bubble chat-bubble-ai chat-typing">
        <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
      </div>`;
    chatThread.appendChild(row);
    scrollThreadToBottom();
    return row;
  }

  function addUserTextBubble(text){
    const row = el('div', 'chat-row chat-row-user wa-msg');
    row.innerHTML = `<div class="chat-bubble chat-bubble-user">${escapeHtml(text)}<span class="chat-time">${timeNow()}</span></div>`;
    chatThread.appendChild(row);
    scrollThreadToBottom();
  }

  function addUserPhotoBubble(dataUrl){
    const row = el('div', 'chat-row chat-row-user wa-msg');
    row.innerHTML = `<div class="chat-bubble chat-bubble-user chat-bubble-photo"><img src="${dataUrl}" alt=""><span class="chat-time">${timeNow()}</span></div>`;
    chatThread.appendChild(row);
    scrollThreadToBottom();
  }

  // ---- initial full analysis card (rich) ----
  function addAnalysisBubble(r, thumbSrc){
    const en = isEn();
    const healthy = !!r.is_healthy;
    const cropName = en ? (r.crop_name_en || r.crop_name_hi) : (r.crop_name_hi || r.crop_name_en);
    const cropNameSub = en ? r.crop_name_hi : r.crop_name_en;
    const about = en ? (r.about_en || r.about_hi) : (r.about_hi || r.about_en);
    const diseaseName = en ? (r.disease_name_en || r.disease_name_hi) : (r.disease_name_hi || r.disease_name_en);
    const cause = en ? (r.cause_en || r.cause_hi) : (r.cause_hi || r.cause_en);
    const solution = en ? (r.solution_en || r.solution_hi) : (r.solution_hi || r.solution_en);
    const weatherAdvice = en ? (r.weather_advice_en || r.weather_advice_hi) : (r.weather_advice_hi || r.weather_advice_en);

    let html = `
      <div class="result-top">
        <img class="result-crop-thumb" src="${thumbSrc}" alt="">
        <div>
          <h4 class="result-crop-name">${escapeHtml(cropName || '—')}<span class="eng">${escapeHtml(cropNameSub || '')}</span></h4>
          <span class="health-badge ${healthy ? 'healthy' : 'sick'}">
            ${healthy ? '✅ ' + (en?'Healthy':'स्वस्थ') : '⚠️ ' + (en?'Problem found':'समस्या मिली')}
          </span>
        </div>
        <button type="button" class="speak-btn" title="${en ? 'Listen' : 'सुनें'}">🔊</button>
      </div>
      <div class="result-block">
        <h5>📋 ${en?'About this crop':'फसल की जानकारी'}</h5>
        <p>${escapeHtml(about || '—')}</p>
      </div>
    `;
    if(!healthy && diseaseName){
      html += `
        <div class="result-block disease-block">
          <h5>🩺 ${en?'Disease / Problem':'बीमारी / समस्या'}</h5>
          <p><strong>${escapeHtml(diseaseName || '')}</strong></p>
          ${cause ? `<p><strong>${en?'Cause: ':'कारण: '}</strong>${escapeHtml(cause)}</p>` : ''}
          ${solution ? `<p><strong>${en?'Solution: ':'उपाय: '}</strong>${escapeHtml(solution)}</p>` : ''}
        </div>
      `;
    }
    if(weatherAdvice){
      html += `
        <div class="result-block weather-block">
          <h5>${weatherContext ? weatherIcon(0) : '☀️'} ${en?'What to do right now (weather-based)':'अभी क्या करें (मौसम अनुसार)'}</h5>
          <p>${escapeHtml(weatherAdvice)}</p>
        </div>
      `;
    }

    const row = el('div', 'chat-row chat-row-ai wa-msg');
    row.innerHTML = `<span class="chat-avatar">🌱</span><div class="chat-bubble chat-bubble-ai chat-bubble-card">${html}</div>`;
    chatThread.appendChild(row);
    scrollThreadToBottom();

    const speakBtn = row.querySelector('.speak-btn');
    const spokenParts = [cropName, about];
    if(!healthy && diseaseName){ spokenParts.push(diseaseName, cause, solution); }
    if(weatherAdvice) spokenParts.push(weatherAdvice);
    const spoken = spokenParts.filter(Boolean).join('। ');
    if(speakBtn) speakBtn.addEventListener('click', () => speakText(spoken, speakBtn));
    return spoken;
  }

  // ---- short conversational answer bubble ----
  // `sources` (optional): [{title, uri}] from a live web search that
  // grounded this answer — shown as small tappable links so the
  // farmer (or anyone checking the app) can see where the real-time
  // info (price/scheme/product) came from.
  // `replyLang` (optional): 'hi' or 'en' — the language THIS message
  // should render in, detected from what the farmer typed (see
  // detectLangFromText). Falls back to the site-wide EN/HI toggle only
  // when not given, so old call sites keep working unchanged.
  function addAnswerBubble(r, sources, replyLang){
    const en = replyLang ? replyLang === 'en' : isEn();
    const answer = en ? (r.answer_en || r.answer_hi) : (r.answer_hi || r.answer_en);
    const followup = en ? (r.followup_en || r.followup_hi) : (r.followup_hi || r.followup_en);

    let html = `<p>${escapeHtml(answer || '—')}</p>`;
    if(followup){
      html += `<p class="chat-followup">💡 ${escapeHtml(followup)}</p>`;
    }
    if(sources && sources.length){
      html += `<div class="chat-sources">
        <span class="chat-sources-label">🔎 ${en ? 'Checked live on the web:' : 'अभी इंटरनेट पर देखा गया:'}</span>
        ${sources.map(s => `<a href="${s.uri}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)}</a>`).join('')}
      </div>`;
    }
    html += `<div style="display:flex;align-items:center;justify-content:space-between;">
        <span class="chat-time" style="margin-top:0;">${timeNow()}</span>
        <button type="button" class="speak-btn speak-btn-sm" title="${en ? 'Listen' : 'सुनें'}">🔊</button>
      </div>`;

    const row = el('div', 'chat-row chat-row-ai wa-msg');
    row.innerHTML = `<span class="chat-avatar">🌱</span><div class="chat-bubble chat-bubble-ai">${html}</div>`;
    chatThread.appendChild(row);
    scrollThreadToBottom();

    const speakBtn = row.querySelector('.speak-btn');
    const spoken = [answer, followup].filter(Boolean).join('। ');
    if(speakBtn) speakBtn.addEventListener('click', () => speakText(spoken, speakBtn, en ? 'en' : 'hi'));
    return spoken;
  }

  function escapeHtml(str){
    if(!str) return '';
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // =========================================================
  //  7) HANDLE AN INCOMING PHOTO — sent like a WhatsApp photo
  //      message, then checked by the AI automatically.
  // =========================================================
  function handleFile(file){
    if(!file || !file.type.startsWith('image/')) return;
    if(file.size > 5 * 1024 * 1024){
      showInlineError(isEn() ? 'Image is too large. Please use a photo under 5MB.' : 'फोटो बहुत बड़ी है। कृपया 5MB से छोटी फोटो चुनें।');
      return;
    }
    if(chatBusy) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      selectedImageMime = file.type;
      const base64 = dataUrl.split(',')[1];
      hideInlineError();
      addUserPhotoBubble(dataUrl);
      analyzeCrop(base64, dataUrl);
    };
    reader.onerror = () => {
      showInlineError(isEn() ? 'Could not read this photo. Please try again.' : 'यह फोटो पढ़ी नहीं जा सकी। कृपया दोबारा कोशिश करें।');
    };
    reader.readAsDataURL(file);
  }

  function buildAnalysisPrompt(){
    return `${CHAT_PERSONA}

आप साथ ही एक अनुभवी भारतीय कृषि वैज्ञानिक भी हैं, तो सलाह वैज्ञानिक रूप से सही और भरोसेमंद हो — बस भाषा प्यारी और आसान रखें। नीचे दी गई फसल की फोटो को ध्यान से देखें।

${buildContextBlock()}

फोटो के आधार पर विश्लेषण करें और सिर्फ नीचे दिए गए JSON फॉर्मेट में जवाब दें — कोई अतिरिक्त टेक्स्ट, कोई मार्कडाउन बैकटिक नहीं, सिर्फ शुद्ध JSON:

{
  "crop_name_hi": "फसल का नाम हिंदी में (या 'फसल पहचान नहीं हुई' अगर फोटो में फसल स्पष्ट नहीं है)",
  "crop_name_en": "crop name in English",
  "about_hi": "फसल के बारे में 2-3 वाक्य में जानकारी (हिंदी में)",
  "about_en": "2-3 sentence description of the crop in English",
  "is_healthy": true या false,
  "disease_name_hi": "अगर बीमारी/समस्या दिखे तो उसका नाम, वरना खाली स्ट्रिंग",
  "disease_name_en": "disease/issue name in English, empty string if healthy",
  "cause_hi": "बीमारी का कारण हिंदी में, वरना खाली",
  "cause_en": "cause in English, empty if healthy",
  "solution_hi": "इलाज/समाधान हिंदी में विस्तार से, वरना खाली",
  "solution_en": "detailed solution/treatment in English, empty if healthy",
  "weather_advice_hi": "ऊपर दिए गए मौसम के अनुसार अभी किसान को क्या करना चाहिए, हिंदी में व्यावहारिक सलाह",
  "weather_advice_en": "practical advice in English on what the farmer should do right now, based on the weather above"
}

इसके बाद भी किसान इसी फोटो और बातचीत को लेकर आगे सवाल पूछ सकता है — इसलिए फोटो को ध्यान से याद रखें।`;
  }

  async function analyzeCrop(base64, thumbSrc){
    hideInlineError();
    setComposerBusy(true);
    const typingRow = addTypingBubble();
    setHeadStatus('फोटो पढ़ी जा रही है...', 'Reading your photo...');

    try{
      const userTurn = {
        role: 'user',
        parts: [
          { text: buildAnalysisPrompt() },
          { inline_data: { mime_type: selectedImageMime, data: base64 } }
        ]
      };
      const { parsed, raw } = await callGemini([userTurn]);
      chatHistory.push(userTurn);
      chatHistory.push({ role:'model', parts:[{ text: raw }] });

      if(typingRow) typingRow.remove();
      const spoken = addAnalysisBubble(parsed, thumbSrc);
      speakText(spoken, null);
      unlockQuickQuestions();
      setHeadStatus('ऑनलाइन', 'Online');
    } catch(err){
      if(typingRow) typingRow.remove();
      showInlineError(err.message || (isEn() ? 'Something went wrong. Please try again.' : 'कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।'));
      setHeadStatus('ऑनलाइन', 'Online');
    } finally{
      setComposerBusy(false);
    }
  }

  // =========================================================
  //  8) COMPOSER — one input row. Typing shows a send arrow;
  //      an empty box shows a mic for voice questions.
  // =========================================================
  const composerTextRow = document.getElementById('composerTextRow');
  const composerInput = document.getElementById('composerInput');
  const composerSendBtn = document.getElementById('composerSendBtn');
  const waMicBtn = document.getElementById('waMicBtn');
  const voiceUnsupported = document.getElementById('voiceUnsupported');

  const QUICK_QUESTIONS = [
    { hi:'कीटनाशक/खाद कौन सा और कितना लगाऊं?', en:'Which fertilizer or pesticide, and how much?' },
    { hi:'यह समस्या कब तक ठीक हो जाएगी?', en:'How long until this problem is fixed?' },
    { hi:'अगली फसल के लिए क्या सलाह है?', en:'Any advice for the next crop?' },
    { hi:'क्या यह समस्या दूसरे पौधों में फैल सकती है?', en:'Can this spread to other plants?' }
  ];

  function unlockQuickQuestions(){
    if(!composerQuick) return;
    composerQuick.innerHTML = '';
    QUICK_QUESTIONS.forEach(q=>{
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'quick-chip';
      chip.textContent = isEn() ? q.en : q.hi;
      chip.addEventListener('click', ()=>{ if(!chatBusy) sendChatMessage(isEn() ? q.en : q.hi); });
      composerQuick.appendChild(chip);
    });
    composerQuick.hidden = false;
  }

  function refreshSendIcon(){
    // send button is now always the send arrow — this just enables/disables it
    if(!composerInput || !composerSendBtn) return;
    const hasText = composerInput.value.trim().length > 0;
    composerSendBtn.classList.toggle('is-ready', hasText);
  }
  if(composerInput) composerInput.addEventListener('input', refreshSendIcon);

  function setComposerBusy(busy){
    chatBusy = busy;
    if(composerInput) composerInput.disabled = busy;
    if(composerSendBtn) composerSendBtn.disabled = busy;
    if(waMicBtn) waMicBtn.disabled = busy;
  }

  // Shared personality for every text-chat reply — same warm, cute,
  // "apni behen jaisi" tone as Live Voice mode (see LIVE_VOICE_PERSONA
  // in server.js), just written for a typed chat bubble instead of
  // spoken audio, so text chat doesn't feel more formal/robotic than
  // voice chat.
  const CHAT_PERSONA = `आप "फसल साथी" हैं — भारतीय किसानों के लिए एक अपनी, प्यारी और दोस्ताना AI कृषि सहायक, जैसे कोई अपनी छोटी बहन या करीबी दोस्त खेत की बात कर रही हो, कोई सरकारी अफसर या रोबोट जैसा जवाब नहीं देना।
- लहजा गर्मजोशी भरा, अपनापन लिए और थोड़ा प्यारा हो — छोटी-छोटी सराहना या हौसला-अफज़ाई वाली बातें ठीक हैं (जैसे "बढ़िया सवाल है!", "चिंता मत करो, ये आसान है", "अरे वाह!"), हल्के-फुल्के emoji ठीक हैं पर हर लाइन में नहीं।
- भाषा एकदम आसान, रोज़मर्रा की हो — कोई मुश्किल कृषि शब्द नहीं, जैसे किसी अपने से मुँह-जुबानी बात कर रहे हों, भाषण या रिपोर्ट जैसा मत लिखिए।
- किसान जिस भाषा/लहजे में पूछे उसी में जवाब दें।
- Apni identity (ki aapko Ashutosh aur Keshav ne develop kiya hai) sirf tab tak seedha mat batao jab tak zaroorat na ho — lekin jab bhi situation khud ban jaaye (seedha poochhe, tareef kare, developer/credit se juda sawaal ho, ya baat naturally us taraf mude) to khud judge karke, apne alfaazon mein, halke Hinglish mein bata do ki Ashutosh aur Keshav ne aapko develop kiya hai. Agar sawaal kheti se hatke, out-of-topic/general ho (jaise "tum kaun ho") to "develop" ki jagah "train" word use karke, crop/kheti ke context ke saath bata do ki Ashutosh aur Keshav ne aapko crop ke liye train kiya hai. Yeh koi fixed, rata-rataya vaakya nahi honi chahiye — har baar situation aur poore conversation ke hisaab se apna naya, sahaj vaakya banaiye, jaise ek insaan apne mind se bolta hai, kisi script se padh kar nahi. Bina wajah har jawaab mein yeh mat thoonsiye, sirf jab context sach mein banta ho.`;

  // `searchNote` (optional) is real, freshly-searched text from
  // callGeminiSearch() below — e.g. actual pesticide brand/dose info,
  // current mandi price, an active scheme. When present the model is
  // told to prefer it over its own memory.
  // NOTE on language: we deliberately do NOT pre-decide hi/en here by
  // looking at the script (Latin vs Devanagari) — a LOT of farmers type
  // Hindi using English letters ("kya haal hai", "dawa kaunsi lagayein")
  // and that is still Hindi, not English. So instead we ask the model
  // itself to judge the ACTUAL language from the words/meaning and
  // report it back via "reply_lang" in the JSON below — crop.js then
  // just displays whichever of answer_hi/answer_en that field points
  // to, no guessing on our side.
  function buildFollowupPrompt(question, searchNote){
    const searchBlock = searchNote
      ? `\nनीचे इंटरनेट पर अभी खोजी गई ताज़ा, सटीक जानकारी है — अपने पुराने अंदाज़े की बजाय इसी को आधार बनाकर जवाब दें:\n"""${searchNote}"""\n`
      : '';
    return `${CHAT_PERSONA}

किसान ने इसी फसल/फोटो को लेकर बातचीत आगे बढ़ाते हुए एक नया सवाल पूछा है। ऊपर की पूरी बातचीत और फोटो को ध्यान में रखते हुए जवाब दें।

ज़रूरी: किसान चाहे हिंदी लिपि में लिखे, या रोमन/अंग्रेज़ी अक्षरों में हिंदी लिखे (जैसे "kya haal hai", "dawa kaunsi lagayein" — यह भी हिंदी ही है, अंग्रेज़ी नहीं), असली भाषा शब्दों/मतलब से पहचानें, सिर्फ अक्षरों से नहीं। अगर सवाल असल में हिंदी/हिंग्लिश में है, चाहे वह किसी भी लिपि में टाइप हुआ हो, reply_lang "hi" रखें। सिर्फ तभी "en" रखें जब सवाल सच में अंग्रेज़ी में हो।

${buildContextBlock()}
${searchBlock}
किसान का नया सवाल: "${question}"

सिर्फ नीचे दिए गए JSON फॉर्मेट में जवाब दें — कोई अतिरिक्त टेक्स्ट, कोई मार्कडाउन बैकटिक नहीं, सिर्फ शुद्ध JSON:

{
  "reply_lang": "hi या en — सिर्फ इन दो शब्दों में से एक, किसान के सवाल की असली भाषा (लिपि नहीं, मतलब देखकर)",
  "answer_hi": "किसान के सवाल का प्यारा, आसान और व्यावहारिक जवाब हिंदी में (बोलकर सुनाए जाने लायक भाषा में)",
  "answer_en": "same answer in warm, simple spoken-style English",
  "followup_hi": "अगर ज़रूरी हो तो एक छोटी अतिरिक्त सलाह, वरना खाली स्ट्रिंग",
  "followup_en": "one extra short tip if useful, empty string otherwise"
}`;
  }

  // Used when the farmer asks a question BEFORE sending any crop photo —
  // no image/context to refer back to yet, just a general farming Q&A.
  function buildGeneralPrompt(question, searchNote){
    const searchBlock = searchNote
      ? `\nनीचे इंटरनेट पर अभी खोजी गई ताज़ा, सटीक जानकारी है — अपने पुराने अंदाज़े की बजाय इसी को आधार बनाकर जवाब दें:\n"""${searchNote}"""\n`
      : '';
    return `${CHAT_PERSONA}

किसान ने अभी तक कोई फसल की फोटो नहीं भेजी है, सिर्फ एक सवाल पूछा है।

ज़रूरी: किसान चाहे हिंदी लिपि में लिखे, या रोमन/अंग्रेज़ी अक्षरों में हिंदी लिखे (जैसे "kya haal hai", "dawa kaunsi lagayein" — यह भी हिंदी ही है, अंग्रेज़ी नहीं), असली भाषा शब्दों/मतलब से पहचानें, सिर्फ अक्षरों से नहीं। अगर सवाल असल में हिंदी/हिंग्लिश में है, चाहे वह किसी भी लिपि में टाइप हुआ हो, reply_lang "hi" रखें। सिर्फ तभी "en" रखें जब सवाल सच में अंग्रेज़ी में हो।

${buildContextBlock()}
${searchBlock}
किसान का सवाल: "${question}"

सिर्फ नीचे दिए गए JSON फॉर्मेट में जवाब दें — कोई अतिरिक्त टेक्स्ट, कोई मार्कडाउन बैकटिक नहीं, सिर्फ शुद्ध JSON:

{
  "reply_lang": "hi या en — सिर्फ इन दो शब्दों में से एक, किसान के सवाल की असली भाषा (लिपि नहीं, मतलब देखकर)",
  "answer_hi": "किसान के सवाल का प्यारा, आसान और व्यावहारिक जवाब हिंदी में (बोलकर सुनाए जाने लायक भाषा में)",
  "answer_en": "same answer in warm, simple spoken-style English",
  "followup_hi": "अगर ज़रूरी हो तो एक छोटी अतिरिक्त सलाह, वरना खाली स्ट्रिंग",
  "followup_en": "one extra short tip if useful, empty string otherwise"
}`;
  }

  // =========================================================
  //  6b) LIVE SEARCH — decides when a question needs REAL, current
  //      info (not the model's static training memory) and fetches
  //      it via the server's /api/gemini/search (Google Search
  //      grounding). Covers: दवा/pesticide & fertilizer names+doses,
  //      मंडी/market prices, सरकारी योजना/schemes & subsidies, and any
  //      explicit "latest/current/today" style question.
  // =========================================================
  const LIVE_SEARCH_PATTERN = /दवा|कीटनाशक|फफूंदनाशक|खाद|उर्वरक|स्प्रे|छिड़काव|भाव|कीमत|मंडी|योजना|सब्सिडी|मुआवजा|ब्रांड|कंपनी|आज\s*का|dawa|dawai|keet|khad|khaad|bhav|bhaav|kimat|keemat|daam|daam|mandi|yojana|yojna|subsidy|sabsidi|mandi|latest|current|aaj\s*ka|price|rate|market|scheme|pesticide|fungicide|fertilizer|brand|spray/i;

  function needsLiveSearch(question){
    return LIVE_SEARCH_PATTERN.test(question || '');
  }

  // Returns { text, sources } or null if search fails — callers should
  // just fall back to the normal (un-grounded) prompt on null. Logs the
  // real reason to the console (open devtools → Console) since a silent
  // fallback otherwise looks identical to "search wasn't tried".
  async function callGeminiSearch(question){
    try{
      const res = await fetch(`${AI_PROXY_BASE}/api/gemini/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question, contextText: buildContextBlock() })
      });
      const data = await res.json().catch(() => null);
      if(!res.ok){
        console.warn('[Crop Sathi] Live search failed:', res.status, data && data.error);
        return null;
      }
      if(!data || !data.text){
        console.warn('[Crop Sathi] Live search returned no text:', data);
        return null;
      }
      return { text: data.text, sources: Array.isArray(data.sources) ? data.sources : [] };
    }catch(e){
      console.warn('[Crop Sathi] Live search request threw:', e);
      return null;
    }
  }

  async function sendChatMessage(question, opts){
    question = (question || '').trim();
    if(!question || chatBusy) return;
    const viaVoice = !!(opts && opts.viaVoice);
    // Same behaviour as Live Voice: reply in whatever language THIS
    // message was typed in, not whatever the site's EN/HI toggle says.
    // Fallback only, in case the model ever omits reply_lang below —
    // the model's own judgment (which sees actual words/meaning, not
    // just script) decides for real.
    const qLangFallback = detectLangFromText(question);

    hideInlineError();
    addUserTextBubble(question);
    setComposerBusy(true);
    const typingRow = addTypingBubble();
    setHeadStatus('सोचा जा रहा है...', 'Thinking...');

    try{
      // For questions that need REAL, current facts (dawa/pesticide
      // names & doses, mandi prices, active schemes) search the web
      // first, then feed what was found into the normal formatting
      // call so the reply still comes back as the usual chat bubble.
      let searchResult = null;
      if(needsLiveSearch(question)){
        setHeadStatus('इंटरनेट पर खोजा जा रहा है...', 'Searching the web...');
        searchResult = await callGeminiSearch(question);
        setHeadStatus('सोचा जा रहा है...', 'Thinking...');
      }

      const promptText = chatHistory.length
        ? buildFollowupPrompt(question, searchResult && searchResult.text)
        : buildGeneralPrompt(question, searchResult && searchResult.text);
      const userTurn = { role:'user', parts:[{ text: promptText }] };
      chatHistory.push(userTurn);

      let parsed, raw;
      try{
        ({ parsed, raw } = await callGemini(chatHistory));
      } catch(innerErr){
        // The formatting call itself got safety-filtered (this can
        // happen on दवा/pesticide-name questions even though the info
        // is legitimate farm advice) — but we may already have a real,
        // freshly-searched answer sitting in searchResult.text. Rather
        // than show an error and make it look like the AI "refused",
        // show that search text directly as the answer.
        if(innerErr && innerErr.safetyBlocked && searchResult && searchResult.text){
          parsed = {
            reply_lang: qLangFallback,
            answer_hi: searchResult.text,
            answer_en: searchResult.text,
            followup_hi: '', followup_en: ''
          };
          raw = JSON.stringify(parsed);
        } else {
          throw innerErr;
        }
      }
      chatHistory.push({ role:'model', parts:[{ text: raw }] });
      if(typingRow) typingRow.remove();
      // Trust the model's reply_lang (it judged the actual words, e.g.
      // "kya haal hai" typed in English letters is still Hindi) — only
      // fall back to the script-based guess if that field is missing.
      const replyLang = (parsed && (parsed.reply_lang === 'en' || parsed.reply_lang === 'hi'))
        ? parsed.reply_lang : qLangFallback;
      const spoken = addAnswerBubble(parsed, searchResult && searchResult.sources, replyLang);
      if(viaVoice) speakText(spoken, null, replyLang);
      setHeadStatus('ऑनलाइन', 'Online');
    } catch(err){
      chatHistory.pop(); // don't keep a dangling unanswered turn
      if(typingRow) typingRow.remove();
      showInlineError(err.message || (isEn() ? 'Something went wrong. Please try again.' : 'कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।'));
      setHeadStatus('ऑनलाइन', 'Online');
    } finally{
      setComposerBusy(false);
      if(composerInput){ composerInput.value = ''; refreshSendIcon(); composerInput.focus(); }
    }
  }

  if(composerTextRow){
    composerTextRow.addEventListener('submit', (e)=>{
      e.preventDefault();
      const text = composerInput ? composerInput.value.trim() : '';
      if(text) sendChatMessage(text);
    });
  }

  // ---- dedicated mic button opens Live Voice mode directly (a full AI
  // voice conversation), independent of whatever is typed in the box ----
  // Live Voice now streams raw mic audio over a WebSocket (see section 10
  // below) instead of using the browser's SpeechRecognition API, so the
  // real requirement is WebSocket + getUserMedia support, not speech APIs.
  const liveVoiceSupported = ('WebSocket' in window) && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  if(waMicBtn){
    waMicBtn.addEventListener('click', ()=> openLiveVoice());
  }

  if(!liveVoiceSupported && voiceUnsupported){
    voiceUnsupported.hidden = false;
  }

  refreshSendIcon();

  // =========================================================
  //  10) LIVE VOICE MODE — real-time, Siri-style AI voice call.
  //      -----------------------------------------------------
  //      Tap the mic → the call connects → the farmer's voice
  //      streams to Gemini continuously (no per-sentence "tap to
  //      talk") → Gemini's own voice-activity detection decides
  //      when the farmer has finished a thought → Gemini starts
  //      SPEAKING WHILE STILL GENERATING, so the reply starts the
  //      instant the first chunk is ready instead of after the
  //      whole answer is done → and if the farmer talks over
  //      Gemini, it's genuinely interrupted mid-sentence, the way
  //      cutting off Siri or Google Assistant works.
  //
  //      This is one persistent WebSocket to our own server for as
  //      long as the call is open (see server/server.js →
  //      handleLiveConnection / the Gemini Live API), not the old
  //      "record a sentence → wait → wait again → play a file"
  //      chain. Works with or without a crop photo already
  //      analysed — buildLiveContext() summarises chatHistory into
  //      one text blob sent once when the call connects, so Gemini
  //      still knows about any photo already discussed.
  //
  //      Language: no manual picker needed any more — Gemini's
  //      native-audio voice naturally follows whatever language the
  //      farmer speaks in (Hindi / English / Bhojpuri / Bengali /
  //      etc.) and switches if they switch, so LIVE_LANGS-style
  //      guesswork isn't needed.
  // =========================================================
  const liveVoice = document.getElementById('liveVoice');
  const lvCard = document.getElementById('lvCard');
  const lvOrb = document.getElementById('lvOrb');
  const lvStatus = document.getElementById('lvStatus');
  const lvCaption = document.getElementById('lvCaption');
  const lvMicBtn = document.getElementById('lvMicBtn');
  const lvMicIcon = document.getElementById('lvMicIcon');
  const lvMuteBtn = document.getElementById('lvMuteBtn');
  const lvEndBtn = document.getElementById('lvEndBtn');
  const lvCloseBtn = document.getElementById('lvCloseBtn');
  const lvEvap = document.getElementById('lvEvap');

  // Spawns a burst of tiny glowing dots that rise and dissolve across
  // the card — the particle "evaporation" look used by AI voice-chat
  // UIs, layered with the blur/scale smoke of the card itself.
  function lvSpawnEvaporation(){
    if(!lvEvap) return;
    lvEvap.innerHTML = '';
    const rect = lvCard ? lvCard.getBoundingClientRect() : null;
    const w = rect && rect.width ? rect.width : 320;
    const h = rect && rect.height ? rect.height : 420;
    const frag = document.createDocumentFragment();
    const count = 42;
    for(let i = 0; i < count; i++){
      const p = document.createElement('span');
      p.className = 'lv-evap-p';
      const size = 4 + Math.random() * 7;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = (Math.random() * w) + 'px';
      p.style.bottom = (Math.random() * h * 0.85) + 'px';
      p.style.setProperty('--dx', ((Math.random() * 44) - 22) + 'px');
      p.style.animationDuration = (450 + Math.random() * 350) + 'ms';
      p.style.animationDelay = (Math.random() * 180) + 'ms';
      frag.appendChild(p);
    }
    lvEvap.appendChild(frag);
    // clear them out after they've finished so the container stays empty
    setTimeout(()=>{ if(lvEvap) lvEvap.innerHTML = ''; }, 1050);
  }

  let lvSessionOpen = false;
  let lvMuted = false;          // AI voice muted (farmer can still talk & see captions)
  let lvMicPaused = false;      // farmer paused their own mic mid-call
  let lvSocket = null;
  let lvTurnActive = false;     // true from the first chunk of a Gemini reply until turnComplete
  let lvInputCaptionText = '';
  let lvOutputCaptionText = '';
  // ---- "late listen / not listen" fix ----
  // Previously the mic only opened AFTER the server replied 'ready'
  // (WS connect → our server connects to Gemini upstream → setup →
  // setupComplete round trip). That round trip is exactly the delay
  // that felt like "she doesn't listen" / "listens late" — the first
  // half-second (or more, on a slow connection) of whatever the farmer
  // said the moment they tapped the mic was simply never captured.
  // Now the mic opens immediately when the mic button is tapped, in
  // parallel with connecting. Chunks recorded before the upstream is
  // actually ready are queued here and flushed the instant 'ready'
  // arrives, so nothing said in that first moment is lost — same
  // "tap and it's already listening" feel as Siri/Google Assistant.
  let lvUpstreamReady = false;
  let lvPendingAudioQueue = [];
  const LV_MAX_QUEUED_CHUNKS = 50; // ~1.6s at 32ms chunks; protects the first words without building a large latency buffer

  function lvSetStatus(hi, en){ if(lvStatus) lvStatus.textContent = isEn() ? en : hi; }

  // ---- turn chatHistory (shared with the typed chat above) into one
  // short text blob so Gemini's Live session starts with context on
  // anything already discussed, without needing the raw JSON/prompt
  // scaffolding those turns were built with. ----
  function buildLiveContext(){
    if(!chatHistory.length) return '';
    const lines = [];
    chatHistory.forEach(turn => {
      const textPart = (turn.parts || []).find(p => p.text);
      if(!textPart) return;
      if(turn.role === 'model'){
        try{
          const j = JSON.parse(textPart.text);
          const bits = [j.crop_name_hi, j.about_hi, j.disease_name_hi, j.cause_hi, j.solution_hi, j.weather_advice_hi, j.answer_hi, j.followup_hi].filter(Boolean);
          if(bits.length) lines.push('साथी: ' + bits.join('. '));
        }catch(e){
          lines.push('साथी: ' + textPart.text); // plain text from an earlier live-voice turn
        }
      } else {
        const m = /"([^"]+)"/.exec(textPart.text); // pull the quoted farmer question out of the prompt template
        lines.push('किसान: ' + (m ? m[1] : textPart.text.slice(0, 200)));
      }
    });
    return lines.join('\n').slice(-3000); // keep the tail so it can't blow up the system prompt
  }

  const ICON_MIC_LG = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
  const ICON_STOP = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="3"/></svg>';

  function lvSetState(state){ // idle | listening | thinking | speaking
    if(!lvOrb) return;
    lvOrb.classList.remove('lv-idle','lv-listening','lv-thinking','lv-speaking');
    lvOrb.classList.add('lv-' + state);
    if(lvMicIcon) lvMicIcon.innerHTML = state === 'listening' ? ICON_STOP : ICON_MIC_LG;
  }

  let lvCloseTimer = null;

  function openLiveVoice(){
    if(!liveVoiceSupported){
      if(voiceUnsupported) voiceUnsupported.hidden = false;
      showInlineError(isEn() ? 'Voice is not supported in this browser. Please open this site in Chrome.' : 'यह सुविधा इस ब्राउज़र में काम नहीं करती। कृपया Chrome ब्राउज़र में खोलें।');
      return;
    }
    hideInlineError();
    // in case a previous close was interrupted mid-animation, cancel it
    // and strip the closing class so the open (smoke-materialise)
    // animation is free to play again from a clean state
    if(lvCloseTimer){ clearTimeout(lvCloseTimer); lvCloseTimer = null; }
    if(liveVoice) liveVoice.classList.remove('lv-closing');
    if(lvCard) lvCard.classList.remove('lv-closing');
    lvSessionOpen = true;
    lvMicPaused = false;
    lvUpstreamReady = false;
    lvPendingAudioQueue = [];
    if(liveVoice) liveVoice.hidden = false;
    lvSpawnEvaporation();
    document.body.style.overflow = 'hidden';
    lvSetState('thinking');
    lvSetStatus('जुड़ रहे हैं... 🌾', 'Connecting... 🌾');
    if(lvCaption) lvCaption.textContent = '';
    // Start the mic right away (in parallel with connecting) instead of
    // waiting for the server's 'ready' reply — see the lvUpstreamReady
    // comment above for why. lvStartMic() itself flips the UI to
    // "listening" the moment permission is granted.
    lvStartMic();
    lvConnect();
  }

  function closeLiveVoice(){
    lvSessionOpen = false;
    lvDisconnect();
    document.body.style.overflow = '';
    if(!liveVoice || liveVoice.hidden) return;
    // play the dissolve-into-smoke + rising-particle evaporation
    // animation, then actually hide once it finishes (matches the
    // .7s lvSheetDown/lvBackdropOut timing)
    liveVoice.classList.add('lv-closing');
    if(lvCard) lvCard.classList.add('lv-closing');
    lvSpawnEvaporation();
    lvCloseTimer = setTimeout(()=>{
      if(liveVoice){ liveVoice.hidden = true; liveVoice.classList.remove('lv-closing'); }
      if(lvCard) lvCard.classList.remove('lv-closing');
      if(lvEvap) lvEvap.innerHTML = '';
      lvCloseTimer = null;
    }, 700);
  }

  // ---------------------------------------------------------
  //  WEBSOCKET — the one persistent connection for the whole call
  // ---------------------------------------------------------
  function lvWsUrl(){
    // Live Voice uses the same Render service as the REST API.
    // index.html sets GAON_SATHI_LIVE_BASE to that same origin.
    // Keeping this configurable still allows a separate service later.
    const liveBase = window.GAON_SATHI_LIVE_BASE || AI_PROXY_BASE;
    return liveBase.replace(/^http/, 'ws') + '/live';
  }

  function lvConnect(){
    try{ lvSocket = new WebSocket(lvWsUrl()); }
    catch(e){
      lvSetState('idle');
      lvSetStatus('आवाज़ सेवा से जुड़ नहीं पाया। क्या server/ चालू है?', 'Could not reach the voice service. Is server/ running?');
      return;
    }

    lvSocket.onopen = () => {
      lvSocket.send(JSON.stringify({ type:'start', context: buildLiveContext() }));
    };

    lvSocket.onmessage = (ev) => {
      let msg;
      try{ msg = JSON.parse(ev.data); }catch(e){ return; }

      if(msg.type === 'ready'){
        // Gemini's side of the call is live. The mic itself was already
        // opened back in openLiveVoice() — flush whatever was captured
        // and queued while we were still connecting, in order, so none
        // of it is lost, then let onaudioprocess send straight through
        // from now on.
        lvUpstreamReady = true;
        if(lvPendingAudioQueue.length && lvSocket && lvSocket.readyState === WebSocket.OPEN){
          lvPendingAudioQueue.forEach(b64 => lvSocket.send(JSON.stringify({ type:'audio', data: b64 })));
        }
        lvPendingAudioQueue = [];
        lvSetState('listening');
        lvSetStatus('सुन रही हूँ... बोलिए 👂', 'Listening... go ahead 👂');
      } else if(msg.type === 'inputTranscript'){
        lvInputCaptionText = msg.text;
        if(!lvTurnActive && lvCaption) lvCaption.textContent = lvInputCaptionText;
      } else if(msg.type === 'outputTranscript'){
        lvOutputCaptionText += msg.text;
        if(!lvTurnActive){ lvTurnActive = true; lvSetState('speaking'); lvSetStatus('बता रही हूँ... 🌾', 'Here you go... 🌾'); }
        if(lvCaption) lvCaption.textContent = lvOutputCaptionText;
      } else if(msg.type === 'audio'){
        // THIS is the fix for "text comes then voice comes later" —
        // each chunk plays the instant it arrives, so speech starts
        // while Gemini is still generating the rest of the reply.
        if(!lvTurnActive){ lvTurnActive = true; lvSetState('speaking'); lvSetStatus('बता रही हूँ... 🌾', 'Here you go... 🌾'); }
        lvPlayAudioChunk(msg.data, msg.mimeType);
      } else if(msg.type === 'interrupted'){
        // farmer talked over Gemini — cut playback immediately, Siri-style
        lvClearPlayback();
        lvTurnActive = false;
        lvOutputCaptionText = '';
        lvSetState('listening');
        lvSetStatus('सुन रही हूँ... बोलिए 👂', 'Listening... go ahead 👂');
      } else if(msg.type === 'turnComplete'){
        if(lvInputCaptionText) chatHistory.push({ role:'user', parts:[{ text: lvInputCaptionText }] });
        if(lvOutputCaptionText) chatHistory.push({ role:'model', parts:[{ text: lvOutputCaptionText }] });
        lvInputCaptionText = '';
        lvOutputCaptionText = '';
        lvTurnActive = false;
        if(lvCaption) lvCaption.textContent = '';
        lvSetState('listening');
        lvSetStatus('सुन रही हूँ... बोलिए 👂', 'Listening... go ahead 👂');
      } else if(msg.type === 'error' && msg.message){
        lvSetState('idle');
        lvSetStatus(msg.message, msg.message);
      }
    };

    lvSocket.onerror = () => {
      lvSetState('idle');
      lvSetStatus('आवाज़ सेवा से जुड़ नहीं पाया। क्या server/ चालू है?', 'Could not reach the voice service. Is server/ running?');
    };
    lvSocket.onclose = (ev) => {
      lvStopMic(true);
      if(!lvSessionOpen) return; // user closed it themselves — no message needed

      // Close code 1000/1001 = normal/going away (user ended call).
      // Any other code (1006 = abnormal, Render proxy drop, etc.) = auto-reconnect.
      if(ev.code === 1000 || ev.code === 1001) return;

      // Unexpected disconnect — try once to reconnect automatically
      // instead of showing the error immediately, so a brief network
      // hiccup or Render idle-timeout doesn't kill the call on the farmer.
      console.warn('[Live Voice] unexpected close, code:', ev.code, '— attempting reconnect');
      lvSetState('thinking');
      lvSetStatus('दोबारा जुड़ रहे हैं... 🌾', 'Reconnecting... 🌾');
      lvUpstreamReady = false;
      lvPendingAudioQueue = [];
      // Small delay so the server has time to clean up the old session
      setTimeout(() => {
        if(!lvSessionOpen) return; // user may have closed during the delay
        lvStartMic();  // mic may have been stopped by lvStopMic above
        lvConnect();   // open a fresh WebSocket
      }, 1200);
    };
  }

  function lvDisconnect(){
    if(lvSocket){
      try{ if(lvSocket.readyState === WebSocket.OPEN) lvSocket.send(JSON.stringify({ type:'end' })); }catch(e){}
      try{ lvSocket.close(); }catch(e){}
      lvSocket = null;
    }
    lvStopMic(true);
    lvClearPlayback();
    lvTurnActive = false;
    lvInputCaptionText = '';
    lvOutputCaptionText = '';
    lvUpstreamReady = false;
    lvPendingAudioQueue = [];
  }

  // ---------------------------------------------------------
  //  MIC CAPTURE — raw 16-bit PCM, 16kHz, mono, streamed in small
  //  chunks the whole call, exactly what the Live API expects.
  // ---------------------------------------------------------
  let lvMicCtx = null, lvMicStream = null, lvMicSourceNode = null, lvMicProcessor = null, lvMicSending = false, lvMicWorkletReady = false;

  function floatTo16kPCM16(float32Input, inputSampleRate){
    let samples = float32Input;
    if(inputSampleRate !== 16000){
      // Linear interpolation instead of picking the nearest raw sample.
      // Nearest-neighbour decimation (the old code) throws away real
      // signal and folds high frequencies back in as noise (aliasing),
      // which quietly degrades what Gemini actually hears — worse in
      // noisy outdoor conditions, which is exactly where this app gets
      // used. Interpolating instead of dropping samples fixes that.
      const ratio = inputSampleRate / 16000;
      const outLen = Math.floor(float32Input.length / ratio);
      const resampled = new Float32Array(outLen);
      for(let i = 0; i < outLen; i++){
        const srcPos = i * ratio;
        const i0 = Math.floor(srcPos);
        const i1 = Math.min(i0 + 1, float32Input.length - 1);
        const frac = srcPos - i0;
        resampled[i] = float32Input[i0] * (1 - frac) + float32Input[i1] * frac;
      }
      samples = resampled;
    }
    const buf = new ArrayBuffer(samples.length * 2);
    const view = new DataView(buf);
    for(let i = 0, offset = 0; i < samples.length; i++, offset += 2){
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // little-endian
    }
    return buf;
  }

  function arrayBufferToBase64(buffer){
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for(let i = 0; i < bytes.length; i += chunkSize) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    return btoa(binary);
  }

  async function lvStartMic(){
    if(lvMicStream || lvMicPaused) return;
    try{
      lvMicStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount:1, echoCancellation:true, noiseSuppression:true, autoGainControl:true } });
    }catch(e){
      lvSetState('idle');
      lvSetStatus('माइक की अनुमति नहीं मिली। कृपया अनुमति दें।', 'Microphone permission denied. Please allow mic access.');
      return;
    }
    if(!lvSessionOpen){ lvMicStream.getTracks().forEach(t=>t.stop()); lvMicStream = null; return; } // closed while permission dialog was open
    if(!lvMicCtx){
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      // Ask the browser to run its own audio pipeline at 16kHz directly —
      // its resampler is far better than anything we'd hand-roll, so this
      // avoids most of the need for floatTo16kPCM16's fallback resampling
      // below. Most phones/Chrome honour this; if a device ignores it,
      // lvMicCtx.sampleRate just comes back as the native rate and the
      // (now-improved) fallback resampling still handles it correctly.
      try{ lvMicCtx = new AudioCtx({ sampleRate: 16000 }); }
      catch(e){ lvMicCtx = new AudioCtx(); }
    }
    if(lvMicCtx.state === 'suspended') await lvMicCtx.resume();
    if(!lvMicWorkletReady){
      // AudioWorkletNode replaces the deprecated ScriptProcessorNode.
      // The chunking that used to happen inline in onaudioprocess now
      // happens inside mic-worklet-processor.js, on the audio rendering
      // thread — this just registers that module once per AudioContext.
      await lvMicCtx.audioWorklet.addModule(`${SCRIPT_DIR}mic-worklet-processor.js`);
      lvMicWorkletReady = true;
    }
    lvMicSourceNode = lvMicCtx.createMediaStreamSource(lvMicStream);
    // 512 gives ~32ms chunks when the capture context is 16kHz.
    // Small chunks reduce the time spent waiting for audio to reach
    // Gemini's VAD, which is important for fast turn-taking.
    lvMicProcessor = new AudioWorkletNode(lvMicCtx, 'mic-capture-processor', {
      processorOptions: { chunkSize: 512 }
    });
    const nativeRate = lvMicCtx.sampleRate;
    lvMicProcessor.port.onmessage = (e) => {
      if(!lvMicSending) return;
      const pcm = floatTo16kPCM16(e.data, nativeRate);
      const b64 = arrayBufferToBase64(pcm);
      if(lvUpstreamReady && lvSocket && lvSocket.readyState === WebSocket.OPEN){
        lvSocket.send(JSON.stringify({ type:'audio', data: b64 }));
      } else {
        // Upstream handshake still in flight — queue instead of
        // dropping, so the farmer's first words aren't lost. Capped so
        // a stalled/failed connection can't grow this forever.
        lvPendingAudioQueue.push(b64);
        if(lvPendingAudioQueue.length > LV_MAX_QUEUED_CHUNKS) lvPendingAudioQueue.shift();
      }
    };
    lvMicSourceNode.connect(lvMicProcessor);
    // AudioWorkletNode only keeps running while it's connected through to
    // the destination — mirrors the old silent-gain trick from the
    // ScriptProcessorNode version so the mic stays silent but active.
    const silentGain = lvMicCtx.createGain();
    silentGain.gain.value = 0;
    lvMicProcessor.connect(silentGain);
    silentGain.connect(lvMicCtx.destination);
    lvMicSending = true;
    // Mic is capturing now — reflect that immediately even though the
    // server round trip may still be in flight, so the UI feels
    // instant rather than waiting on the network.
    if(lvSessionOpen){
      lvSetState('listening');
      lvSetStatus('सुन रही हूँ... बोलिए 👂', 'Listening... go ahead 👂');
    }
  }

  function lvStopMic(silent){
    lvMicSending = false;
    if(!silent && lvSocket && lvSocket.readyState === WebSocket.OPEN){
      lvSocket.send(JSON.stringify({ type:'audioStreamEnd' }));
    }
    if(lvMicProcessor){ try{ lvMicProcessor.disconnect(); }catch(e){} try{ lvMicProcessor.port.onmessage = null; }catch(e){} lvMicProcessor = null; }
    if(lvMicSourceNode){ try{ lvMicSourceNode.disconnect(); }catch(e){} lvMicSourceNode = null; }
    if(lvMicStream){ lvMicStream.getTracks().forEach(t => t.stop()); lvMicStream = null; }
  }

  // ---------------------------------------------------------
  //  PLAYBACK — schedules each incoming audio chunk back-to-back on
  //  one AudioContext timeline so it plays gaplessly as it streams
  //  in, and can be wiped instantly on interruption (barge-in).
  // ---------------------------------------------------------
  let lvPlaybackCtx = null, lvNextPlayTime = 0, lvActiveSources = [];

  function lvSampleRateFromMime(mimeType){
    const m = /rate=(\d+)/.exec(mimeType || '');
    return m ? parseInt(m[1], 10) : 24000;
  }
  function lvBase64ToBytes(b64){
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for(let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function lvPlayAudioChunk(base64, mimeType){
    if(lvMuted) return; // AI voice muted — drop audio, captions still update
    if(!lvPlaybackCtx) lvPlaybackCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(lvPlaybackCtx.state === 'suspended') lvPlaybackCtx.resume();
    const rate = lvSampleRateFromMime(mimeType);
    const bytes = lvBase64ToBytes(base64);
    const pcm16 = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    const float32 = new Float32Array(pcm16.length);
    for(let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768;
    const audioBuffer = lvPlaybackCtx.createBuffer(1, float32.length, rate);
    audioBuffer.copyToChannel(float32, 0);
    const src = lvPlaybackCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(lvPlaybackCtx.destination);
    const now = lvPlaybackCtx.currentTime;
    if(lvNextPlayTime < now) lvNextPlayTime = now + 0.05; // tiny safety margin for the first chunk
    src.start(lvNextPlayTime);
    lvNextPlayTime += audioBuffer.duration;
    lvActiveSources.push(src);
    src.onended = () => { lvActiveSources = lvActiveSources.filter(s => s !== src); };
  }

  function lvClearPlayback(){
    lvActiveSources.forEach(s => { try{ s.stop(); }catch(e){} });
    lvActiveSources = [];
    if(lvPlaybackCtx) lvNextPlayTime = lvPlaybackCtx.currentTime;
  }

  if(lvMicBtn) lvMicBtn.addEventListener('click', ()=>{
    if(!lvSessionOpen) return;
    lvMicPaused = !lvMicPaused;
    if(lvMicPaused){
      lvStopMic();
      lvSetState('idle');
      lvSetStatus('माइक बंद है — दोबारा दबाएं 🎙️', 'Mic paused — tap to resume 🎙️');
    } else {
      lvStartMic();
      lvSetState('listening');
      lvSetStatus('सुन रही हूँ... बोलिए 👂', 'Listening... go ahead 👂');
    }
  });
  if(lvMuteBtn) lvMuteBtn.addEventListener('click', ()=>{
    lvMuted = !lvMuted;
    lvMuteBtn.classList.toggle('muted', lvMuted);
    const ic = lvMuteBtn.querySelector('span');
    if(ic) ic.textContent = lvMuted ? '🔇' : '🔊';
    if(lvMuted) lvClearPlayback();
  });
  if(lvEndBtn) lvEndBtn.addEventListener('click', closeLiveVoice);
  if(lvCloseBtn) lvCloseBtn.addEventListener('click', closeLiveVoice);

  // =========================================================
  //  11) DESKTOP SIDEBAR — camera/gallery shortcuts + starter
  //      questions. Sidebar itself is hidden on phones by CSS;
  //      this code is harmless (just unused) on small screens.
  // =========================================================
  const sideCameraBtn = document.getElementById('sideCameraBtn');
  const sideGalleryBtn = document.getElementById('sideGalleryBtn');
  const sideSuggestList = document.getElementById('sideSuggestList');

  if(sideCameraBtn && cropImageInputCamera){
    sideCameraBtn.addEventListener('click', ()=> cropImageInputCamera.click());
  }
  if(sideGalleryBtn && cropImageInputGallery){
    sideGalleryBtn.addEventListener('click', ()=> cropImageInputGallery.click());
  }

  const STARTER_QUESTIONS = [
    { hi:'गेहूं को कीड़ों से कैसे बचाएं?', en:'How do I protect wheat from pests?' },
    { hi:'टमाटर के लिए सबसे अच्छी खाद कौनसी है?', en:'What is the best fertilizer for tomatoes?' },
    { hi:'तेज़ बारिश से पहले क्या करें?', en:'What should I do before heavy rain?' }
  ];

  if(sideSuggestList){
    STARTER_QUESTIONS.forEach(q=>{
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'cs-suggest-chip';
      chip.textContent = isEn() ? q.en : q.hi;
      chip.addEventListener('click', ()=>{
        const text = isEn() ? q.en : q.hi;
        if(chatHistory.length && !chatBusy){
          // a photo's already been analysed — ask it straight away
          sendChatMessage(text);
        } else if(composerInput){
          // no photo yet — drop the question in the box so it's ready to send
          composerInput.value = text;
          refreshSendIcon();
          composerInput.focus();
        }
      });
      sideSuggestList.appendChild(chip);
    });
  }

})();
