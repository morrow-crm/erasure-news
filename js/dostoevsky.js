/**
 * Dostoevsky theme effects — disintegration erasure, fascism word transformation,
 * detailed crow animation (flight, landing, hopping, pecking), rain, text flicker,
 * red string conspiracy lines, fragile-word dread pulse.
 *
 * All effects are scoped to the Dostoevsky theme and cleaned up on destroy.
 */

import { getState } from './erasure.js';
import { getTheme } from './theme.js';
import { updatePoem } from './poem.js';

// ── Fascism word pool ──
const FASCISM_WORDS = [
  'Control','Obey','Silence','Comply','Submit','Conform','Erase','Fear',
  'Power','Order','March','Purge','Loyalty','Surveillance','Decree',
  'Suppress','Mandate','Crush','Discipline','Subjugate',
];

// ── State ──
let destroyed = false;
let rainContainer = null;
let flickerTimer = null;
let crowTimer = null;
let crowEl = null;
let redCanvas = null;
let redCtx = null;
let keptWordPositions = [];
let destroyCount = 0;
let fascismSpans = new Set();
let dreadTimer = null;

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
function isMobile() { return window.matchMedia('(pointer: coarse)').matches; }
function isTablet() { return window.innerWidth <= 768 && window.innerWidth > 600; }

// ══════════════════════════════════════════════════════════════
//  DETAILED CROW SVG
// ══════════════════════════════════════════════════════════════

function createCrowSVG() {
  const mobile = isMobile();
  const tablet = isTablet();
  const w = mobile ? 45 : tablet ? 60 : 90;
  const h = mobile ? 35 : tablet ? 45 : 65;
  const el = document.createElement('div');
  el.className = 'dosto-crow';
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.innerHTML = `
    <svg class="crow-svg" viewBox="0 0 90 65" width="${w}" height="${h}">
      <defs>
        <linearGradient id="crow-iridescent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a0a12"/>
          <stop offset="40%" stop-color="#141428"/>
          <stop offset="60%" stop-color="#1a1a2e"/>
          <stop offset="100%" stop-color="#0e0e1a"/>
        </linearGradient>
        <linearGradient id="crow-wing-sheen" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="#12121e"/>
          <stop offset="50%" stop-color="#1e1e36"/>
          <stop offset="100%" stop-color="#2a2a3a"/>
        </linearGradient>
      </defs>
      <g class="crow-body-main">
        <!-- Shadow on ground (visible during flight) -->
        <ellipse class="crow-shadow" cx="45" cy="62" rx="20" ry="4" fill="rgba(0,0,0,0.3)" opacity="0"/>
        <!-- Tail fan -->
        <path d="M18,40 Q6,36 2,28" stroke="#0a0a12" stroke-width="3.5" fill="none"/>
        <path d="M18,42 Q5,40 1,34" stroke="#0e0e1a" stroke-width="3" fill="none"/>
        <path d="M18,44 Q7,46 2,40" stroke="#0a0a12" stroke-width="2.5" fill="none"/>
        <path d="M20,43 Q10,48 4,45" stroke="#0e0e1a" stroke-width="2" fill="none"/>
        <!-- Body -->
        <ellipse cx="42" cy="38" rx="18" ry="12" fill="url(#crow-iridescent)"/>
        <!-- Belly highlight -->
        <ellipse cx="44" cy="42" rx="10" ry="6" fill="#101018" opacity="0.5"/>
        <!-- Wing group (animated) -->
        <g class="crow-wing-group">
          <!-- Lower wing feathers (layered) -->
          <path d="M28,30 Q36,18 56,26 Q50,30 28,40Z" fill="url(#crow-wing-sheen)"/>
          <!-- Mid feathers -->
          <path d="M30,32 Q38,22 54,28 Q48,32 30,38Z" fill="#141428" opacity="0.7"/>
          <!-- Upper feather highlights -->
          <path d="M32,33 Q40,26 52,30" stroke="#2a2a3a" stroke-width="0.8" fill="none" opacity="0.5"/>
          <path d="M34,35 Q42,28 50,32" stroke="#2a2a3a" stroke-width="0.6" fill="none" opacity="0.4"/>
          <!-- Wing edge highlight (blue tint) -->
          <path d="M28,30 Q36,18 56,26" stroke="#2a2a3a" stroke-width="1.2" fill="none" opacity="0.6"/>
        </g>
        <!-- Legs -->
        <line x1="38" y1="49" x2="36" y2="58" stroke="#1a1a2a" stroke-width="1.4"/>
        <line x1="47" y1="49" x2="49" y2="58" stroke="#1a1a2a" stroke-width="1.4"/>
        <!-- Feet -->
        <path d="M33,58 L36,58 L38,57" stroke="#1a1a2a" stroke-width="1" fill="none"/>
        <path d="M47,57 L49,58 L52,58" stroke="#1a1a2a" stroke-width="1" fill="none"/>
        <path d="M34,59 L36,58" stroke="#1a1a2a" stroke-width="0.8" fill="none"/>
        <path d="M49,58 L51,59" stroke="#1a1a2a" stroke-width="0.8" fill="none"/>
      </g>
      <!-- Head group (animated for pecking/watching) -->
      <g class="crow-head-group">
        <!-- Neck -->
        <ellipse cx="58" cy="30" rx="5" ry="7" fill="#0e0e1a"/>
        <!-- Head -->
        <circle cx="64" cy="24" r="9" fill="url(#crow-iridescent)"/>
        <!-- Head iridescent sheen -->
        <circle cx="62" cy="22" r="6" fill="#141428" opacity="0.4"/>
        <!-- Beak — large, sharp, slightly hooked -->
        <path class="crow-beak" d="M73,22 L84,25 L82,26 L73,25Z" fill="#1e1e28"/>
        <path d="M73,24 L82,26 L80,27 L73,26Z" fill="#16161e"/>
        <!-- Beak hook -->
        <path d="M82,25 Q84,26 82,27" stroke="#1a1a24" stroke-width="0.8" fill="none"/>
        <!-- Eye — bright pale yellow -->
        <circle cx="67" cy="22" r="2.2" fill="#f0e060"/>
        <circle cx="67.3" cy="21.8" r="1" fill="#0a0a0a"/>
        <!-- Eye highlight -->
        <circle cx="67.8" cy="21.3" r="0.5" fill="#fff" opacity="0.6"/>
      </g>
    </svg>`;
  el.style.position = 'fixed';
  el.style.zIndex = '150';
  el.style.pointerEvents = 'none';
  return el;
}

// ══════════════════════════════════════════════════════════════
//  DISINTEGRATION WORD ERASURE
// ══════════════════════════════════════════════════════════════

/**
 * Disintegrate a word into 15-20 scattering particles.
 * The word collapses to nothing (no black bar, no ash).
 * Returns a Promise that resolves when complete.
 */
export function disintegrateWord(span) {
  return new Promise(resolve => {
    if (destroyed) { resolve(); return; }
    span.classList.add('dosto-disintegrating');

    const rect = span.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const text = span.textContent;
    const count = Math.min(20, Math.max(15, text.length * 2));
    const isFascism = fascismSpans.has(span);

    // Emit particles
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'dosto-particle';
      const baseColor = isFascism ? `rgb(${120 + Math.random()*40},${Math.random()*20},${Math.random()*20})` : `rgb(${160 + Math.random()*60},${165 + Math.random()*60},${180 + Math.random()*50})`;
      p.style.background = baseColor;
      p.style.left = `${cx + rand(-rect.width / 2, rect.width / 2)}px`;
      p.style.top = `${cy + rand(-rect.height / 2, rect.height / 2)}px`;
      p.style.setProperty('--dx', `${rand(-40, 40)}px`);
      p.style.setProperty('--dy', `${rand(-35, 25)}px`);
      p.style.setProperty('--rot', `${rand(-180, 180)}deg`);
      p.style.animationDelay = `${i * 0.03}s`;
      p.style.width = `${rand(2, 5)}px`;
      p.style.height = `${rand(2, 5)}px`;
      document.body.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }

    // Collapse the word to nothing after a brief delay
    setTimeout(() => {
      if (destroyed) { resolve(); return; }
      span.classList.remove('dosto-disintegrating');
      span.classList.add('dosto-gone');
      destroyCount++;
      // 1 in 5: corrupt a nearby word
      if (destroyCount % 5 === 0) {
        setTimeout(() => {
          if (!destroyed) transformNearbyWord(span);
        }, 600);
      }
      resolve();
    }, 350);
  });
}

/** Transform a nearby un-erased word into a fascism word. */
function transformNearbyWord(sourceSpan) {
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper) return;
  const { wState } = getState();
  const sourceRect = sourceSpan.getBoundingClientRect();
  const srcX = sourceRect.left + sourceRect.width / 2;
  const srcY = sourceRect.top + sourceRect.height / 2;

  const candidates = [...wrapper.querySelectorAll('.w')].filter(s => {
    const key = `${s.dataset.li}-${s.dataset.wi}`;
    if (wState[key] === 'erased') return false;
    if (fascismSpans.has(s)) return false;
    if (s === sourceSpan) return false;
    const r = s.getBoundingClientRect();
    if (r.width === 0) return false;
    const d = Math.hypot(r.left + r.width / 2 - srcX, r.top + r.height / 2 - srcY);
    return d < 300;
  });
  if (!candidates.length) return;

  candidates.sort((a, b) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    const da = Math.hypot(ra.left + ra.width / 2 - srcX, ra.top + ra.height / 2 - srcY);
    const db = Math.hypot(rb.left + rb.width / 2 - srcX, rb.top + rb.height / 2 - srcY);
    return da - db;
  });
  const target = candidates[Math.min(2, candidates.length - 1)];

  target.dataset.originalWord = target.textContent;
  target.classList.add('dosto-fascism-glow');
  setTimeout(() => {
    if (destroyed) return;
    target.textContent = pick(FASCISM_WORDS);
    target.classList.remove('dosto-fascism-glow');
    target.classList.add('dosto-fascism');
    fascismSpans.add(target);
  }, 400);
}

/** Check if a span is a fascism-transformed word. */
export function isFascismWord(span) {
  return fascismSpans.has(span);
}

/** Get all fascism words that are currently kept/surviving for the share card. */
export function getFascismWordsInPoem() {
  const { wState } = getState();
  const words = [];
  for (const span of fascismSpans) {
    const key = `${span.dataset.li}-${span.dataset.wi}`;
    if (wState[key] !== 'erased') {
      words.push(span.textContent);
    }
  }
  return words;
}

// ══════════════════════════════════════════════════════════════
//  THE CROW — slow flight, landing, hopping, multi-word pecking
// ══════════════════════════════════════════════════════════════

function scheduleCrow() {
  if (destroyed) return;
  const delay = crowEl ? rand(45000, 90000) : 15000;
  crowTimer = setTimeout(() => {
    if (destroyed) return;
    doCrowVisit();
  }, delay);
}

function getUnErasedWords() {
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper) return [];
  const { wState } = getState();
  return [...wrapper.querySelectorAll('.w')].filter(s => {
    const key = `${s.dataset.li}-${s.dataset.wi}`;
    return wState[key] !== 'erased' && s.getBoundingClientRect().width > 0;
  });
}

function doCrowVisit() {
  if (destroyed) return;
  const words = getUnErasedWords();
  if (!words.length) { scheduleCrow(); return; }
  const target = pick(words);
  const tRect = target.getBoundingClientRect();

  if (!crowEl) {
    crowEl = createCrowSVG();
    document.body.appendChild(crowEl);
  }

  const vw = window.innerWidth;
  const mobile = isMobile();
  const tablet = isTablet();
  const crowW = mobile ? 45 : tablet ? 60 : 90;
  const crowH = mobile ? 35 : tablet ? 45 : 65;

  // Enter from right or left randomly
  const fromRight = Math.random() > 0.5;
  const startX = fromRight ? vw + 30 : -crowW - 30;
  const startY = rand(40, 120);
  const endX = tRect.left + tRect.width / 2 - crowW / 2;
  const endY = tRect.top - crowH + 8;

  crowEl.style.left = `${startX}px`;
  crowEl.style.top = `${startY}px`;
  crowEl.style.opacity = '1';
  crowEl.style.display = '';
  // Face the direction of travel
  crowEl.style.transform = fromRight ? 'scaleX(-1)' : 'scaleX(1)';

  // Show shadow during flight
  const shadow = crowEl.querySelector('.crow-shadow');
  if (shadow) shadow.style.opacity = '0.3';

  // Start wing flapping
  const wingGroup = crowEl.querySelector('.crow-wing-group');
  if (wingGroup) wingGroup.classList.add('crow-flying');

  // Slow flight: 4-6 seconds
  const flightDur = rand(4000, 6000);
  const flightStart = performance.now();
  const arcPeakY = Math.min(startY, endY) - rand(50, 100);

  function animateFlight(now) {
    if (destroyed) return;
    const t = Math.min((now - flightStart) / flightDur, 1);
    // Ease-in-out for natural deceleration on approach
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const cpX = (startX + endX) / 2;
    const cpY = arcPeakY;
    const x = (1 - e) ** 2 * startX + 2 * (1 - e) * e * cpX + e * e * endX;
    const y = (1 - e) ** 2 * startY + 2 * (1 - e) * e * cpY + e * e * endY;
    crowEl.style.left = `${x}px`;
    crowEl.style.top = `${y}px`;

    // Fade shadow as crow descends
    if (shadow) {
      const groundDist = Math.max(0, 1 - t);
      shadow.style.opacity = `${0.15 + groundDist * 0.15}`;
    }

    if (t < 1) requestAnimationFrame(animateFlight);
    else crowLand(target, fromRight);
  }
  requestAnimationFrame(animateFlight);
}

function crowLand(target, fromRight) {
  if (destroyed) return;
  const wingGroup = crowEl.querySelector('.crow-wing-group');
  if (wingGroup) wingGroup.classList.remove('crow-flying');
  const shadow = crowEl.querySelector('.crow-shadow');
  if (shadow) shadow.style.opacity = '0';

  // Landing wing flare
  crowEl.classList.add('crow-landing');
  setTimeout(() => {
    if (destroyed) return;
    crowEl.classList.remove('crow-landing');
    // Cock head (observe surroundings)
    crowEl.classList.add(fromRight ? 'crow-watching' : 'crow-watching-right');
    setTimeout(() => {
      if (destroyed) return;
      crowEl.classList.remove('crow-watching', 'crow-watching-right');
      // Begin hopping + pecking sequence
      crowHopAndPeck(target, 0);
    }, rand(600, 1000));
  }, 500);
}

function crowHopAndPeck(currentTarget, hopCount) {
  if (destroyed) return;
  const maxHops = 1 + Math.floor(Math.random() * 3); // 1-3 hops
  if (hopCount >= maxHops) {
    // Done pecking, watch then fly away
    crowWatchAndLeave();
    return;
  }

  // Hop to the target
  if (hopCount > 0) {
    // Find next adjacent word to hop to
    const words = getUnErasedWords();
    const currentRect = currentTarget.getBoundingClientRect();
    const nearWords = words.filter(w => {
      if (w === currentTarget) return false;
      const r = w.getBoundingClientRect();
      const dist = Math.abs(r.left - currentRect.right);
      return dist < 150 && Math.abs(r.top - currentRect.top) < 30;
    });
    if (nearWords.length) {
      currentTarget = pick(nearWords);
      const tRect = currentTarget.getBoundingClientRect();
      const crowW = parseFloat(crowEl.style.width) || 90;
      const crowH = parseFloat(crowEl.style.height) || 65;
      const newX = tRect.left + tRect.width / 2 - crowW / 2;
      const newY = tRect.top - crowH + 8;

      // Animate hop
      crowEl.classList.add('crow-hopping');
      const startX = parseFloat(crowEl.style.left);
      const startY = parseFloat(crowEl.style.top);
      const hopDur = 300;
      const hopStart = performance.now();
      function animateHop(now) {
        if (destroyed) return;
        const t = Math.min((now - hopStart) / hopDur, 1);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        crowEl.style.left = `${startX + (newX - startX) * e}px`;
        crowEl.style.top = `${startY + (newY - startY) * e - Math.sin(t * Math.PI) * 12}px`;
        if (t < 1) requestAnimationFrame(animateHop);
        else {
          crowEl.classList.remove('crow-hopping');
          doPeckSequence(currentTarget, hopCount, maxHops);
        }
      }
      requestAnimationFrame(animateHop);
      return;
    }
  }

  doPeckSequence(currentTarget, hopCount, maxHops);
}

function doPeckSequence(target, hopCount, maxHops) {
  if (destroyed) return;
  // Peck 2-4 times
  const totalPecks = 2 + Math.floor(Math.random() * 3);
  let peckCount = 0;

  function doPeck() {
    if (destroyed) return;
    if (peckCount >= totalPecks) {
      // Cock head after pecking (observing damage)
      const dir = Math.random() > 0.5 ? 'crow-watching' : 'crow-watching-right';
      crowEl.classList.add(dir);
      setTimeout(() => {
        if (destroyed) return;
        crowEl.classList.remove(dir);
        // Disintegrate the word
        crowDisintegrateWord(target, () => {
          crowHopAndPeck(target, hopCount + 1);
        });
      }, rand(400, 700));
      return;
    }

    crowEl.classList.add('crow-pecking');
    // Word shudder
    target.style.transform = `translateX(${Math.random() > 0.5 ? 2 : -2}px)`;
    emitSpark(target);
    peckCount++;

    setTimeout(() => {
      if (destroyed) return;
      crowEl.classList.remove('crow-pecking');
      target.style.transform = '';
      setTimeout(doPeck, rand(150, 300));
    }, 120);
  }
  doPeck();
}

function emitSpark(span) {
  const rect = span.getBoundingClientRect();
  const dot = document.createElement('div');
  dot.className = 'dosto-spark';
  dot.style.left = `${rect.left + rand(0, rect.width)}px`;
  dot.style.top = `${rect.top + rand(0, rect.height)}px`;
  dot.style.setProperty('--spark-dx', `${rand(-15, 15)}px`);
  dot.style.setProperty('--spark-dy', `${rand(-20, -5)}px`);
  document.body.appendChild(dot);
  dot.addEventListener('animationend', () => dot.remove());
}

function crowDisintegrateWord(target, callback) {
  if (destroyed) return;
  const { wState } = getState();
  const key = `${target.dataset.li}-${target.dataset.wi}`;
  if (wState[key] === 'erased') { callback(); return; }

  wState[key] = 'erased';
  target.classList.add('erased');
  disintegrateWord(target).then(() => {
    updatePoem();
    onWordAction();
    callback();
  });
}

function crowWatchAndLeave() {
  if (destroyed) return;
  // One last head tilt
  crowEl.classList.add('crow-watching');
  setTimeout(() => {
    if (destroyed) return;
    crowEl.classList.remove('crow-watching');
    crowFlyAway();
  }, rand(800, 1500));
}

function crowFlyAway() {
  if (destroyed) return;
  const flyLeft = Math.random() > 0.5;
  crowEl.style.transform = flyLeft ? 'scaleX(1)' : 'scaleX(-1)';
  const wingGroup = crowEl.querySelector('.crow-wing-group');
  if (wingGroup) wingGroup.classList.add('crow-flying');
  const shadow = crowEl.querySelector('.crow-shadow');
  if (shadow) shadow.style.opacity = '0.2';

  const startX = parseFloat(crowEl.style.left);
  const startY = parseFloat(crowEl.style.top);
  const endX = flyLeft ? -120 : window.innerWidth + 120;
  const endY = rand(-80, -30);
  const flightDur = rand(3000, 4500);
  const flightStart = performance.now();

  function animateExit(now) {
    if (destroyed) return;
    const t = Math.min((now - flightStart) / flightDur, 1);
    const e = t * t; // ease in — accelerate away
    const x = startX + (endX - startX) * e;
    const y = startY + (endY - startY) * e;
    crowEl.style.left = `${x}px`;
    crowEl.style.top = `${y}px`;
    if (shadow) shadow.style.opacity = `${0.2 * (1 - t)}`;

    if (t < 1) requestAnimationFrame(animateExit);
    else {
      crowEl.style.display = 'none';
      if (wingGroup) wingGroup.classList.remove('crow-flying');
      if (shadow) shadow.style.opacity = '0';
      scheduleCrow();
    }
  }
  requestAnimationFrame(animateExit);
}

// ══════════════════════════════════════════════════════════════
//  FRAGILE WORD DREAD PULSE
// ══════════════════════════════════════════════════════════════

function startDreadPulse() {
  function doPulse() {
    if (destroyed) return;
    const words = getUnErasedWords();
    if (words.length) {
      const w = pick(words);
      w.classList.add('dosto-dread');
      w.addEventListener('animationend', () => w.classList.remove('dosto-dread'), { once: true });
    }
    dreadTimer = setTimeout(doPulse, rand(8000, 10000));
  }
  dreadTimer = setTimeout(doPulse, rand(5000, 8000));
}

// ══════════════════════════════════════════════════════════════
//  RAIN
// ══════════════════════════════════════════════════════════════

function startRain() {
  if (isMobile()) return;
  rainContainer = document.createElement('div');
  rainContainer.className = 'dosto-rain';
  const workspace = document.getElementById('workspace');
  if (!workspace) return;
  workspace.appendChild(rainContainer);

  for (let i = 0; i < 30; i++) {
    const streak = document.createElement('div');
    streak.className = 'dosto-rain-streak';
    streak.style.left = `${rand(0, 100)}%`;
    streak.style.animationDuration = `${rand(8, 12)}s`;
    streak.style.animationDelay = `${rand(0, 8)}s`;
    streak.style.opacity = `${rand(0.08, 0.18)}`;
    rainContainer.appendChild(streak);
  }
}

// ══════════════════════════════════════════════════════════════
//  TEXT FLICKER
// ══════════════════════════════════════════════════════════════

function startFlicker() {
  if (isMobile()) return;
  function doFlicker() {
    if (destroyed) return;
    const words = getUnErasedWords();
    if (words.length) {
      const w = pick(words);
      w.classList.add('dosto-flicker');
      w.addEventListener('animationend', () => w.classList.remove('dosto-flicker'), { once: true });
    }
    flickerTimer = setTimeout(doFlicker, rand(3000, 5000));
  }
  flickerTimer = setTimeout(doFlicker, rand(2000, 4000));
}

// ══════════════════════════════════════════════════════════════
//  RED STRING CONSPIRACY LINES
// ══════════════════════════════════════════════════════════════

function initRedString() {
  redCanvas = document.createElement('canvas');
  redCanvas.className = 'dosto-red-string';
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper) return;
  wrapper.style.position = 'relative';
  wrapper.insertBefore(redCanvas, wrapper.firstChild);
  resizeRedCanvas();
  window.addEventListener('resize', resizeRedCanvas);
}

function resizeRedCanvas() {
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper || !redCanvas) return;
  redCanvas.width = wrapper.offsetWidth;
  redCanvas.height = wrapper.offsetHeight;
  redCanvas.style.width = `${wrapper.offsetWidth}px`;
  redCanvas.style.height = `${wrapper.offsetHeight}px`;
  redCtx = redCanvas.getContext('2d');
  drawRedStrings();
}

export function drawRedStrings() {
  if (!redCtx || !redCanvas) return;
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper) return;
  const wrapperRect = wrapper.getBoundingClientRect();

  redCtx.clearRect(0, 0, redCanvas.width, redCanvas.height);

  const { wState } = getState();
  const kept = [...wrapper.querySelectorAll('.w')].filter(s => {
    const key = `${s.dataset.li}-${s.dataset.wi}`;
    return wState[key] === 'kept';
  });

  if (kept.length < 2) return;

  redCtx.strokeStyle = 'rgba(139, 0, 0, 0.3)';
  redCtx.lineWidth = 1;
  redCtx.setLineDash([4, 4]);

  for (let i = 1; i < kept.length; i++) {
    const r1 = kept[i - 1].getBoundingClientRect();
    const r2 = kept[i].getBoundingClientRect();
    const x1 = r1.left + r1.width / 2 - wrapperRect.left;
    const y1 = r1.top + r1.height / 2 - wrapperRect.top;
    const x2 = r2.left + r2.width / 2 - wrapperRect.left;
    const y2 = r2.top + r2.height / 2 - wrapperRect.top;
    redCtx.beginPath();
    redCtx.moveTo(x1, y1);
    redCtx.lineTo(x2, y2);
    redCtx.stroke();
  }

  keptWordPositions = kept.map(s => {
    const r = s.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2 - wrapperRect.left) / wrapperRect.width,
      y: (r.top + r.height / 2 - wrapperRect.top) / wrapperRect.height,
    };
  });
}

export function getRedStringPositions() {
  return keptWordPositions;
}

// ══════════════════════════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════════════════════════

export function initDostoevsky() {
  destroyDostoevsky();
  if (getTheme() !== 'dostoevsky') return;
  destroyed = false;
  destroyCount = 0;

  startRain();
  startFlicker();
  startDreadPulse();
  initRedString();
  scheduleCrow();

  // Inject "No undoing fate" label if not present
  const toolbar = document.querySelector('#workspace .fmt-group:last-child');
  if (toolbar && !toolbar.querySelector('.dosto-fate-label')) {
    const label = document.createElement('span');
    label.className = 'dosto-fate-label';
    label.textContent = 'No undoing fate';
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
      undoBtn.insertAdjacentElement('afterend', label);
    }
  }
}

export function destroyDostoevsky() {
  destroyed = true;
  if (flickerTimer) { clearTimeout(flickerTimer); flickerTimer = null; }
  if (crowTimer) { clearTimeout(crowTimer); crowTimer = null; }
  if (dreadTimer) { clearTimeout(dreadTimer); dreadTimer = null; }
  if (crowEl) { crowEl.remove(); crowEl = null; }
  if (rainContainer) { rainContainer.remove(); rainContainer = null; }
  if (redCanvas) {
    window.removeEventListener('resize', resizeRedCanvas);
    redCanvas.remove();
    redCanvas = null;
    redCtx = null;
  }
  // Remove fate label
  const label = document.querySelector('.dosto-fate-label');
  if (label) label.remove();

  fascismSpans.clear();
  keptWordPositions = [];
  destroyCount = 0;
}

/** Called by erasure.js after any erase/keep action to update red strings. */
export function onWordAction() {
  if (getTheme() === 'dostoevsky' && redCtx) {
    drawRedStrings();
  }
}
