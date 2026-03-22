/**
 * Butterfly word transformation — Tolstoy theme only.
 *
 * Features:
 * - Dramatic bouquet entrance: 40-60 butterflies burst from bottom-left
 * - Decelerating word-change rhythm: fast at first, then increasingly rare
 * - Enhanced animations: bloom transform, spiral pollen, resting breath
 * - Responsive sizing: 40px desktop, 30px tablet, 20px mobile
 * - Click-to-transform preserved from original behavior
 */

import { getState } from './erasure.js';
import { getTheme } from './theme.js';

// ── Constants ──

const TRANSFORM_WORDS = [
  'Beautiful','Peaceful','Serene','Tender','Luminous','Gentle','Hopeful',
  'Radiant','Blooming','Alive','Graceful','Wandering','Wondrous','Soft',
  'Glowing','Dreaming','Breathing','Fleeting','Golden','Quiet','Verdant',
  'Blossoming','Warm','Healing','Free','Open','Still','Wild','Pure','Beloved',
];

const BUTTERFLY_VARIANTS = [
  { cls: 'bf-yellow', wordColor: '#c17f24' },
  { cls: 'bf-blue',   wordColor: '#5b8fa8' },
  { cls: 'bf-orange', wordColor: '#c4622d' },
  { cls: 'bf-white',  wordColor: '#6a8f5a' },
  { cls: 'bf-pink',   wordColor: '#b5727a' },
];

const FLIGHT_DURATION = 1200;        // ms flight to target (longer arc)
const POLLEN_COUNT = 9;              // more dramatic pollen burst
const REST_BREATH_CYCLES = 4;        // wing open/close cycles while resting
const REST_BREATH_SPEED = 800;       // ms per breath cycle

// Word-change rhythm: intervals in ms between successive auto-changes
const CHANGE_RHYTHM = [
  2000,   // 1st change: 2s after settle
  2000,   // 2nd change: 2s later
  2000,   // 3rd change: 2s later  (3 quick ones in ~6s)
  8000,   // then 8s
  15000,  // then 15s
  30000,  // then 30s
];
// After exhausting the list, use random 45-90s intervals

// Bouquet entrance config
const BOUQUET_COUNT_DESKTOP = 50;
const BOUQUET_COUNT_MOBILE = 25;
const BOUQUET_FILL_DURATION = 1500;   // ms butterflies fill screen
const BOUQUET_SCATTER_DURATION = 800; // ms scatter outward
const AMBIENT_COUNT_DESKTOP = 7;
const AMBIENT_COUNT_MOBILE = 4;

// ── State ──
let butterflies = [];                // ambient butterfly DOM elements
let allBouquetEls = [];              // all bouquet elements (for cleanup)
let transformedSpans = new Set();    // spans already transformed
let container = null;                // #workspace
let rhythmTimer = null;              // current auto-change timeout
let rhythmIndex = 0;                 // position in CHANGE_RHYTHM
let destroyed = false;               // flag to stop async chains

// ── Helpers ──

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomWord() { return pick(TRANSFORM_WORDS); }
function isMobile() { return window.matchMedia('(pointer: coarse)').matches; }
function isTablet() { return window.matchMedia('(min-width: 601px) and (max-width: 1024px) and (pointer: coarse)').matches; }

/** Get butterfly SVG size based on device. */
function getBfSize() {
  if (isMobile() && !isTablet()) return 20;
  if (isTablet()) return 30;
  return 40;
}

/** Create the SVG butterfly element with responsive size. */
function createButterflyEl(variant, size) {
  size = size || getBfSize();
  const wrap = document.createElement('div');
  wrap.className = `butterfly ${variant.cls}`;
  wrap.dataset.wordColor = variant.wordColor;
  // Size the wrapper to match
  wrap.style.width = `${size + 8}px`;
  wrap.style.height = `${size + 8}px`;
  wrap.innerHTML = `
    <svg class="bf-svg" viewBox="0 0 40 40" width="${size}" height="${size}">
      <g class="bf-wings">
        <path class="bf-wing-l" d="M20 20 Q10 8 4 14 Q0 20 8 24 Q14 26 20 20Z"/>
        <path class="bf-wing-r" d="M20 20 Q30 8 36 14 Q40 20 32 24 Q26 26 20 20Z"/>
        <path class="bf-vein-l" d="M20 20 Q12 14 8 18" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.4"/>
        <path class="bf-vein-r" d="M20 20 Q28 14 32 18" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.4"/>
      </g>
      <ellipse cx="20" cy="22" rx="1.2" ry="4" fill="currentColor" opacity="0.7"/>
    </svg>`;
  wrap.style.cursor = 'pointer';
  return wrap;
}

/** Get all visible, un-erased, un-transformed .w spans in the article wrapper. */
function getAvailableWords() {
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper) return [];
  const { wState } = getState();
  return [...wrapper.querySelectorAll('.w')].filter(span => {
    const key = `${span.dataset.li}-${span.dataset.wi}`;
    if (wState[key] === 'erased') return false;
    if (transformedSpans.has(span)) return false;
    const rect = span.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    return true;
  });
}

/** Find the nearest available word to a point (px coords in viewport). */
function nearestWord(x, y) {
  const words = getAvailableWords();
  if (words.length === 0) return null;
  let best = null, bestDist = Infinity;
  for (const span of words) {
    const r = span.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const d = Math.hypot(cx - x, cy - y);
    if (d < bestDist) { bestDist = d; best = span; }
  }
  return best;
}

/** Pick a random available word anywhere in the article. */
function randomAvailableWord() {
  const words = getAvailableWords();
  if (words.length === 0) return null;
  return pick(words);
}

// ── Pollen burst — enhanced spiral ──

function emitPollen(span, color) {
  const rect = span.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < POLLEN_COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'bf-pollen';
    dot.style.background = color;
    // Spiral outward: each dot gets a different angle
    const angle = (i / POLLEN_COUNT) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 25 + Math.random() * 20;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 15; // bias upward
    dot.style.left = `${cx + (Math.random() - 0.5) * 8}px`;
    dot.style.top = `${cy + (Math.random() - 0.5) * 6}px`;
    dot.style.setProperty('--dx', `${dx}px`);
    dot.style.setProperty('--dy', `${dy}px`);
    // Stagger slightly
    dot.style.animationDelay = `${i * 0.04}s`;
    document.body.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  }
}

// ── Word transformation — bloom effect ──

function transformWord(span, color) {
  const newWord = randomWord();
  transformedSpans.add(span);
  span.dataset.originalWord = span.textContent;
  span.dataset.bfColor = color;

  // Phase 1: shrink and fade old word
  span.style.transition = 'transform 0.35s ease-in, opacity 0.35s ease-in';
  span.style.transform = 'scale(0.3)';
  span.style.opacity = '0';
  span.style.display = 'inline-block'; // needed for transform

  setTimeout(() => {
    // Phase 2: swap text, bloom in new word
    span.textContent = newWord;
    span.style.color = color;
    span.style.transform = 'scale(1.3)';
    span.style.opacity = '0.2';
    span.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out';

    // Force reflow to trigger transition
    void span.offsetWidth;
    span.style.transform = 'scale(1)';
    span.style.opacity = '1';
    span.classList.add('bf-transformed');

    // Colored dot under the word
    const dot = document.createElement('span');
    dot.className = 'bf-word-dot';
    dot.style.background = color;
    span.appendChild(dot);
  }, 350);
}

/** Make a butterfly do a playful spin then resume floating. */
function spinAway(bf) {
  bf.classList.add('bf-spin');
  bf.addEventListener('animationend', () => {
    bf.classList.remove('bf-spin');
  }, { once: true });
}

// ── Flight animation ──

/** Fly a butterfly from its current position to target span via large arc. */
function flyToWord(bf, targetSpan, onComplete) {
  bf.classList.add('bf-flying');
  bf.classList.remove('bf-floating');

  const bfRect = bf.getBoundingClientRect();
  const targetRect = targetSpan.getBoundingClientRect();
  const startX = bfRect.left + bfRect.width / 2;
  const startY = bfRect.top + bfRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top - 4;

  const sx = startX + window.scrollX;
  const sy = startY + window.scrollY;
  const ex = endX + window.scrollX;
  const ey = endY + window.scrollY;

  // Large arc — more dramatic curve
  const dist = Math.hypot(ex - sx, ey - sy);
  const arcHeight = Math.max(60, dist * 0.4);
  const midX = (sx + ex) / 2 + (Math.random() - 0.5) * 120;
  const midY = Math.min(sy, ey) - arcHeight - Math.random() * 40;

  bf.style.transition = 'none';
  bf.style.position = 'absolute';

  const halfSize = getBfSize() / 2 + 4;
  const start = performance.now();
  const color = bf.dataset.wordColor;

  function animate(now) {
    if (destroyed) return;
    const t = Math.min((now - start) / FLIGHT_DURATION, 1);
    const e = 1 - (1 - t) * (1 - t);
    const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * midX + e * e * ex;
    const y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * midY + e * e * ey;
    bf.style.left = `${x - halfSize}px`;
    bf.style.top = `${y - halfSize}px`;

    const flapSpeed = 0.15 + 0.65 * (1 - t);
    bf.style.setProperty('--flap-speed', `${flapSpeed}s`);

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      onLanded(bf, targetSpan, color, onComplete);
    }
  }
  requestAnimationFrame(animate);
}

/** Called when the butterfly has reached the word. */
function onLanded(bf, span, color, onComplete) {
  bf.classList.remove('bf-flying');
  bf.classList.add('bf-resting');

  // Slow breathing wing flap
  bf.style.setProperty('--flap-speed', `${REST_BREATH_SPEED / 1000}s`);

  // Transform the word and burst pollen
  transformWord(span, color);
  emitPollen(span, color);

  // Rest for breath cycles, then lift off
  const restTime = REST_BREATH_CYCLES * REST_BREATH_SPEED;
  setTimeout(() => {
    if (destroyed) return;
    bf.classList.remove('bf-resting');
    bf.classList.add('bf-floating');
    randomizePosition(bf);
    if (onComplete) onComplete();
  }, restTime);
}

/** Place butterfly at a random position within the workspace. */
function randomizePosition(bf) {
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper) return;
  const rect = wrapper.getBoundingClientRect();
  const x = rect.left + Math.random() * rect.width + window.scrollX;
  const y = rect.top + Math.random() * rect.height * 0.6 + window.scrollY;
  bf.style.position = 'absolute';
  bf.style.left = `${x}px`;
  bf.style.top = `${y}px`;
  bf.style.transition = '';
}

/** Attach click handler to an ambient butterfly. */
function attachClickHandler(bf) {
  bf.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (bf.classList.contains('bf-flying') || bf.classList.contains('bf-resting')) return;

    const bfRect = bf.getBoundingClientRect();
    const bx = bfRect.left + bfRect.width / 2;
    const by = bfRect.top + bfRect.height / 2;
    const target = nearestWord(bx, by);
    if (target) {
      flyToWord(bf, target);
    } else {
      spinAway(bf);
    }
  });
}

// ── Word-change rhythm system ──

/** Get next auto-change interval. */
function getNextInterval() {
  if (rhythmIndex < CHANGE_RHYTHM.length) {
    return CHANGE_RHYTHM[rhythmIndex++];
  }
  // Random 45-90s
  return 45000 + Math.random() * 45000;
}

/** Schedule the next automatic word change. */
function scheduleNextChange() {
  if (destroyed) return;
  const interval = getNextInterval();
  rhythmTimer = setTimeout(() => {
    if (destroyed) return;
    performAutoChange();
  }, interval);
}

/** Pick an idle ambient butterfly and send it to a random word. */
function performAutoChange() {
  if (destroyed) return;

  const target = randomAvailableWord();
  if (!target) {
    // No words available, try again later
    scheduleNextChange();
    return;
  }

  // Find an idle butterfly — rotate through them
  const idle = butterflies.filter(bf =>
    !bf.classList.contains('bf-flying') && !bf.classList.contains('bf-resting')
  );
  if (idle.length === 0) {
    // All busy, retry shortly
    rhythmTimer = setTimeout(() => performAutoChange(), 2000);
    return;
  }

  // Rotate: pick the one that hasn't been used recently (use data attr)
  idle.sort((a, b) => (parseInt(a.dataset.lastUsed || '0') - parseInt(b.dataset.lastUsed || '0')));
  const bf = idle[0];
  bf.dataset.lastUsed = Date.now().toString();

  flyToWord(bf, target, () => {
    scheduleNextChange();
  });
}

// ── Bouquet entrance animation ──

function playBouquetEntrance(onSettled) {
  const mobile = isMobile();
  const bouquetCount = mobile ? BOUQUET_COUNT_MOBILE : BOUQUET_COUNT_DESKTOP;
  const size = getBfSize();

  // Origin: bottom-left corner of viewport
  const originX = window.scrollX + 40;
  const originY = window.scrollY + window.innerHeight + 20;

  const bouquetEls = [];

  // Create all bouquet butterflies
  for (let i = 0; i < bouquetCount; i++) {
    const variant = BUTTERFLY_VARIANTS[i % BUTTERFLY_VARIANTS.length];
    const bf = createButterflyEl(variant, size);
    bf.classList.add('bf-bouquet');
    bf.style.position = 'absolute';
    bf.style.left = `${originX + (Math.random() - 0.5) * 30}px`;
    bf.style.top = `${originY}px`;
    bf.style.pointerEvents = 'none';
    bf.style.opacity = '0.9';
    bf.style.setProperty('--flap-speed', `${0.12 + Math.random() * 0.1}s`);
    // Random animation delay for staggered drift feel
    bf.style.animationDelay = `${Math.random() * 0.3}s`;
    document.body.appendChild(bf);
    bouquetEls.push(bf);
    allBouquetEls.push(bf);
  }

  // Phase 1: Burst upward — fill screen (1.5s)
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const targets = bouquetEls.map(() => ({
    x: window.scrollX + Math.random() * vw,
    y: window.scrollY + 30 + Math.random() * (vh - 60),
  }));

  const burstStart = performance.now();

  function animateBurst(now) {
    if (destroyed) { cleanupBouquet(bouquetEls); return; }
    const t = Math.min((now - burstStart) / BOUQUET_FILL_DURATION, 1);
    // Ease out cubic for organic deceleration
    const e = 1 - Math.pow(1 - t, 3);

    for (let i = 0; i < bouquetEls.length; i++) {
      const bf = bouquetEls[i];
      const tx = targets[i].x;
      const ty = targets[i].y;
      // Each butterfly has a slight individual timing offset
      const it = Math.min(1, e + (Math.random() * 0.02 - 0.01));
      // Curved upward path from origin
      const midX = originX + (tx - originX) * 0.3 + (Math.random() - 0.5) * 40;
      const midY = originY - vh * 0.7 * it;
      const x = (1 - it) * (1 - it) * originX + 2 * (1 - it) * it * midX + it * it * tx;
      const y = (1 - it) * (1 - it) * originY + 2 * (1 - it) * it * midY + it * it * ty;
      bf.style.left = `${x - size / 2}px`;
      bf.style.top = `${y - size / 2}px`;
    }

    if (t < 1) {
      requestAnimationFrame(animateBurst);
    } else {
      // Phase 2: Hold briefly then scatter
      setTimeout(() => {
        if (destroyed) { cleanupBouquet(bouquetEls); return; }
        scatterBouquet(bouquetEls, targets, onSettled);
      }, 200);
    }
  }
  requestAnimationFrame(animateBurst);
}

/** Phase 2: Scatter bouquet butterflies outward off screen. Keep some as ambient. */
function scatterBouquet(bouquetEls, positions, onSettled) {
  const ambientCount = isMobile() ? AMBIENT_COUNT_MOBILE : AMBIENT_COUNT_DESKTOP;

  // Pick which ones stay as ambient (spread across variants)
  const keepIndices = new Set();
  const shuffled = [...Array(bouquetEls.length).keys()].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(ambientCount, shuffled.length); i++) {
    keepIndices.add(shuffled[i]);
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scatterStart = performance.now();

  // Compute scatter destinations (off screen in all directions)
  const scatterTargets = bouquetEls.map((bf, i) => {
    if (keepIndices.has(i)) return null; // stays
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(vw, vh) * 0.8 + Math.random() * 200;
    return {
      x: positions[i].x + Math.cos(angle) * dist,
      y: positions[i].y + Math.sin(angle) * dist,
    };
  });

  function animateScatter(now) {
    if (destroyed) { cleanupBouquet(bouquetEls); return; }
    const t = Math.min((now - scatterStart) / BOUQUET_SCATTER_DURATION, 1);
    // Ease in — start slow, accelerate away like birds scattering
    const e = t * t * t;

    for (let i = 0; i < bouquetEls.length; i++) {
      if (keepIndices.has(i)) continue; // ambient ones stay put
      const bf = bouquetEls[i];
      const sx = positions[i].x;
      const sy = positions[i].y;
      const ex = scatterTargets[i].x;
      const ey = scatterTargets[i].y;
      const x = sx + (ex - sx) * e;
      const y = sy + (ey - sy) * e;
      bf.style.left = `${x}px`;
      bf.style.top = `${y}px`;
      bf.style.opacity = `${1 - e}`;
    }

    if (t < 1) {
      requestAnimationFrame(animateScatter);
    } else {
      // Cleanup scattered butterflies, promote kept ones to ambient
      for (let i = 0; i < bouquetEls.length; i++) {
        const bf = bouquetEls[i];
        if (keepIndices.has(i)) {
          // Promote to ambient floating butterfly
          bf.classList.remove('bf-bouquet');
          bf.classList.add('bf-floating');
          bf.style.pointerEvents = 'auto';
          bf.style.opacity = '';
          bf.style.animationDelay = `${Math.random() * 6}s`;
          attachClickHandler(bf);
          butterflies.push(bf);
        } else {
          bf.remove();
        }
      }
      // Clear bouquet tracking for removed elements
      allBouquetEls = allBouquetEls.filter(el => document.body.contains(el));

      if (onSettled) onSettled();
    }
  }
  requestAnimationFrame(animateScatter);
}

/** Emergency cleanup of bouquet elements. */
function cleanupBouquet(els) {
  els.forEach(el => el.remove());
}

// ── Public API ──

/** Spawn butterflies in the workspace (Tolstoy theme only). */
export function spawnButterflies() {
  destroyButterflies();
  if (getTheme() !== 'tolstoy') return;

  container = document.getElementById('workspace');
  if (!container) return;
  destroyed = false;

  // Play the bouquet entrance, then start the rhythm
  playBouquetEntrance(() => {
    if (destroyed) return;
    // Start the word-change rhythm after settling
    rhythmIndex = 0;
    scheduleNextChange();
  });
}

/** Remove all butterflies and stop rhythm. */
export function destroyButterflies() {
  destroyed = true;
  if (rhythmTimer) { clearTimeout(rhythmTimer); rhythmTimer = null; }
  butterflies.forEach(bf => bf.remove());
  allBouquetEls.forEach(bf => { if (bf.parentNode) bf.remove(); });
  butterflies = [];
  allBouquetEls = [];
  transformedSpans.clear();
  container = null;
  rhythmIndex = 0;
}
