/**
 * Dostoevsky theme effects — fire/ash erasure, fascism word transformation,
 * crow animation, rain, text flicker, red string conspiracy lines.
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
let keptWordPositions = [];  // for red string lines
let burnCount = 0;
let fascismSpans = new Set();

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
function isMobile() { return window.matchMedia('(pointer: coarse)').matches; }

// ══════════════════════════════════════════════════════════════
//  FIRE & ASH WORD ERASURE
// ══════════════════════════════════════════════════════════════

/**
 * Play the fire-and-ash burn sequence on a word span.
 * Returns a Promise that resolves when the burn is complete.
 */
export function burnWord(span) {
  return new Promise(resolve => {
    const isFascism = fascismSpans.has(span);
    const duration = isFascism ? 800 : 1200;
    span.classList.add('dosto-burning');

    // Phase 1: flames (0 – 60% of duration)
    // Phase 2: char and darken (40% – 80%)
    // Phase 3: ash bar (80% – 100%)
    const start = performance.now();

    function animateBurn(now) {
      if (destroyed) { resolve(); return; }
      const t = Math.min((now - start) / duration, 1);

      if (t < 0.6) {
        // Flame phase — cycle yellow → orange → red
        const flameT = t / 0.6;
        const r = Math.round(255 - flameT * 100);
        const g = Math.round(200 * (1 - flameT * 0.8));
        const b = Math.round(50 * (1 - flameT));
        span.style.color = `rgb(${r},${g},${b})`;
        span.style.textShadow = `0 ${-2 - flameT * 4}px ${4 + flameT * 6}px rgba(255,${Math.round(120 * (1 - flameT))},0,${0.8 - flameT * 0.3})`;
        // Slight jitter
        span.style.transform = `translateY(${Math.sin(now * 0.03) * 1.5}px)`;
      } else if (t < 0.8) {
        // Charring — go dark
        const charT = (t - 0.6) / 0.2;
        const v = Math.round(60 * (1 - charT));
        span.style.color = `rgb(${80 + v},${v},${v})`;
        span.style.textShadow = `0 0 ${3 * (1 - charT)}px rgba(200,50,0,${0.3 * (1 - charT)})`;
        span.style.transform = '';
      } else {
        // Final ash state
        span.style.color = '';
        span.style.textShadow = '';
        span.style.transform = '';
      }

      if (t < 1) {
        requestAnimationFrame(animateBurn);
      } else {
        span.classList.remove('dosto-burning');
        span.classList.add('dosto-ash');
        // Emit falling ash particles
        emitAsh(span);
        burnCount++;
        // 1 in 5 chance: ash transforms a nearby word
        if (burnCount % 5 === 0) {
          setTimeout(() => {
            if (!destroyed) transformNearbyWord(span);
          }, 600);
        }
        resolve();
      }
    }
    requestAnimationFrame(animateBurn);
  });
}

/** Emit 6-8 grey ash particles drifting downward. */
function emitAsh(span) {
  const rect = span.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const count = 6 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'dosto-ash-particle';
    dot.style.left = `${cx + rand(-rect.width / 2, rect.width / 2)}px`;
    dot.style.top = `${cy}px`;
    dot.style.setProperty('--drift-x', `${rand(-15, 15)}px`);
    dot.style.setProperty('--fall-dist', `${rand(30, 60)}px`);
    dot.style.animationDelay = `${i * 0.08}s`;
    document.body.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  }
}

/** Transform a nearby un-erased word into a fascism word. */
function transformNearbyWord(sourceSpan) {
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper) return;
  const { wState } = getState();
  const sourceRect = sourceSpan.getBoundingClientRect();
  const srcX = sourceRect.left + sourceRect.width / 2;
  const srcY = sourceRect.top + sourceRect.height / 2;

  // Find nearby un-erased, un-transformed words
  const candidates = [...wrapper.querySelectorAll('.w')].filter(s => {
    const key = `${s.dataset.li}-${s.dataset.wi}`;
    if (wState[key] === 'erased') return false;
    if (fascismSpans.has(s)) return false;
    if (s === sourceSpan) return false;
    const r = s.getBoundingClientRect();
    if (r.width === 0) return false;
    const d = Math.hypot(r.left + r.width / 2 - srcX, r.top + r.height / 2 - srcY);
    return d < 300; // within 300px
  });
  if (!candidates.length) return;

  // Pick closest
  candidates.sort((a, b) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    const da = Math.hypot(ra.left + ra.width / 2 - srcX, ra.top + ra.height / 2 - srcY);
    const db = Math.hypot(rb.left + rb.width / 2 - srcX, rb.top + rb.height / 2 - srcY);
    return da - db;
  });
  const target = candidates[Math.min(2, candidates.length - 1)]; // not the very closest, slightly random

  // Brief blood-red glow then transform
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
//  THE CROW
// ══════════════════════════════════════════════════════════════

function createCrowSVG() {
  const mobile = isMobile();
  const w = mobile ? 40 : 60;
  const h = mobile ? 30 : 45;
  const el = document.createElement('div');
  el.className = 'dosto-crow';
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.innerHTML = `
    <svg class="crow-svg" viewBox="0 0 60 45" width="${w}" height="${h}">
      <g class="crow-body-group">
        <!-- body -->
        <ellipse cx="30" cy="28" rx="14" ry="10" fill="#0a0a0a"/>
        <!-- head -->
        <circle cx="44" cy="20" r="7" fill="#0e0e0e"/>
        <!-- beak -->
        <polygon class="crow-beak" points="51,19 58,21 51,22" fill="#2a2a2a"/>
        <!-- eye -->
        <circle cx="46" cy="19" r="1.5" fill="#444"/>
        <circle cx="46.3" cy="18.8" r="0.6" fill="#888"/>
        <!-- tail feathers -->
        <path d="M16,28 Q8,26 5,22" stroke="#0a0a0a" stroke-width="3" fill="none"/>
        <path d="M16,30 Q7,30 3,27" stroke="#0a0a0a" stroke-width="2.5" fill="none"/>
        <path d="M16,32 Q9,34 4,32" stroke="#0a0a0a" stroke-width="2" fill="none"/>
        <!-- wing (folded) -->
        <path class="crow-wing" d="M22,20 Q30,12 42,18 Q36,22 22,28Z" fill="#121212"/>
        <!-- legs -->
        <line x1="26" y1="37" x2="24" y2="43" stroke="#1a1a1a" stroke-width="1.2"/>
        <line x1="33" y1="37" x2="35" y2="43" stroke="#1a1a1a" stroke-width="1.2"/>
        <!-- feet -->
        <path d="M22,43 L24,43 L26,42" stroke="#1a1a1a" stroke-width="0.8" fill="none"/>
        <path d="M33,42 L35,43 L37,43" stroke="#1a1a1a" stroke-width="0.8" fill="none"/>
      </g>
    </svg>`;
  el.style.position = 'fixed';
  el.style.zIndex = '150';
  el.style.pointerEvents = 'none';
  return el;
}

function scheduleCrow() {
  if (destroyed) return;
  // First appearance at 15s, then every 45-90s
  const delay = crowEl ? rand(45000, 90000) : 15000;
  crowTimer = setTimeout(() => {
    if (destroyed) return;
    doCrowVisit();
  }, delay);
}

function doCrowVisit() {
  if (destroyed) return;

  // Find a target word
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper) { scheduleCrow(); return; }
  const { wState } = getState();
  const words = [...wrapper.querySelectorAll('.w')].filter(s => {
    const key = `${s.dataset.li}-${s.dataset.wi}`;
    return wState[key] !== 'erased' && s.getBoundingClientRect().width > 0;
  });
  if (!words.length) { scheduleCrow(); return; }
  const target = pick(words);
  const tRect = target.getBoundingClientRect();

  if (!crowEl) {
    crowEl = createCrowSVG();
    document.body.appendChild(crowEl);
  }

  const vw = window.innerWidth;
  const crowW = isMobile() ? 40 : 60;
  const crowH = isMobile() ? 30 : 45;

  // Start from right edge
  const startX = vw + 20;
  const startY = rand(50, 150);
  const endX = tRect.left + tRect.width / 2 - crowW / 2;
  const endY = tRect.top - crowH + 5;

  crowEl.style.left = `${startX}px`;
  crowEl.style.top = `${startY}px`;
  crowEl.style.opacity = '1';
  crowEl.style.display = '';
  // Face left (flying in from right)
  crowEl.style.transform = 'scaleX(-1)';

  // Animate wing during flight
  const wing = crowEl.querySelector('.crow-wing');
  if (wing) wing.classList.add('crow-flying');

  // Flight: gentle arc from right to target word
  const flightDur = 2500;
  const flightStart = performance.now();
  const arcPeakY = Math.min(startY, endY) - rand(40, 80);

  function animateFlight(now) {
    if (destroyed) return;
    const t = Math.min((now - flightStart) / flightDur, 1);
    const e = t; // linear for steady flight
    const cpX = (startX + endX) / 2;
    const cpY = arcPeakY;
    const x = (1 - e) ** 2 * startX + 2 * (1 - e) * e * cpX + e * e * endX;
    const y = (1 - e) ** 2 * startY + 2 * (1 - e) * e * cpY + e * e * endY;
    crowEl.style.left = `${x}px`;
    crowEl.style.top = `${y}px`;

    if (t < 1) requestAnimationFrame(animateFlight);
    else crowLand(target);
  }
  requestAnimationFrame(animateFlight);
}

function crowLand(target) {
  if (destroyed) return;
  const wing = crowEl.querySelector('.crow-wing');
  if (wing) wing.classList.remove('crow-flying');

  // Landing: brief wing spread
  crowEl.classList.add('crow-landing');
  setTimeout(() => {
    if (destroyed) return;
    crowEl.classList.remove('crow-landing');
    // Peck sequence
    crowPeck(target, 0);
  }, 400);
}

function crowPeck(target, count) {
  if (destroyed) return;
  const totalPecks = 4 + Math.floor(Math.random() * 3); // 4-6
  if (count >= totalPecks) {
    // After final peck, burn the word
    crowWatchBurn(target);
    return;
  }

  const beak = crowEl.querySelector('.crow-beak');
  crowEl.classList.add('crow-pecking');
  // Word shudder
  target.style.transform = `translateX(${Math.random() > 0.5 ? 2 : -2}px)`;
  // Tiny spark
  emitSpark(target);

  setTimeout(() => {
    if (destroyed) return;
    crowEl.classList.remove('crow-pecking');
    target.style.transform = '';
    setTimeout(() => crowPeck(target, count + 1), rand(200, 400));
  }, 150);
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

function crowWatchBurn(target) {
  if (destroyed) return;
  // Tilt head (observing)
  crowEl.classList.add('crow-watching');

  // Trigger the burn
  const { wState } = getState();
  const key = `${target.dataset.li}-${target.dataset.wi}`;
  // Mark as erased in state
  wState[key] = 'erased';
  target.classList.add('erased');
  burnWord(target).then(() => {
    updatePoem();
  });

  // Watch for a moment then fly away
  setTimeout(() => {
    if (destroyed) return;
    crowEl.classList.remove('crow-watching');
    crowFlyAway();
  }, 1800);
}

function crowFlyAway() {
  if (destroyed) return;
  // Face left, fly up and off to the left
  crowEl.style.transform = 'scaleX(1)';
  const wing = crowEl.querySelector('.crow-wing');
  if (wing) wing.classList.add('crow-flying');

  const startX = parseFloat(crowEl.style.left);
  const startY = parseFloat(crowEl.style.top);
  const endX = -80;
  const endY = -60;
  const flightDur = 3000;
  const flightStart = performance.now();

  function animateExit(now) {
    if (destroyed) return;
    const t = Math.min((now - flightStart) / flightDur, 1);
    const e = t * t; // ease in — accelerate away
    const x = startX + (endX - startX) * e;
    const y = startY + (endY - startY) * e;
    crowEl.style.left = `${x}px`;
    crowEl.style.top = `${y}px`;

    if (t < 1) requestAnimationFrame(animateExit);
    else {
      crowEl.style.display = 'none';
      if (wing) wing.classList.remove('crow-flying');
      scheduleCrow();
    }
  }
  requestAnimationFrame(animateExit);
}

// ══════════════════════════════════════════════════════════════
//  RAIN
// ══════════════════════════════════════════════════════════════

function startRain() {
  if (isMobile()) return; // disabled on mobile for performance
  rainContainer = document.createElement('div');
  rainContainer.className = 'dosto-rain';
  const workspace = document.getElementById('workspace');
  if (!workspace) return;
  workspace.appendChild(rainContainer);

  // Create 30 rain streaks
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
  if (isMobile()) return; // disabled on mobile
  function doFlicker() {
    if (destroyed) return;
    const wrapper = document.getElementById('article-wrapper');
    if (!wrapper) return;
    const { wState } = getState();
    const words = [...wrapper.querySelectorAll('.w')].filter(s => {
      const key = `${s.dataset.li}-${s.dataset.wi}`;
      return wState[key] !== 'erased';
    });
    if (words.length) {
      const w = pick(words);
      w.classList.add('dosto-flicker');
      w.addEventListener('animationend', () => w.classList.remove('dosto-flicker'), { once: true });
    }
    // Next flicker in 3-5s
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

  // Find all kept words in order
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

  // Store positions for share card
  keptWordPositions = kept.map(s => {
    const r = s.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2 - wrapperRect.left) / wrapperRect.width,
      y: (r.top + r.height / 2 - wrapperRect.top) / wrapperRect.height,
    };
  });
}

/** Get normalized kept-word positions for the share card renderer. */
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
  burnCount = 0;

  startRain();
  startFlicker();
  initRedString();
  scheduleCrow();
}

export function destroyDostoevsky() {
  destroyed = true;
  if (flickerTimer) { clearTimeout(flickerTimer); flickerTimer = null; }
  if (crowTimer) { clearTimeout(crowTimer); crowTimer = null; }
  if (crowEl) { crowEl.remove(); crowEl = null; }
  if (rainContainer) { rainContainer.remove(); rainContainer = null; }
  if (redCanvas) {
    window.removeEventListener('resize', resizeRedCanvas);
    redCanvas.remove();
    redCanvas = null;
    redCtx = null;
  }
  fascismSpans.clear();
  keptWordPositions = [];
  burnCount = 0;
}

/** Called by erasure.js after any erase/keep action to update red strings. */
export function onWordAction() {
  if (getTheme() === 'dostoevsky' && redCtx) {
    drawRedStrings();
  }
}
