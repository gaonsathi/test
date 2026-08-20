// ============================================================================
//  KISAN SATHI → WEATHER  (kisan/weather/weather.js)
//  Data source: Open-Meteo (https://open-meteo.com) — free, keyless, CORS-
//  enabled forecast API (current + hourly + daily). No API key, no billing,
//  no backend proxy needed — this stays a 100% static-site feature.
//
//  This file is the ONLY place that touches the #kisan weather panel. It:
//    1. injects its own stylesheet (kisan/weather/weather.css)
//    2. fetches its own markup (kisan/weather/weather.html) and drops it
//       into the existing "coming soon" panel already in kisan.html
//    3. runs entirely on its own — no other section/file is read or edited
//
//  Guarded throughout so a missing panel / failed fetch never breaks the
//  rest of the page.
// ============================================================================

(function () {
  const PANEL_SELECTOR = '#kisan .ksub-panel[data-ksub-panel="weather"]';
  const panel = document.querySelector(PANEL_SELECTOR);
  if (!panel) return; // weather panel not on this page — do nothing

  const BASE = 'kisan/weather/';
  const LAST_PLACE_KEY = 'gs_gw_last_place';

  function isEn() { return document.documentElement.lang === 'en'; }
  function t(hi, en) { return isEn() ? en : hi; }

  // --------------------------------------------------------------------
  //  1) Inject stylesheet (once)
  // --------------------------------------------------------------------
  if (!document.getElementById('gwCssLink')) {
    const link = document.createElement('link');
    link.id = 'gwCssLink';
    link.rel = 'stylesheet';
    link.href = BASE + 'weather.css';
    document.head.appendChild(link);
  }

  // --------------------------------------------------------------------
  //  2) Fetch markup and inject into the existing "coming soon" card
  // --------------------------------------------------------------------
  const soonCard = panel.querySelector('.ksub-soon-card');
  if (!soonCard) return;

  fetch(BASE + 'weather.html')
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(html => {
      soonCard.outerHTML = html;
      // sync newly-added [data-en] labels + placeholders to current language
      if (typeof window.gsSetLanguage === 'function') {
        window.gsSetLanguage(document.documentElement.lang);
      }
      initWeatherWidget();
    })
    .catch(err => {
      console.error('Weather sub-section failed to load:', err);
      soonCard.innerHTML =
        '<span class="ksub-soon-ic">⚠️</span>' +
        '<h3>' + t('मौसम लोड नहीं हो सका', 'Weather could not load') + '</h3>' +
        '<p>' + t('कृपया पेज को दोबारा लोड करें।', 'Please reload the page.') + '</p>';
    });

  // ======================================================================
  //  3) WIDGET LOGIC — runs once the markup above is in the DOM
  // ======================================================================
  function initWeatherWidget() {
    const gw = document.getElementById('gw');
    if (!gw) return;

    const els = {
      searchInput: document.getElementById('gwSearchInput'),
      clearBtn: document.getElementById('gwClearBtn'),
      locateBtn: document.getElementById('gwLocateBtn'),
      suggest: document.getElementById('gwSuggest'),
      skeleton: document.getElementById('gwSkeleton'),
      error: document.getElementById('gwError'),
      errorText: document.getElementById('gwErrorText'),
      retryBtn: document.getElementById('gwRetryBtn'),
      content: document.getElementById('gwContent'),
      hero: document.getElementById('gwHero'),
      heroIcon: document.getElementById('gwHeroIcon'),
      heroTemp: document.getElementById('gwHeroTemp'),
      heroCond: document.getElementById('gwHeroCond'),
      heroFeels: document.getElementById('gwHeroFeels'),
      heroHighLow: document.getElementById('gwHeroHighLow'),
      heroUpdated: document.getElementById('gwHeroUpdated'),
      placeName: document.getElementById('gwPlaceName'),
      refreshBtn: document.getElementById('gwRefreshBtn'),
      statPrecip: document.getElementById('gwStatPrecip'),
      statHumidity: document.getElementById('gwStatHumidity'),
      statWind: document.getElementById('gwStatWind'),
      hourlyDayTag: document.getElementById('gwHourlyDayTag'),
      hourly: document.getElementById('gwHourly'),
      daily: document.getElementById('gwDaily'),
      details: document.getElementById('gwDetails'),
      precipDayTag: document.getElementById('gwPrecipDayTag'),
      precipHourly: document.getElementById('gwPrecipHourly'),
      windDayTag: document.getElementById('gwWindDayTag'),
      windHourly: document.getElementById('gwWindHourly')
    };

    let lastData = null;      // { data, place } — cached for language re-render
    let lastLatLon = null;    // { lat, lon }
    let suggestItems = [];
    let suggestIndex = -1;
    let selectedDayIdx = 0;   // which day's pill is active in the hourly strip

    // -------------------- Condition classification --------------------
    // Open-Meteo's weather_code is the numeric WMO weather-interpretation
    // code (0-99, WMO Code 4677). We bucket it into one of our 6 icon
    // families here, and separately give it a display string in wmoText().
    function classifyWmo(code) {
      const c = Number(code);
      if (c === 0 || c === 1) return 'clear';
      if (c === 2 || c === 3) return 'cloudy';
      if (c === 45 || c === 48) return 'fog';
      if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].indexOf(c) !== -1) return 'rain';
      if ([71, 73, 75, 77, 85, 86].indexOf(c) !== -1) return 'snow';
      if ([95, 96, 99].indexOf(c) !== -1) return 'storm';
      return 'cloudy';
    }
    function wmoText(code) {
      const c = Number(code);
      const map = {
        0: t('साफ़ आसमान', 'Clear sky'),
        1: t('मुख्यतः साफ़', 'Mainly clear'),
        2: t('आंशिक बादल', 'Partly cloudy'),
        3: t('घने बादल', 'Overcast'),
        45: t('कोहरा', 'Fog'),
        48: t('जमने वाला कोहरा', 'Depositing rime fog'),
        51: t('हल्की बूंदाबांदी', 'Light drizzle'),
        53: t('मध्यम बूंदाबांदी', 'Moderate drizzle'),
        55: t('तेज़ बूंदाबांदी', 'Dense drizzle'),
        56: t('हल्की जमने वाली बूंदाबांदी', 'Light freezing drizzle'),
        57: t('तेज़ जमने वाली बूंदाबांदी', 'Dense freezing drizzle'),
        61: t('हल्की बारिश', 'Slight rain'),
        63: t('मध्यम बारिश', 'Moderate rain'),
        65: t('तेज़ बारिश', 'Heavy rain'),
        66: t('हल्की जमने वाली बारिश', 'Light freezing rain'),
        67: t('तेज़ जमने वाली बारिश', 'Heavy freezing rain'),
        71: t('हल्की बर्फबारी', 'Slight snow fall'),
        73: t('मध्यम बर्फबारी', 'Moderate snow fall'),
        75: t('तेज़ बर्फबारी', 'Heavy snow fall'),
        77: t('बर्फ के कण', 'Snow grains'),
        80: t('हल्की बौछारें', 'Slight rain showers'),
        81: t('मध्यम बौछारें', 'Moderate rain showers'),
        82: t('तेज़ बौछारें', 'Violent rain showers'),
        85: t('हल्की बर्फ की बौछारें', 'Slight snow showers'),
        86: t('तेज़ बर्फ की बौछारें', 'Heavy snow showers'),
        95: t('आंधी-तूफान', 'Thunderstorm'),
        96: t('ओलों के साथ तूफान', 'Thunderstorm with slight hail'),
        99: t('तेज़ ओलों के साथ तूफान', 'Thunderstorm with heavy hail')
      };
      return map.hasOwnProperty(c) ? map[c] : t('मौसम की जानकारी उपलब्ध नहीं', 'Weather info unavailable');
    }
    function condKey(code, isDay) {
      const cat = classifyWmo(code);
      if (cat === 'clear') return isDay ? 'clear-day' : 'clear-night';
      if (cat === 'cloudy') return isDay ? 'cloudy-day' : 'cloudy-night';
      return cat; // rain / storm / snow / fog have one icon regardless of day/night
    }

    // -------------------- SVG icon set --------------------
    function cloudPath(color) {
      return '<path fill="' + color + '" d="M46.8 26.1c-.6-6.4-6-11.4-12.6-11.4-4.8 0-9 2.6-11.2 6.5-.5-.1-1-.1-1.5-.1-6 0-10.9 4.9-10.9 10.9S15.5 42.9 21.5 42.9h24.3c5.1 0 9.2-4.1 9.2-9.2 0-4.7-3.6-8.6-8.2-9.1z"/>';
    }
    function sunSvg(color) {
      // Google's newest weather icon set (2026 redesign) dropped the soft
      // gradient look in favour of one bold, flat, high-contrast color —
      // match that here instead of shading the disc.
      let rays = '';
      for (let i = 0; i < 8; i++) {
        const a = (i * 45) * Math.PI / 180;
        const x1 = 32 + Math.cos(a) * 20, y1 = 32 + Math.sin(a) * 20;
        const x2 = 32 + Math.cos(a) * 26, y2 = 32 + Math.sin(a) * 26;
        rays += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + color + '" stroke-width="3.6" stroke-linecap="round"/>';
      }
      return rays + '<circle cx="32" cy="32" r="13" fill="' + color + '"/>';
    }
    function moonSvg(color) {
      return '<path fill="' + color + '" d="M38 14a18 18 0 1 0 12 31 22 22 0 0 1 -12-31z"/>' +
        '<circle cx="24" cy="16" r="1.6" fill="' + color + '" opacity=".8"/>' +
        '<circle cx="16" cy="26" r="1.1" fill="' + color + '" opacity=".6"/>';
    }
    function rainDrops(color, n) {
      let out = '';
      const xs = [20, 30, 40, 50].slice(0, n);
      xs.forEach((x, i) => {
        const y = 44 + (i % 2 === 0 ? 0 : 4);
        out += '<path fill="' + color + '" d="M' + x + ' ' + y + 'c-2.4 3.4-3.6 5.6-3.6 7.4a3.6 3.6 0 1 0 7.2 0c0-1.8-1.2-4-3.6-7.4z"/>';
      });
      return out;
    }
    function boltShape(color) {
      return '<path fill="' + color + '" d="M35 40 L24 54 L30 54 L27 66 L42 48 L35 48 Z"/>';
    }
    function snowDots(color) {
      const pts = [[20, 47], [30, 52], [40, 47], [26, 58], [36, 58]];
      return pts.map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.4" fill="' + color + '"/>').join('');
    }
    function fogLines(color) {
      const ys = [40, 47, 54];
      return ys.map(y => '<line x1="12" y1="' + y + '" x2="52" y2="' + y + '" stroke="' + color + '" stroke-width="3.2" stroke-linecap="round" opacity=".85"/>').join('');
    }

    // Precipitation "pot" icon: a small glass measuring jar that fills with
    // water up to a level proportional to that hour's rainfall (mm).
    // Redesigned to read as an actual glass vessel rather than a flat
    // colour block: an outlined jar with a rim/lip at the mouth, a curved
    // meniscus at the water's surface (not a straight cut line), a soft
    // diagonal glass-shine, and a faint grounding shadow beneath it.
    // Used only in the hourly precipitation strip above the rain map.
    function precipPotSvg(uid, pct) {
      pct = Math.max(0, Math.min(100, pct));
      const top = 6, bottom = 27; // jar's inner vertical span in the viewBox
      const fillY = bottom - (pct / 100) * (bottom - top);
      const clipId = 'gwPotClip' + uid;
      const waterGradId = 'gwPotWater' + uid;
      const glassGradId = 'gwPotGlass' + uid;
      // Symmetric jar body: straight glass walls down to a rounded (semicircular) base.
      const potPath = 'M5,6 L5,20 A9,9 0 0 0 23,20 L23,6 Z';
      const meniscus = 1.1; // how much the water surface curves, in viewBox units
      let water = '';
      if (pct > 0) {
        const fy = fillY.toFixed(1), cy = (fillY - meniscus).toFixed(1), hy = (fillY + 0.35).toFixed(1), hcy = (fillY - meniscus + 0.35).toFixed(1);
        water =
          // body of the water, top edge gently curved like a real liquid surface
          '<path d="M4,' + fy + ' Q14,' + cy + ' 24,' + fy + ' V33 H4 Z" fill="url(#' + waterGradId + ')"/>' +
          // thin bright highlight riding the surface line for a glassy sheen
          '<path d="M5,' + hy + ' Q14,' + hcy + ' 23,' + hy + '" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="0.6" stroke-linecap="round"/>';
      }
      return '<svg viewBox="0 0 28 34" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="' + waterGradId + '" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#1f7fe0"/>' +
            '<stop offset="55%" stop-color="#0d5ab5"/>' +
            '<stop offset="100%" stop-color="#062a6e"/>' +
          '</linearGradient>' +
          '<linearGradient id="' + glassGradId + '" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="rgba(255,255,255,.42)"/>' +
            '<stop offset="30%" stop-color="rgba(255,255,255,0)"/>' +
          '</linearGradient>' +
          '<clipPath id="' + clipId + '"><path d="' + potPath + '"/></clipPath>' +
        '</defs>' +
        // faint grounding shadow so the jar reads as sitting on a surface, not floating
        '<ellipse cx="14" cy="30.5" rx="7.5" ry="1.3" fill="rgba(6,42,110,.14)"/>' +
        // empty-glass base tint
        '<path d="' + potPath + '" fill="rgba(13,90,181,.07)"/>' +
        '<g clip-path="url(#' + clipId + ')">' + water +
          '<rect x="3" y="4" width="26" height="28" fill="url(#' + glassGradId + ')"/>' +
        '</g>' +
        // glass wall outline, drawn on top of the clip so the rim reads crisp
        '<path d="' + potPath + '" fill="none" stroke="rgba(24,90,181,.45)" stroke-width="1.1" stroke-linejoin="round"/>' +
        // mouth of the jar, a short lip so the top doesn't look like a flat cut
        '<ellipse cx="14" cy="6" rx="9" ry="1.7" fill="none" stroke="rgba(24,90,181,.4)" stroke-width="1"/>' +
        '</svg>';
    }

    function iconSvg(key, light) {
      const sun = '#FBBC05'; // same flat Google-yellow in every context, incl. the hero card
      const cloud = light ? 'rgba(255,255,255,.92)' : '#9AA8BA';
      const cloudDark = light ? 'rgba(255,255,255,.7)' : '#7A8AA0';
      const rain = light ? '#FFFFFF' : '#3F9FE0';
      const moon = light ? '#FFFFFF' : '#93A6D6';
      const bolt = light ? '#FFE066' : '#FFC93C';
      const snow = light ? '#FFFFFF' : '#8FC1E8';
      const fog = light ? 'rgba(255,255,255,.9)' : '#9AA3AC';
      let inner = '';
      switch (key) {
        case 'clear-day': inner = sunSvg(sun); break;
        case 'clear-night': inner = moonSvg(moon); break;
        case 'cloudy-day': inner = sunSvg(sun).replace('r="13"', 'r="10"') + '<g transform="translate(6,6)">' + cloudPath(cloud) + '</g>'; break;
        case 'cloudy-night': inner = moonSvg(moon) + '<g transform="translate(8,8) scale(.85)">' + cloudPath(cloud) + '</g>'; break;
        case 'rain': inner = cloudPath(cloud) + rainDrops(rain, 3); break;
        case 'storm': inner = cloudPath(cloudDark) + boltShape(bolt); break;
        case 'snow': inner = cloudPath(cloud) + snowDots(snow); break;
        case 'fog': inner = cloudPath(cloud) + fogLines(fog); break;
        default: inner = sunSvg(sun);
      }
      return '<svg viewBox="0 0 64 66" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
    }

    // -------------------- Helpers --------------------
    function fmtTemp(v) { return (v === null || v === undefined) ? '--' : Math.round(v); }
    function fmtTime(iso, opts) {
      try { return new Date(iso).toLocaleTimeString(isEn() ? 'en-IN' : 'hi-IN', opts || { hour: '2-digit', minute: '2-digit' }); }
      catch (e) { return ''; }
    }
    function fmtHour(iso) {
      try { return new Date(iso).toLocaleTimeString(isEn() ? 'en-IN' : 'hi-IN', { hour: 'numeric' }); }
      catch (e) { return ''; }
    }
    function dayLabel(iso, idx) {
      if (idx === 0) return t('आज', 'Today');
      if (idx === 1) return t('कल', 'Tomorrow');
      try { return new Date(iso).toLocaleDateString(isEn() ? 'en-IN' : 'hi-IN', { weekday: 'short' }); }
      catch (e) { return ''; }
    }
    function windDir(deg) {
      const dirsHi = ['उत्तर', 'उ-पू', 'पूर्व', 'द-पू', 'दक्षिण', 'द-प', 'पश्चिम', 'उ-प'];
      const dirsEn = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const idx = Math.round(deg / 45) % 8;
      return isEn() ? dirsEn[idx] : dirsHi[idx];
    }
    function uvColor(uv) {
      if (uv >= 11) return '#9c27b0';
      if (uv >= 8) return '#f44336';
      if (uv >= 6) return '#ff9800';
      if (uv >= 3) return '#ffeb3b';
      return '#4caf50';
    }

    // -------------------- Rendering --------------------
    function render(data, place, resetDay) {
      lastData = { data, place };
      if (resetDay) selectedDayIdx = 0;
      const cur = data.current;
      const daily = data.daily;
      const hourly = data.hourly;
      const key = condKey(cur.weather_code, cur.is_day === 1);

      els.hero.dataset.cond = key;
      els.heroIcon.innerHTML = iconSvg(key, true);
      els.heroTemp.textContent = fmtTemp(cur.temperature_2m);
      els.heroCond.textContent = cur.condition_text || '—';
      els.placeName.textContent = place;
      els.heroFeels.textContent = t('महसूस ', 'Feels ') + fmtTemp(cur.apparent_temperature) + '°';
      els.heroHighLow.textContent = 'H:' + fmtTemp(daily.temperature_2m_max[0]) + '° L:' + fmtTemp(daily.temperature_2m_min[0]) + '°';
      els.heroUpdated.textContent = t('अपडेट: ', 'Updated ') + fmtTime(cur.time);

      // Google-card-style precipitation / humidity / wind stat row
      els.statPrecip.textContent = Math.round(daily.precipitation_probability_max[0] || 0) + '%';
      els.statHumidity.textContent = Math.round(cur.relative_humidity_2m) + '%';
      els.statWind.textContent = Math.round(cur.wind_speed_10m) + ' km/h';

      renderHourlyForDay(selectedDayIdx);
      renderPrecipStrip(selectedDayIdx);
      renderWindStrip(selectedDayIdx);

      // 10-day forecast — Google-style horizontal carousel. Each card is
      // tappable: tapping it updates the hourly strip above.
      const maxOfWeek = Math.max(...daily.temperature_2m_max);
      const minOfWeek = Math.min(...daily.temperature_2m_min);
      const span = Math.max(1, maxOfWeek - minOfWeek);
      let dailyHtml = '';
      for (let i = 0; i < daily.time.length; i++) {
        const dKey = condKey(daily.weather_code[i], true);
        const lo = daily.temperature_2m_min[i], hi = daily.temperature_2m_max[i];
        const leftPct = ((lo - minOfWeek) / span) * 100;
        const widthPct = ((hi - lo) / span) * 100;
        const rainMm = daily.precipitation_sum[i] || 0;
        const pot = Math.round(daily.precipitation_probability_max[i] || 0);
        const windMax = Math.round(daily.wind_speed_10m_max[i] || 0);
        dailyHtml += '<button type="button" class="gw-day' + (i === 0 ? ' today' : '') + (i === selectedDayIdx ? ' active' : '') + '" data-day="' + i + '">' +
          '<span class="gw-day-name">' + dayLabel(daily.time[i], i) + '</span>' +
          '<span class="gw-day-ic">' + iconSvg(dKey, false) + '</span>' +
          '<span class="gw-day-range">' +
          '<span class="gw-day-min">' + fmtTemp(lo) + '°</span>' +
          '<span class="gw-day-bar"><span class="gw-day-bar-fill" style="left:' + leftPct.toFixed(0) + '%;width:' + widthPct.toFixed(0) + '%"></span></span>' +
          '<span class="gw-day-max">' + fmtTemp(hi) + '°</span>' +
          '</span>' +
          '<span class="gw-day-precip"><span class="gw-day-pot-ic">' + precipPotSvg('day' + i, pot) + '</span><span class="gw-day-precip-val">' + rainMm.toFixed(1) + ' mm</span></span>' +
          '<span class="gw-day-wind"><span class="gw-day-wind-ic">💨</span>' + windMax + ' km/h</span>' +
          '</button>';
      }
      els.daily.innerHTML = dailyHtml;
      els.daily.querySelectorAll('.gw-day').forEach(card => {
        card.addEventListener('click', () => {
          selectedDayIdx = parseInt(card.dataset.day, 10);
          els.daily.querySelectorAll('.gw-day').forEach(c => c.classList.toggle('active', c === card));
          renderHourlyForDay(selectedDayIdx);
          renderPrecipStrip(selectedDayIdx);
          renderWindStrip(selectedDayIdx);
        });
      });

      // details grid
      const uv = daily.uv_index_max[0] || 0;
      let nowIdx = hourly.time.findIndex(tm => new Date(tm) >= new Date(cur.time));
      if (nowIdx === -1) nowIdx = 0;
      const visKm = hourly.visibility && hourly.visibility[nowIdx] != null ? Math.round(hourly.visibility[nowIdx]) : null;
      const tiles = [
        { kind: 'humidity', ic: '💧', label: t('नमी', 'Humidity'), val: Math.round(cur.relative_humidity_2m) + '%' },
        { kind: 'wind', ic: '💨', label: t('हवा', 'Wind'), val: Math.round(cur.wind_speed_10m) + ' km/h', sub: windDir(cur.wind_direction_10m) },
        { kind: 'gust', ic: '🌬️', label: t('झोंका', 'Gusts'), val: Math.round(cur.wind_gusts_10m || 0) + ' km/h' },
        { kind: 'pressure', ic: '🌡️', label: t('दबाव', 'Pressure'), val: Math.round(cur.pressure_msl) + ' hPa' },
        { kind: 'rain', ic: '🌧️', label: t('वर्षा (आज)', 'Rain (today)'), val: (daily.precipitation_sum[0] || 0).toFixed(1) + ' mm' },
        { kind: 'sunrise', ic: '🌅', label: t('सूर्योदय', 'Sunrise'), val: fmtTime(daily.sunrise[0]) },
        { kind: 'sunset', ic: '🌇', label: t('सूर्यास्त', 'Sunset'), val: fmtTime(daily.sunset[0]) }
      ];
      if (visKm !== null) tiles.splice(3, 0, { kind: 'visibility', ic: '👁️', label: t('दृश्यता', 'Visibility'), val: visKm + ' km' });

      let detailsHtml = tiles.map(tl =>
        '<div class="gw-tile" data-kind="' + tl.kind + '"><div class="gw-tile-head"><span>' + tl.ic + '</span><span>' + tl.label + '</span></div>' +
        '<div class="gw-tile-val">' + tl.val + '</div>' +
        (tl.sub ? '<div class="gw-tile-sub">' + tl.sub + '</div>' : '') +
        '</div>'
      ).join('');

      const uvPct = Math.min(100, (uv / 12) * 100);
      detailsHtml += '<div class="gw-tile" data-kind="uv"><div class="gw-tile-head"><span>☀️</span><span>UV ' + t('सूचकांक', 'Index') + '</span></div>' +
        '<div class="gw-tile-val" style="color:' + uvColor(uv) + '">' + Math.round(uv) + '</div>' +
        '<div class="gw-tile-uv-bar"><span class="gw-tile-uv-dot" style="left:' + uvPct.toFixed(0) + '%"></span></div></div>';

      els.details.innerHTML = detailsHtml;

      els.skeleton.hidden = true;
      els.error.hidden = true;
      els.content.hidden = false;
    }

    // How many hourly slots to show when the "today" pill is active — a
    // rolling window starting from the current hour rather than being cut
    // off at midnight, so it reads like "next 24 hours" instead of just
    // "rest of today". Future day pills still show that whole day (00–23h).
    const GW_ROLLING_HOURS = 24;
    function renderHourlyForDay(dayIdx) {
      if (!lastData) return;
      const data = lastData.data;
      const hourly = data.hourly, daily = data.daily, cur = data.current;
      const dateStr = daily.time[dayIdx];
      if (els.hourlyDayTag) {
        els.hourlyDayTag.textContent = dayIdx === 0 ? '' : '· ' + dayLabel(dateStr, dayIdx);
      }
      let idxs = [];
      if (dayIdx === 0) {
        // Today: rolling next-24-hours window starting at the current hour,
        // crossing into tomorrow's hours instead of stopping at midnight.
        const nowIdx = hourly.time.findIndex(tm => new Date(tm) >= new Date(cur.time));
        const start = nowIdx === -1 ? 0 : nowIdx;
        for (let i = start; i < hourly.time.length && idxs.length < GW_ROLLING_HOURS; i++) idxs.push(i);
      } else {
        for (let i = 0; i < hourly.time.length; i++) {
          if (hourly.time[i].slice(0, 10) === dateStr) idxs.push(i);
        }
      }
      let hourlyHtml = '';
      if (!idxs.length) {
        // We only fetch ~48h of hourly data (today + tomorrow) to keep API
        // usage light — beyond that, only the daily summary card is shown.
        hourlyHtml = '<p class="gw-suggest-empty">' + t('इस दिन के लिए घंटेवार जानकारी उपलब्ध नहीं — ऊपर दैनिक सारांश देखें', 'Hourly detail not available this far out — see the daily summary above') + '</p>';
      } else {
        idxs.forEach((i, pos) => {
          const hKey = condKey(hourly.weather_code[i], hourly.is_day[i] === 1);
          const isNow = dayIdx === 0 && pos === 0;
          hourlyHtml += '<div class="gw-hour' + (isNow ? ' now' : '') + '">' +
            '<span class="gw-hour-time">' + (isNow ? t('अभी', 'Now') : fmtHour(hourly.time[i])) + '</span>' +
            '<span class="gw-hour-ic">' + iconSvg(hKey, false) + '</span>' +
            '<span class="gw-hour-temp">' + fmtTemp(hourly.temperature_2m[i]) + '°</span>' +
            '</div>';
        });
      }
      els.hourly.innerHTML = hourlyHtml;
    }

    // Hourly precipitation strip shown above the rain map — same day-slicing
    // logic as renderHourlyForDay(), but drawing a water-filled "pot" for
    // each hour instead of a temperature/condition icon. Fill level is
    // scaled against a 4mm/hr cap (heavy-rain territory), matching how
    // Google's own precipitation icon reads at a glance.
    const GW_PRECIP_CAP_MM = 4;
    function renderPrecipStrip(dayIdx) {
      if (!lastData || !els.precipHourly) return;
      const data = lastData.data;
      const hourly = data.hourly, daily = data.daily, cur = data.current;
      const dateStr = daily.time[dayIdx];
      if (els.precipDayTag) {
        els.precipDayTag.textContent = dayIdx === 0 ? '' : '· ' + dayLabel(dateStr, dayIdx);
      }
      let idxs = [];
      if (dayIdx === 0) {
        const nowIdx = hourly.time.findIndex(tm => new Date(tm) >= new Date(cur.time));
        const start = nowIdx === -1 ? 0 : nowIdx;
        for (let i = start; i < hourly.time.length && idxs.length < GW_ROLLING_HOURS; i++) idxs.push(i);
      } else {
        for (let i = 0; i < hourly.time.length; i++) {
          if (hourly.time[i].slice(0, 10) === dateStr) idxs.push(i);
        }
      }
      let html = '';
      if (!idxs.length) {
        html = '<p class="gw-suggest-empty">' + t('इस दिन के लिए वर्षा जानकारी उपलब्ध नहीं', 'Precipitation detail not available this far out') + '</p>';
      } else {
        idxs.forEach((i, pos) => {
          const mm = (hourly.precipitation && hourly.precipitation[i]) || 0;
          const pct = Math.min(100, (mm / GW_PRECIP_CAP_MM) * 100);
          const isNow = dayIdx === 0 && pos === 0;
          html += '<div class="gw-precip-item' + (isNow ? ' now' : '') + '">' +
            '<span class="gw-precip-time">' + (isNow ? t('अभी', 'Now') : fmtHour(hourly.time[i])) + '</span>' +
            '<span class="gw-precip-pot">' + precipPotSvg(i, pct) + '</span>' +
            '<span class="gw-precip-val">' + mm.toFixed(1) + ' mm</span>' +
            '</div>';
        });
      }
      els.precipHourly.innerHTML = html;
    }

    // Google-Weather-style hourly "wind" icon: a compass ring with a needle
    // that points the way the wind is blowing, coloured by how strong it is
    // (calm greenish → breezy blue → strong amber) so speed reads at a
    // glance without needing to read the number first.
    const GW_WIND_CAP_KMH = 40; // ring "fills" (goes fully saturated) at/above this speed
    function windSpeedColor(kmh) {
      if (kmh < 12) return { a: '#8fb9ce', b: '#5f96b8' };   // calm
      if (kmh < 25) return { a: '#5aa8e6', b: '#1f7fd6' };   // breezy
      return { a: '#f4a53c', b: '#e07b1a' };                  // strong
    }
    function windArrowSvg(uid, kmh, dirDeg) {
      const speed = Math.max(0, kmh || 0);
      const intensity = Math.max(.28, Math.min(1, speed / GW_WIND_CAP_KMH));
      const colors = windSpeedColor(speed);
      const gradId = 'gwWindGrad' + uid;
      // meteorological convention: direction = where wind blows FROM, so the
      // needle (pointing where it blows TO) is rotated dir+180.
      const rot = ((dirDeg || 0) + 180) % 360;
      // Everything (ring + N mark + needle) sits inside one "rose" group so
      // that when gw-wind-hourly gets rotated to match the phone's live
      // compass heading (see setupCompassCalibration below), the N mark and
      // the needle turn together and stay correctly related to each other —
      // exactly like the housing of a real compass turning under the needle.
      return '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="' + colors.a + '"/>' +
            '<stop offset="100%" stop-color="' + colors.b + '"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<g class="gw-compass-rose">' +
          '<circle cx="16" cy="16" r="14.5" fill="rgba(31,127,214,.05)" stroke="#C3CCD8" stroke-width="1.4"/>' +
          '<circle cx="16" cy="16" r="14.5" fill="none" stroke="url(#' + gradId + ')" stroke-width="2.2" ' +
            'stroke-linecap="round" stroke-dasharray="' + (intensity * 91).toFixed(1) + ' 91" transform="rotate(-90 16 16)" opacity=".85"/>' +
          '<text x="16" y="5.4" text-anchor="middle" font-size="5.5" font-weight="700" fill="#5c6a7d" font-family="Baloo 2, sans-serif">N</text>' +
          '<g transform="rotate(' + rot.toFixed(1) + ' 16 16)">' +
            '<path d="M16 7 L20.5 19 L16 16.4 L11.5 19 Z" fill="url(#' + gradId + ')"/>' +
          '</g>' +
          '<circle cx="16" cy="16" r="2.1" fill="' + colors.b + '"/>' +
        '</g>' +
        '</svg>';
    }

    // Live compass calibration: on tap, ask the phone for its heading
    // (iOS needs an explicit permission prompt, Android/desktop fire the
    // event directly) and rotate every wind icon's <g class="gw-compass-rose">
    // by the opposite of that heading. Result: the N mark always points to
    // true/magnetic north as the person turns around with their phone, and
    // the wind needle (drawn relative to N) keeps reading correctly.
    let compassActive = false;
    let lastHeading = 0; // remembered so re-rendered icons (new hour/day) pick it back up
    function applyCompassRotation(headingDeg) {
      lastHeading = headingDeg || 0;
      const rot = (-lastHeading).toFixed(1);
      document.querySelectorAll('.gw-wind-ic .gw-compass-rose').forEach(g => {
        g.style.transformOrigin = '16px 16px';
        g.style.transform = 'rotate(' + rot + 'deg)';
      });
    }
    function onDeviceOrientation(e) {
      // iOS Safari exposes webkitCompassHeading (already 0=N, clockwise).
      // Other browsers give `alpha` from deviceorientationabsolute, which
      // needs inverting to read as a compass heading.
      let heading = null;
      if (typeof e.webkitCompassHeading === 'number') heading = e.webkitCompassHeading;
      else if (e.absolute && typeof e.alpha === 'number') heading = 360 - e.alpha;
      if (heading == null) return;
      applyCompassRotation(heading);
    }
    function setupCompassCalibration() {
      const btn = document.getElementById('gwCompassCalBtn');
      if (!btn) return;
      btn.addEventListener('click', async () => {
        if (compassActive) {
          // toggle off — go back to fixed north-up icons
          compassActive = false;
          window.removeEventListener('deviceorientationabsolute', onDeviceOrientation);
          window.removeEventListener('deviceorientation', onDeviceOrientation);
          document.querySelectorAll('.gw-wind-ic .gw-compass-rose').forEach(g => { g.style.transform = ''; });
          btn.classList.remove('active');
          return;
        }
        try {
          if (typeof DeviceOrientationEvent !== 'undefined' &&
              typeof DeviceOrientationEvent.requestPermission === 'function') {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res !== 'granted') {
              alert(t('दिशा जानने की अनुमति नहीं मिली। फ़ोन की सेटिंग में जाकर कंपास की अनुमति दें।',
                       'Compass permission was not granted. Enable motion/orientation access in your phone settings.'));
              return;
            }
          }
          window.addEventListener('deviceorientationabsolute', onDeviceOrientation, true);
          window.addEventListener('deviceorientation', onDeviceOrientation, true);
          compassActive = true;
          btn.classList.add('active');
        } catch (err) {
          alert(t('इस डिवाइस/ब्राउज़र में लाइव कंपास उपलब्ध नहीं है।', 'Live compass isn\'t available on this device/browser.'));
        }
      });
    }

    // Hourly wind strip shown right below the rain map — same day-slicing
    // pattern as the precipitation strip above, but each hour gets a small
    // compass needle (direction) with a strength-coloured progress ring
    // (speed), plus the km/h value and gusts underneath.
    function renderWindStrip(dayIdx) {
      if (!lastData || !els.windHourly) return;
      const data = lastData.data;
      const hourly = data.hourly, daily = data.daily, cur = data.current;
      const dateStr = daily.time[dayIdx];
      if (els.windDayTag) {
        els.windDayTag.textContent = dayIdx === 0 ? '' : '· ' + dayLabel(dateStr, dayIdx);
      }
      let idxs = [];
      if (dayIdx === 0) {
        const nowIdx = hourly.time.findIndex(tm => new Date(tm) >= new Date(cur.time));
        const start = nowIdx === -1 ? 0 : nowIdx;
        for (let i = start; i < hourly.time.length && idxs.length < GW_ROLLING_HOURS; i++) idxs.push(i);
      } else {
        for (let i = 0; i < hourly.time.length; i++) {
          if (hourly.time[i].slice(0, 10) === dateStr) idxs.push(i);
        }
      }
      let html = '';
      if (!idxs.length || !hourly.wind_speed_10m || !hourly.wind_speed_10m.length) {
        html = '<p class="gw-suggest-empty">' + t('इस दिन के लिए हवा की जानकारी उपलब्ध नहीं', 'Wind detail not available for this day') + '</p>';
      } else {
        idxs.forEach((i, pos) => {
          const kmh = hourly.wind_speed_10m[i] || 0;
          const dirDeg = hourly.wind_direction_10m ? (hourly.wind_direction_10m[i] || 0) : 0;
          const gust = hourly.wind_gusts_10m ? Math.round(hourly.wind_gusts_10m[i] || 0) : null;
          const isNow = dayIdx === 0 && pos === 0;
          html += '<div class="gw-wind-item' + (isNow ? ' now' : '') + '">' +
            '<span class="gw-wind-time">' + (isNow ? t('अभी', 'Now') : fmtHour(hourly.time[i])) + '</span>' +
            '<span class="gw-wind-ic">' + windArrowSvg(i, kmh, dirDeg) + '</span>' +
            '<span class="gw-wind-val">' + Math.round(kmh) + ' <small>km/h</small></span>' +
            '<span class="gw-wind-dir">' + windDir(dirDeg) + (gust !== null ? ' · ' + t('झोंका ', 'gust ') + gust : '') + '</span>' +
            '</div>';
        });
      }
      els.windHourly.innerHTML = html;
      if (compassActive) applyCompassRotation(lastHeading);
    }

    // -------------------- API calls (Open-Meteo — free, no key) --------------------
    function showLoading() {
      els.skeleton.hidden = false;
      els.error.hidden = true;
      els.content.hidden = true;
    }
    function showError(msg) {
      els.skeleton.hidden = true;
      els.content.hidden = true;
      els.error.hidden = false;
      els.errorText.textContent = msg || t('मौसम लोड नहीं हो सका। कृपया दोबारा कोशिश करें।', 'Could not load weather. Please try again.');
    }

    function omApiUrl(lat, lon) {
      const params = [
        'latitude=' + lat,
        'longitude=' + lon,
        'timezone=auto',
        'forecast_days=10',
        'current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl',
        'hourly=temperature_2m,precipitation_probability,precipitation,weather_code,visibility,is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
        'daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max'
      ];
      return 'https://api.open-meteo.com/v1/forecast?' + params.join('&');
    }

    function fetchJson(url) {
      return fetch(url).then(r => {
        if (!r.ok) return r.json().catch(() => null).then(body => {
          const msg = body && body.reason ? body.reason : ('HTTP ' + r.status);
          throw new Error(msg);
        });
        return r.json();
      });
    }

    // Open-Meteo's raw JSON already comes back as { current:{...}, daily:{arrays}, hourly:{arrays} }
    // with field names that match what render()/renderHourlyForDay() expect — the only things we
    // add here are a human-readable condition_text (Open-Meteo gives a numeric code only), and we
    // trim the hourly arrays down to the next 48h to keep the strip focused on today + tomorrow.
    function transformOpenMeteoData(json) {
      const cur = json.current || {};
      const cObj = {
        time: cur.time,
        temperature_2m: cur.temperature_2m,
        apparent_temperature: cur.apparent_temperature,
        relative_humidity_2m: cur.relative_humidity_2m,
        wind_speed_10m: cur.wind_speed_10m || 0,
        wind_direction_10m: cur.wind_direction_10m || 0,
        wind_gusts_10m: cur.wind_gusts_10m || 0,
        pressure_msl: cur.pressure_msl,
        weather_code: cur.weather_code,
        condition_text: wmoText(cur.weather_code),
        is_day: cur.is_day
      };

      const d = json.daily || {};
      const dObj = {
        time: d.time || [],
        weather_code: d.weather_code || [],
        temperature_2m_max: d.temperature_2m_max || [],
        temperature_2m_min: d.temperature_2m_min || [],
        sunrise: d.sunrise || [],
        sunset: d.sunset || [],
        precipitation_sum: d.precipitation_sum || [],
        precipitation_probability_max: d.precipitation_probability_max || [],
        uv_index_max: d.uv_index_max || [],
        wind_speed_10m_max: d.wind_speed_10m_max || [],
        wind_gusts_10m_max: d.wind_gusts_10m_max || []
      };

      const h = json.hourly || {};
      // find the index of "now" (first hourly slot >= current time) and keep 48h from there
      let startIdx = 0;
      if (h.time && cur.time) {
        const found = h.time.findIndex(tm => new Date(tm) >= new Date(cur.time));
        if (found !== -1) startIdx = found;
      }
      const endIdx = startIdx + 48;
      const hObj = {
        time: (h.time || []).slice(startIdx, endIdx),
        weather_code: (h.weather_code || []).slice(startIdx, endIdx),
        temperature_2m: (h.temperature_2m || []).slice(startIdx, endIdx),
        precipitation_probability: (h.precipitation_probability || []).slice(startIdx, endIdx),
        precipitation: (h.precipitation || []).slice(startIdx, endIdx),
        is_day: (h.is_day || []).slice(startIdx, endIdx),
        visibility: (h.visibility || []).slice(startIdx, endIdx),
        wind_speed_10m: (h.wind_speed_10m || []).slice(startIdx, endIdx),
        wind_direction_10m: (h.wind_direction_10m || []).slice(startIdx, endIdx),
        wind_gusts_10m: (h.wind_gusts_10m || []).slice(startIdx, endIdx)
      };

      return { current: cObj, daily: dObj, hourly: hObj };
    }

    function fetchForecast(lat, lon, place) {
      showLoading();
      lastLatLon = { lat, lon };

      fetchJson(omApiUrl(lat, lon)).then(json => {
        try {
          const data = transformOpenMeteoData(json);
          render(data, place, true);
        } catch (renderErr) {
          console.error('Weather render() failed:', renderErr);
          showError();
          return;
        }
        try { localStorage.setItem(LAST_PLACE_KEY, JSON.stringify({ lat, lon, place })); } catch (e) {}
      }).catch(err => {
        console.error('Weather fetch failed:', err);
        showError(isEn() ? err.message : null);
      });
    }

    function reverseGeocode(lat, lon) {
      return fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lon + '&localityLanguage=en')
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!d) return t('मेरी लोकेशन', 'My location');
          return d.locality || d.city || d.principalSubdivision || t('मेरी लोकेशन', 'My location');
        })
        .catch(() => t('मेरी लोकेशन', 'My location'));
    }

    const DEFAULT_LOCATION = { lat: 28.6139, lon: 77.2090, place: t('नई दिल्ली (डिफ़ॉल्ट)', 'New Delhi (default)') };

    function useMyLocation() {
      const secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      if (!('geolocation' in navigator) || !secure) {
        fetchForecast(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, DEFAULT_LOCATION.place);
        return;
      }
      showLoading();
      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude, longitude } = pos.coords;
        const place = await reverseGeocode(latitude, longitude);
        fetchForecast(latitude, longitude, place);
      }, () => {
        fetchForecast(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, DEFAULT_LOCATION.place);
      }, { timeout: 8000 });
    }

    // -------------------- Search / geocoding --------------------
    // Open-Meteo's geocoder (GeoNames-based) is fast but has poor coverage of
    // small Indian villages. OpenStreetMap Nominatim indexes villages/hamlets
    // far better, so it is queried in TWO ways every time, in parallel with
    // Open-Meteo, and the three result sets are merged + ranked:
    //   1) free-text query, as typed
    //   2) structured query — if the user typed "village, district" (comma-
    //      separated), the parts are sent as separate city/county fields,
    //      which lets Nominatim disambiguate villages that share a name
    //      across different districts (very common in India)
    // Results are tagged with their place type (village/town/city/...) and
    // sorted so villages/hamlets and exact-name matches surface first.
    function closeSuggest() {
      els.suggest.hidden = true;
      els.suggest.innerHTML = '';
      suggestItems = [];
      suggestIndex = -1;
    }

    // Place types we accept from Nominatim — anything else (roads, shops,
    // buildings, admin boundaries with no settlement, etc.) is dropped.
    // NOTE: many small Indian villages/hamlets are mapped in OSM as
    // "locality", "isolated_dwelling", "neighbourhood" or "quarter" instead
    // of a clean "village"/"hamlet" tag (common with HOT/LGD import data) —
    // these are included so real villages aren't silently filtered out.
    const NOMINATIM_SETTLEMENT_TYPES = ['village', 'hamlet', 'town', 'city', 'suburb', 'municipality', 'county', 'city_district', 'locality', 'isolated_dwelling', 'neighbourhood', 'quarter', 'town_or_city', 'administrative'];

    function typeLabel(type) {
      const map = {
        village: t('गाँव', 'Village'),
        hamlet: t('बस्ती', 'Hamlet'),
        town: t('कस्बा', 'Town'),
        city: t('शहर', 'City'),
        suburb: t('उपनगर', 'Suburb'),
        municipality: t('नगर पालिका', 'Municipality')
      };
      return map[type] || '';
    }

    function searchOpenMeteo(q) {
      return fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(q) + '&count=10&language=en&format=json&countryCode=IN')
        .then(r => r.json())
        .then(d => ((d && d.results) || []).filter(it => it.country_code === 'IN').map(it => ({
          name: it.name,
          admin1: it.admin1,
          admin2: it.admin2,
          latitude: it.latitude,
          longitude: it.longitude,
          type: it.feature_code === 'PPLA' || it.feature_code === 'PPLC' ? 'city' : (it.population && it.population < 20000 ? 'village' : 'town'),
          importance: 0.5
        })))
        .catch(() => []);
    }

    // Shared mapper: turns one raw Nominatim item into our normalized shape,
    // or null if it isn't a settlement we care about (road/shop/etc.).
    function mapNominatimItem(it) {
      const a = it.address || {};
      const addresstype = it.addresstype || '';
      if (NOMINATIM_SETTLEMENT_TYPES.indexOf(addresstype) === -1) return null;
      const name = a.village || a.hamlet || a.town || a.suburb || a.city || (it.display_name || '').split(',')[0].trim();
      if (!name) return null;
      return {
        name: name,
        admin2: a.county || a.state_district || a.city_district || '',
        admin1: a.state || '',
        latitude: parseFloat(it.lat),
        longitude: parseFloat(it.lon),
        type: addresstype === 'city_district' ? 'suburb' : addresstype,
        importance: it.importance || 0.3
      };
    }

    // Photon (Komoot) — a THIRD free, keyless geocoder, also OSM-based but
    // indexed/ranked differently from Nominatim, with better typo-tolerance
    // (edge-ngram search). Some villages that Nominatim's stricter matcher
    // misses turn up here, so it is queried in parallel as extra coverage.
    function mapPhotonItem(f) {
      const p = (f && f.properties) || {};
      if ((p.countrycode || '').toUpperCase() !== 'IN') return null;
      const okKinds = ['village', 'hamlet', 'town', 'city', 'suburb', 'municipality', 'locality', 'district', 'city_district'];
      const kind = p.osm_value || p.type || '';
      if (p.osm_key !== 'place' && okKinds.indexOf(kind) === -1) return null;
      const name = p.name || '';
      if (!name) return null;
      const coords = (f.geometry && f.geometry.coordinates) || [];
      if (coords.length < 2) return null;
      return {
        name: name,
        admin2: p.county || p.district || '',
        admin1: p.state || '',
        latitude: coords[1],
        longitude: coords[0],
        type: kind === 'city_district' ? 'suburb' : (kind || 'town'),
        importance: 0.25
      };
    }
    function searchPhoton(q) {
      const url = 'https://photon.komoot.io/api/?lang=en&limit=10&q=' + encodeURIComponent(q);
      return fetch(url)
        .then(r => r.json())
        .then(d => ((d && d.features) || []).map(mapPhotonItem).filter(Boolean))
        .catch(() => []);
    }

    // Free-text search — same string the user typed, sent as-is.
    function searchNominatim(q) {
      const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=10&countrycodes=in&accept-language=en&q=' + encodeURIComponent(q);
      return fetch(url, { headers: { 'Accept': 'application/json' } })
        .then(r => r.json())
        .then(arr => (arr || []).map(mapNominatimItem).filter(Boolean))
        .catch(() => []);
    }

    // Structured search — used when the query looks like "village, district",
    // or when a state is picked from the dropdown. Nominatim's "city" field
    // matches any settlement level (village, hamlet, town...), "county"
    // matches the district, and "state" matches the state — together these
    // pin down the exact village even when several villages nationwide (or
    // within the same state) share the same name.
    function searchNominatimStructured(village, district, state) {
      const params = ['format=jsonv2', 'addressdetails=1', 'limit=10', 'countrycodes=in', 'accept-language=en'];
      params.push('city=' + encodeURIComponent(village));
      if (district) params.push('county=' + encodeURIComponent(district));
      if (state) params.push('state=' + encodeURIComponent(state));
      const url = 'https://nominatim.openstreetmap.org/search?' + params.join('&');
      return fetch(url, { headers: { 'Accept': 'application/json' } })
        .then(r => r.json())
        .then(arr => (arr || []).map(mapNominatimItem).filter(Boolean))
        .catch(() => []);
    }

    // Indian states/UTs — used to auto-detect a state name typed anywhere in
    // the single search box (e.g. "Rampur Bihar" or "Rampur, Bihar, India"),
    // exactly like typing "restaurants in Paris France" works in Google.
    // No separate dropdown needed — the one box just understands this.
    const INDIA_STATES = [
      'Bihar', 'Uttar Pradesh', 'Jharkhand', 'West Bengal', 'Madhya Pradesh',
      'Rajasthan', 'Chhattisgarh', 'Haryana', 'Punjab', 'Maharashtra',
      'Gujarat', 'Odisha', 'Assam', 'Karnataka', 'Tamil Nadu',
      'Andhra Pradesh', 'Telangana', 'Kerala', 'Delhi', 'Uttarakhand',
      'Himachal Pradesh', 'Jammu and Kashmir', 'Goa', 'Tripura', 'Manipur',
      'Meghalaya', 'Nagaland', 'Mizoram', 'Sikkim', 'Arunachal Pradesh',
      'Chandigarh', 'Puducherry'
    ];
    function detectState(query) {
      const qLower = ' ' + query.toLowerCase().replace(/,/g, ' ') + ' ';
      for (let i = 0; i < INDIA_STATES.length; i++) {
        if (qLower.indexOf(' ' + INDIA_STATES[i].toLowerCase() + ' ') !== -1) return INDIA_STATES[i];
      }
      return '';
    }
    // Strips a detected state name back out of the query so it isn't also
    // sent as part of the village name itself (e.g. "Rampur Bihar" → "Rampur").
    function stripState(query, state) {
      if (!state) return query;
      const re = new RegExp('\\s*,?\\s*' + state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'ig');
      return query.replace(re, ' ').replace(/\s{2,}/g, ' ').trim();
    }

    function dedupeMerge(lists) {
      const out = [];
      lists.forEach(list => {
        list.forEach(f => {
          const dup = out.find(p =>
            p.name.trim().toLowerCase() === f.name.trim().toLowerCase() &&
            Math.abs(p.latitude - f.latitude) < 0.05 &&
            Math.abs(p.longitude - f.longitude) < 0.05
          );
          if (!dup) out.push(f);
          else if ((f.importance || 0) > (dup.importance || 0)) Object.assign(dup, f); // keep richer/more precise match
        });
      });
      return out;
    }

    // Rank so the most useful match is first: exact/starts-with name match
    // beats partial match, villages/hamlets are boosted (this is a village-
    // first search tool), then fall back to Nominatim's own importance score.
    function rankResults(items, query, detectedState) {
      const qLower = query.trim().toLowerCase();
      const villageFirstPart = stripState(qLower.split(',')[0].trim(), detectedState ? detectedState.toLowerCase() : '');
      const stateLower = detectedState ? detectedState.toLowerCase() : '';
      function score(it) {
        const nameLower = it.name.trim().toLowerCase();
        let s = 0;
        if (nameLower === villageFirstPart) s += 100;
        else if (nameLower.indexOf(villageFirstPart) === 0) s += 60;
        else if (nameLower.indexOf(villageFirstPart) !== -1) s += 20;
        if (it.type === 'village' || it.type === 'hamlet') s += 15;
        if (stateLower && (it.admin1 || '').toLowerCase() === stateLower) s += 25;
        s += (it.importance || 0) * 10;
        return s;
      }
      return items.slice().sort((a, b) => score(b) - score(a));
    }

    function renderSuggestions(items, query, detectedState) {
      if (!items.length) {
        els.suggest.innerHTML = '<div class="gw-suggest-empty">' +
          t('यह गाँव नक्शे में नहीं मिला। "गाँव, ज़िला" या "गाँव, राज्य" लिखकर देखें, या ऊपर 📍 बटन से अपना सही स्थान चुनें — इससे सटीक मौसम मिल जाएगा।',
            'This village isn\'t in the map data. Try "village, district" or "village, state", or tap the 📍 button above to use your exact location instead — that always gives an accurate forecast.') +
          '</div>';
        els.suggest.hidden = false;
        return;
      }
      suggestItems = rankResults(items, query, detectedState).slice(0, 10);
      els.suggest.innerHTML = suggestItems.map((it, i) => {
        const sub = [it.admin2, it.admin1].filter(Boolean).join(', ');
        const tag = typeLabel(it.type);
        return '<div class="gw-suggest-item" data-idx="' + i + '">' +
          '<span class="gwsi-ic">📍</span>' +
          '<span class="gwsi-main"><span class="gwsi-name">' + it.name + '</span>' + (tag ? '<span class="gwsi-tag">' + tag + '</span>' : '') + '</span>' +
          '<span class="gwsi-sub">' + sub + '</span>' +
          '</div>';
      }).join('');
      els.suggest.hidden = false;
      els.suggest.querySelectorAll('.gw-suggest-item').forEach(item => {
        item.addEventListener('click', () => pickSuggestion(parseInt(item.dataset.idx, 10)));
      });
    }

    let searchToken = 0;
    function runSearch(q) {
      if (!q || q.trim().length < 2) { closeSuggest(); return; }
      const query = q.trim();
      const myToken = ++searchToken;

      // Auto-detect a state name typed anywhere in the box (e.g. "Rampur
      // Bihar"), the way Google's search box understands "cafes in Bihar"
      // without a separate filter — then use it to disambiguate villages
      // that share a name across states.
      const detectedState = detectState(query);
      const villageOnly = stripState(query, detectedState) || query;

      // "village, district" → split for a structured Nominatim query too.
      const commaParts = villageOnly.split(',').map(s => s.trim()).filter(Boolean);
      const hasDistrictHint = commaParts.length >= 2;

      const tasks = [
        searchOpenMeteo(query),
        searchNominatim(query),
        searchPhoton(query)
      ];
      if (hasDistrictHint) tasks.push(searchNominatimStructured(commaParts[0], commaParts[1]));
      if (detectedState) tasks.push(searchNominatimStructured(commaParts[0], hasDistrictHint ? commaParts[1] : '', detectedState));

      Promise.all(tasks).then(results => {
        if (myToken !== searchToken) return; // a newer keystroke superseded this search
        renderSuggestions(dedupeMerge(results), query, detectedState);
      });
    }

    function pickSuggestion(idx) {
      const it = suggestItems[idx];
      if (!it) return;
      els.searchInput.value = it.name;
      els.clearBtn.hidden = false;
      closeSuggest();
      fetchForecast(it.latitude, it.longitude, it.name);
    }

    let searchDebounce = null;
    els.searchInput.addEventListener('input', () => {
      els.clearBtn.hidden = !els.searchInput.value;
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => runSearch(els.searchInput.value), 350);
    });
    els.searchInput.addEventListener('keydown', e => {
      if (!suggestItems.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); suggestIndex = Math.min(suggestIndex + 1, suggestItems.length - 1); highlightSuggest(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); suggestIndex = Math.max(suggestIndex - 1, 0); highlightSuggest(); }
      else if (e.key === 'Enter') { e.preventDefault(); pickSuggestion(suggestIndex >= 0 ? suggestIndex : 0); }
      else if (e.key === 'Escape') closeSuggest();
    });
    function highlightSuggest() {
      els.suggest.querySelectorAll('.gw-suggest-item').forEach((el, i) => el.classList.toggle('active', i === suggestIndex));
    }
    document.addEventListener('click', e => {
      if (!els.suggest.contains(e.target) && e.target !== els.searchInput) closeSuggest();
    });
    els.clearBtn.addEventListener('click', () => {
      els.searchInput.value = '';
      els.clearBtn.hidden = true;
      closeSuggest();
      els.searchInput.focus();
    });
    els.locateBtn.addEventListener('click', useMyLocation);
    els.refreshBtn.addEventListener('click', () => {
      if (lastLatLon) fetchForecast(lastLatLon.lat, lastLatLon.lon, els.placeName.textContent);
    });
    els.retryBtn.addEventListener('click', () => {
      if (lastLatLon) fetchForecast(lastLatLon.lat, lastLatLon.lon, els.placeName.textContent);
      else useMyLocation();
    });
    setupCompassCalibration();

    // -------------------- Language re-render hook --------------------
    // fx.js calls this automatically whenever the site's language toggle is
    // used. Open-Meteo's data itself doesn't change with language (only our
    // own condition-text labels do), so just re-render the cached data
    // instead of spending another network round-trip.
    window.renderWeatherCropOptions = function () {
      if (lastData) {
        lastData.data.current.condition_text = wmoText(lastData.data.current.weather_code);
        render(lastData.data, lastData.place, false);
      }
    };

    // -------------------- Init --------------------
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(LAST_PLACE_KEY) || 'null'); } catch (e) {}
    if (saved && saved.lat && saved.lon) {
      fetchForecast(saved.lat, saved.lon, saved.place);
    } else {
      useMyLocation();
    }
  }
})();
