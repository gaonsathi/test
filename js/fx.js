// ======================================================================
//  fx.js — SHARED extras: language toggle (Hindi/English), scroll
//  progress bar, button ripple, and card-tilt hover effect.
//  Loaded LAST (after script.js + section scripts) so every element
//  from every section already exists in the DOM.
// ======================================================================

(function () {

  // ---------------------------------------------------------------
  //  LANGUAGE TOGGLE (हिंदी / English)
  //  Any element with [data-en="..."] gets its innerHTML swapped
  //  between the original Hindi markup (cached on first switch) and
  //  the English version in data-en. Inputs/textareas with
  //  [data-en-placeholder] get their placeholder swapped instead.
  // ---------------------------------------------------------------
  const STORAGE_KEY = 'gs_lang';

  function setLanguage(lang) {
    const isEn = lang === 'en';

    document.querySelectorAll('[data-en]').forEach(el => {
      if (el.dataset.hiCache === undefined) el.dataset.hiCache = el.innerHTML;
      el.innerHTML = isEn ? el.dataset.en : el.dataset.hiCache;
    });

    document.querySelectorAll('[data-en-placeholder]').forEach(el => {
      if (el.dataset.hiPlaceholder === undefined) el.dataset.hiPlaceholder = el.placeholder;
      el.placeholder = isEn ? el.dataset.enPlaceholder : el.dataset.hiPlaceholder;
    });

    document.documentElement.lang = isEn ? 'en' : 'hi';
    document.querySelectorAll('.langbtn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }

    // re-render JS-generated content (mandi prices, community feed)
    // so it reflects the newly selected language too.
    if (typeof window.renderMandi === 'function') window.renderMandi();
    if (typeof window.renderFeed === 'function') window.renderFeed();
    if (typeof window.renderCrops === 'function') window.renderCrops();
    if (typeof window.renderWeatherCropOptions === 'function') window.renderWeatherCropOptions();
    if (typeof window.renderYojna === 'function') window.renderYojna();
    if (typeof window.renderYojnaArticle === 'function') window.renderYojnaArticle();
  }
  window.gsSetLanguage = setLanguage;

  const langSwitch = document.getElementById('langSwitch');
  if (langSwitch) {
    langSwitch.querySelectorAll('.langbtn').forEach(btn => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
  }

  let savedLang = 'hi';
  try { savedLang = localStorage.getItem(STORAGE_KEY) || 'hi'; } catch (e) { /* ignore */ }
  setLanguage(savedLang);

  // ---------------------------------------------------------------
  //  SCROLL PROGRESS BAR
  // ---------------------------------------------------------------
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    const updateProgress = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop || document.body.scrollTop;
      const height = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
      const pct = height > 0 ? (scrolled / height) * 100 : 0;
      progressBar.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  // ---------------------------------------------------------------
  //  BUTTON RIPPLE EFFECT — adds a small expanding circle wherever
  //  a .btn / .navbtn / .qchip / .chip / .langbtn is clicked/tapped.
  // ---------------------------------------------------------------
  function addRipple(e) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 1.6;
    const x = (e.clientX || (rect.left + rect.width / 2)) - rect.left - size / 2;
    const y = (e.clientY || (rect.top + rect.height / 2)) - rect.top - size / 2;
    ripple.className = 'gs-ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    target.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }
  document.querySelectorAll('.btn, .navbtn, .qchip, .chip, .langbtn, .explore-card, .hut').forEach(el => {
    el.style.position = el.style.position || 'relative';
    el.style.overflow = el.style.overflow || 'hidden';
    el.addEventListener('click', addRipple);
  });

  // ---------------------------------------------------------------
  //  RELEASE the entrance animation once it finishes.
  //  `.explore-card` fades/rises in via the `card-rise` CSS animation.
  //  A CSS animation keeps overriding the `transform` property forever
  //  (even after it "ends") as long as it's still assigned — that
  //  override wins over any transform the hover JS below sets, which is
  //  exactly why the tilt/repel hover looked like it did nothing. Once
  //  the animation finishes we drop `animation` entirely so the hover
  //  script can freely drive `transform`.
  // ---------------------------------------------------------------
  document.querySelectorAll('.explore-card').forEach(card => {
    card.addEventListener('animationend', function onEnd(e) {
      if (e.animationName === 'card-rise') {
        card.style.animation = 'none';
        card.removeEventListener('animationend', onEnd);
      }
    });
  });

  // ---------------------------------------------------------------
  //  MAGNETIC REPEL CARD + CURSOR SPOTLIGHT ON EXPLORE CARDS
  //  (desktop pointer only) — like a magnet with matching poles:
  //  whichever side the mouse is on, the whole card physically
  //  slides away toward the opposite side, with a slight tilt and
  //  a glow/glare that tracks the cursor. This is the premium
  //  "repel" hover effect (Awwwards/Linear/Stripe style).
  //
  //  Motion is driven by a critically-damped SPRING (not a plain
  //  lerp) stepped inside requestAnimationFrame using real elapsed
  //  time (dt), not a fixed per-frame fraction. That's what gives it
  //  a professional, weighted feel — a tiny bit of natural momentum
  //  and a gentle settle instead of a robotic snap-to-cursor, and it
  //  stays smooth regardless of the screen's refresh rate (60Hz,
  //  120Hz, etc). Critically, the CSS for .explore-card must NOT
  //  have a transition on `transform` (see style.css) and its
  //  entrance animation must be released after it finishes (see the
  //  animationend handler above) — either one fighting this loop is
  //  what makes the motion look like it isn't happening at all.
  // ---------------------------------------------------------------
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.explore-card.tilt').forEach(card => {
      const MAX_PUSH = 20;      // px — how far the card slides away from the cursor
      const MAX_TILT = 6;       // deg — small tilt kept for depth, not the main effect
      const BASE_LIFT = -8;     // px — slight rise on hover
      const STIFFNESS = 210;    // spring stiffness — higher = snappier
      const DAMPING = 22;       // spring damping — higher = less overshoot/bounce
      const GLOW_EASE = 0.22;   // glow uses a simple smooth follow, not a spring

      const axes = ['tx', 'ty', 'rx', 'ry'];
      let target = { tx: 0, ty: 0, rx: 0, ry: 0, mx: 50, my: 50 };
      let pos = { tx: 0, ty: 0, rx: 0, ry: 0 };
      let vel = { tx: 0, ty: 0, rx: 0, ry: 0 };
      let glow = { mx: 50, my: 50 };
      let hovering = false;
      let raf = null;
      let lastT = 0;

      function frame(t) {
        if (!lastT) lastT = t;
        // clamp dt so a dropped/backgrounded tab doesn't cause a huge jump
        const dt = Math.min((t - lastT) / 1000, 0.032);
        lastT = t;

        let restMove = 0;
        for (const k of axes) {
          const disp = pos[k] - target[k];
          const accel = -STIFFNESS * disp - DAMPING * vel[k];
          vel[k] += accel * dt;
          pos[k] += vel[k] * dt;
          restMove = Math.max(restMove, Math.abs(disp), Math.abs(vel[k]));
        }
        glow.mx += (target.mx - glow.mx) * GLOW_EASE;
        glow.my += (target.my - glow.my) * GLOW_EASE;

        card.style.transform =
          `translate3d(${pos.tx.toFixed(2)}px, ${(BASE_LIFT + pos.ty).toFixed(2)}px, 0) `
          + `scale(1.03) rotateX(${pos.rx.toFixed(2)}deg) rotateY(${pos.ry.toFixed(2)}deg)`;
        card.style.setProperty('--mx', glow.mx.toFixed(1) + '%');
        card.style.setProperty('--my', glow.my.toFixed(1) + '%');

        const glowSettled = Math.abs(glow.mx - 50) < 0.5 && Math.abs(glow.my - 50) < 0.5;
        if (!hovering && restMove < 0.02 && glowSettled) {
          card.style.transform = '';
          raf = null;
          lastT = 0;
          return;
        }
        raf = requestAnimationFrame(frame);
      }

      function ensureRunning() {
        if (!raf) raf = requestAnimationFrame(frame);
      }

      card.addEventListener('mousemove', e => {
        hovering = true;
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;   // 0..1
        const py = (e.clientY - rect.top) / rect.height;   // 0..1
        const dx = px - 0.5;   // -0.5..0.5, which side the cursor is on
        const dy = py - 0.5;

        // REPEL: card moves AWAY from the cursor side (opposite sign).
        target.tx = -dx * 2 * MAX_PUSH;
        target.ty = -dy * 2 * MAX_PUSH;
        // small tilt in the same direction as the push, for depth.
        target.ry = -dx * 2 * MAX_TILT;
        target.rx = dy * 2 * MAX_TILT;

        target.mx = px * 100;
        target.my = py * 100;
        ensureRunning();
      });

      card.addEventListener('mouseleave', () => {
        hovering = false;
        target = { tx: 0, ty: 0, rx: 0, ry: 0, mx: 50, my: 50 };
        ensureRunning();
      });
    });
  }

  // ---------------------------------------------------------------
  //  HERO SCROLL PARALLAX — the sky/hills/clouds layer drifts down
  //  slightly slower than the page as you scroll past the hero,
  //  giving it depth. The huts sit outside this layer so their
  //  click positions are never affected.
  // ---------------------------------------------------------------
  const heroScene = document.querySelector('.hero-scene');
  const sceneLayer = document.getElementById('sceneLayer');
  if (heroScene && sceneLayer) {
    let ticking = false;
    const updateParallax = () => {
      const rect = heroScene.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const progress = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1);
        sceneLayer.style.transform = `translateY(${progress * 36}px)`;
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  // ---------------------------------------------------------------
  //  HUT ENTRANCE — staggered fade/slide-in via a toggled class
  //  (not a CSS animation), so it never fights with the :hover lift.
  // ---------------------------------------------------------------
  document.querySelectorAll('.hut').forEach((hut, i) => {
    setTimeout(() => hut.classList.add('show'), 80 + i * 120);
  });

  // ---------------------------------------------------------------
  //  MAGNETIC HOVER — buttons/chips/icons gently pull toward the
  //  cursor while hovered, and ease back smoothly when it leaves.
  //  Desktop pointer only; respects prefers-reduced-motion via the
  //  global CSS rule that collapses all transition durations.
  // ---------------------------------------------------------------
  if (window.matchMedia('(pointer: fine)').matches) {
    const magneticTargets = document.querySelectorAll(
      '.qchip, .chip, .langbtn, .btn, .hamburger, .back-to-top, .logo .mark'
    );
    magneticTargets.forEach(el => {
      el.classList.add('magnetic');
      const strength = 0.4;
      const maxOffset = 8;
      const scaleUp = 1.04;
      const lift = 6;

      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        let x = (e.clientX - rect.left - rect.width / 2) * strength;
        let y = (e.clientY - rect.top - rect.height / 2) * strength;
        x = Math.max(-maxOffset, Math.min(maxOffset, x));
        y = Math.max(-maxOffset, Math.min(maxOffset, y));
        el.style.transform = `translate(${x}px, ${y - lift}px) scale(${scaleUp})`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

})();
