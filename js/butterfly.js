/**
 * Butterfly word transformation — Tolstoy theme only.
 *
 * Dramatic bouquet entrance (80-120 butterflies burst from bottom-left viewport),
 * slow organic dispersal (6-8s), 4 size classes, decelerating word-change rhythm,
 * bloom word transform with spiral pollen, breathing rest on words.
 *
 * All entrance butterflies use position:fixed (viewport-relative).
 * Ambient butterflies switch to position:absolute for word-landing.
 */

import { getState } from './erasure.js';
import { getTheme } from './theme.js';

// ── Beautiful replacement words ──

const TRANSFORM_WORDS = [
  'Beautiful','Peaceful','Serene','Tender','Luminous','Gentle','Hopeful',
  'Radiant','Blooming','Alive','Graceful','Wandering','Wondrous','Soft',
  'Glowing','Dreaming','Breathing','Fleeting','Golden','Quiet','Verdant',
  'Blossoming','Warm','Healing','Free','Open','Still','Wild','Pure','Beloved',
];

// ── Color variants ──

const BUTTERFLY_VARIANTS = [
  { cls: 'bf-yellow', wordColor: '#c17f24' },
  { cls: 'bf-blue',   wordColor: '#5b8fa8' },
  { cls: 'bf-orange', wordColor: '#c4622d' },
  { cls: 'bf-white',  wordColor: '#6a8f5a' },
  { cls: 'bf-pink',   wordColor: '#b5727a' },
];

// ── Size classes ──
// Distribution: 30% small, 40% medium, 20% large, 10% xl
const SIZE_CLASSES_DESKTOP = [
  { size: 20,  flapBase: 0.12, driftSpeed: 1.4, cls: 'bf-sm'  },  // small — fast, darty
  { size: 35,  flapBase: 0.20, driftSpeed: 1.0, cls: 'bf-md'  },  // medium
  { size: 55,  flapBase: 0.30, driftSpeed: 0.7, cls: 'bf-lg'  },  // large — slower, deliberate
  { size: 75,  flapBase: 0.40, driftSpeed: 0.5, cls: 'bf-xl'  },  // xl — majestic
];
const SIZE_CLASSES_MOBILE = [
  { size: 12,  flapBase: 0.10, driftSpeed: 1.4, cls: 'bf-sm'  },
  { size: 20,  flapBase: 0.18, driftSpeed: 1.0, cls: 'bf-md'  },
  { size: 30,  flapBase: 0.28, driftSpeed: 0.7, cls: 'bf-lg'  },
  { size: 45,  flapBase: 0.38, driftSpeed: 0.5, cls: 'bf-xl'  },
];

function pickSizeClass() {
  const classes = isMobile() ? SIZE_CLASSES_MOBILE : SIZE_CLASSES_DESKTOP;
  const r = Math.random();
  if (r < 0.30) return classes[0];       // 30% small
  if (r < 0.70) return classes[1];       // 40% medium
  if (r < 0.90) return classes[2];       // 20% large
  return classes[3];                      // 10% xl
}

// ── Timing constants ──

const FLIGHT_DURATION = 1200;
const POLLEN_COUNT = 9;
const REST_BREATH_CYCLES = 3;
const REST_BREATH_SPEED = 900;

// Word-change rhythm (ms between successive auto-changes)
const CHANGE_RHYTHM = [2000, 2000, 2000, 8000, 15000, 30000];

// Bouquet entrance config
const BOUQUET_DESKTOP = 100;    // 80-120 → use 100
const BOUQUET_MOBILE  = 50;     // 40-60  → use 50
const BURST_DURATION  = 1500;   // 1.5s burst up
const LINGER_DURATION = 2000;   // 2s linger full-screen
const DISPERSE_DURATION = 7000; // 7s slow organic dispersal
const AMBIENT_DESKTOP = 7;
const AMBIENT_MOBILE  = 5;

// ── State ──
let ambientBFs = [];
let allEls = [];
let transformedSpans = new Set();
let container = null;
let rhythmTimer = null;
let rhythmIndex = 0;
let destroyed = false;

// ── Helpers ──

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomWord() { return pick(TRANSFORM_WORDS); }
function isMobile() { return window.matchMedia('(pointer: coarse)').matches; }
function rand(lo, hi) { return lo + Math.random() * (hi - lo); }

// ── SVG creation ──

/** More detailed wing SVG for larger butterflies. */
function createButterflyEl(variant, sizeClass) {
  const { size, flapBase, cls: sizeCls } = sizeClass;
  const wrap = document.createElement('div');
  wrap.className = `butterfly ${variant.cls} ${sizeCls}`;
  wrap.dataset.wordColor = variant.wordColor;
  wrap.dataset.size = size;
  wrap.dataset.flapBase = flapBase;
  wrap.style.width = `${size + 8}px`;
  wrap.style.height = `${size + 8}px`;

  // Larger butterflies get extra wing detail
  const detail = size >= 45 ? `
    <path class="bf-vein" d="M20 20 Q14 12 8 16" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
    <path class="bf-vein" d="M20 20 Q26 12 32 16" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
    <path class="bf-vein" d="M20 20 Q12 16 6 20" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="0.3"/>
    <path class="bf-vein" d="M20 20 Q28 16 34 20" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="0.3"/>
    <circle cx="10" cy="14" r="2" fill="rgba(255,255,255,0.15)"/>
    <circle cx="30" cy="14" r="2" fill="rgba(255,255,255,0.15)"/>` : `
    <path class="bf-vein" d="M20 20 Q12 14 8 18" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.4"/>
    <path class="bf-vein" d="M20 20 Q28 14 32 18" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.4"/>`;

  wrap.innerHTML = `
    <svg class="bf-svg" viewBox="0 0 40 40" width="${size}" height="${size}">
      <g class="bf-wings">
        <path class="bf-wing-l" d="M20 20 Q10 6 3 12 Q-1 20 7 25 Q14 27 20 20Z"/>
        <path class="bf-wing-r" d="M20 20 Q30 6 37 12 Q41 20 33 25 Q26 27 20 20Z"/>
        <path class="bf-lwing-l" d="M20 20 Q14 24 10 28 Q8 32 14 30 Q18 28 20 20Z" opacity="0.7"/>
        <path class="bf-lwing-r" d="M20 20 Q26 24 30 28 Q32 32 26 30 Q22 28 20 20Z" opacity="0.7"/>
        ${detail}
      </g>
      <ellipse cx="20" cy="21" rx="1" ry="5" fill="currentColor" opacity="0.7"/>
      <line x1="18.5" y1="16" x2="14" y2="8" stroke="currentColor" stroke-width="0.5" opacity="0.5"/>
      <line x1="21.5" y1="16" x2="26" y2="8" stroke="currentColor" stroke-width="0.5" opacity="0.5"/>
    </svg>`;
  wrap.style.cursor = 'pointer';

  // Random flap phase offset so wings don't sync
  const offset = Math.random() * -2;
  const wings = wrap.querySelector('.bf-wings');
  if (wings) wings.style.animationDelay = `${offset}s`;

  // Set base flap speed
  wrap.style.setProperty('--flap-speed', `${flapBase}s`);

  return wrap;
}

// ── Available words ──

function getAvailableWords() {
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper) return [];
  const { wState } = getState();
  return [...wrapper.querySelectorAll('.w')].filter(span => {
    const key = `${span.dataset.li}-${span.dataset.wi}`;
    if (wState[key] === 'erased') return false;
    if (transformedSpans.has(span)) return false;
    const rect = span.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

function nearestWord(x, y) {
  const words = getAvailableWords();
  if (!words.length) return null;
  let best = null, bestD = Infinity;
  for (const s of words) {
    const r = s.getBoundingClientRect();
    const d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}

function randomAvailableWord() {
  const words = getAvailableWords();
  return words.length ? pick(words) : null;
}

// ── Pollen burst (spiral) ──

function emitPollen(span, color) {
  const rect = span.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < POLLEN_COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'bf-pollen';
    dot.style.background = color;
    const angle = (i / POLLEN_COUNT) * Math.PI * 2 + rand(-0.3, 0.3);
    const dist = rand(22, 40);
    dot.style.left = `${cx + rand(-6, 6)}px`;
    dot.style.top = `${cy + rand(-4, 4)}px`;
    dot.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    dot.style.setProperty('--dy', `${Math.sin(angle) * dist - 15}px`);
    dot.style.animationDelay = `${i * 0.04}s`;
    document.body.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  }
}

// ── Word transformation (bloom) ──

function transformWord(span, color) {
  const newWord = randomWord();
  transformedSpans.add(span);
  span.dataset.originalWord = span.textContent;
  span.dataset.bfColor = color;

  span.style.display = 'inline-block';
  span.style.transition = 'transform 0.35s ease-in, opacity 0.35s ease-in';
  span.style.transform = 'scale(0.3)';
  span.style.opacity = '0';

  setTimeout(() => {
    span.textContent = newWord;
    span.style.color = color;
    span.style.transform = 'scale(1.3)';
    span.style.opacity = '0.2';
    span.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease-out';
    void span.offsetWidth;
    span.style.transform = 'scale(1)';
    span.style.opacity = '1';
    span.classList.add('bf-transformed');
    const dot = document.createElement('span');
    dot.className = 'bf-word-dot';
    dot.style.background = color;
    span.appendChild(dot);
  }, 350);
}

function spinAway(bf) {
  bf.classList.add('bf-spin');
  bf.addEventListener('animationend', () => bf.classList.remove('bf-spin'), { once: true });
}

// ── Flight to word (large arc, absolute positioning) ──

function flyToWord(bf, targetSpan, onComplete) {
  bf.classList.add('bf-flying');
  bf.classList.remove('bf-floating');

  const bfRect = bf.getBoundingClientRect();
  const tRect = targetSpan.getBoundingClientRect();
  const sx = bfRect.left + bfRect.width / 2 + window.scrollX;
  const sy = bfRect.top + bfRect.height / 2 + window.scrollY;
  const ex = tRect.left + tRect.width / 2 + window.scrollX;
  const ey = tRect.top - 4 + window.scrollY;

  const dist = Math.hypot(ex - sx, ey - sy);
  const arcH = Math.max(60, dist * 0.4);
  const midX = (sx + ex) / 2 + rand(-120, 120);
  const midY = Math.min(sy, ey) - arcH - rand(20, 60);

  bf.style.transition = 'none';
  bf.style.position = 'absolute';

  const halfW = (parseInt(bf.dataset.size) || 35) / 2 + 4;
  const color = bf.dataset.wordColor;
  const flapBase = parseFloat(bf.dataset.flapBase) || 0.2;
  const start = performance.now();

  function animate(now) {
    if (destroyed) return;
    const t = Math.min((now - start) / FLIGHT_DURATION, 1);
    const e = 1 - (1 - t) * (1 - t);
    const x = (1 - e) ** 2 * sx + 2 * (1 - e) * e * midX + e * e * ex;
    const y = (1 - e) ** 2 * sy + 2 * (1 - e) * e * midY + e * e * ey;
    bf.style.left = `${x - halfW}px`;
    bf.style.top = `${y - halfW}px`;
    bf.style.setProperty('--flap-speed', `${flapBase + (0.6 * t)}s`);

    if (t < 1) requestAnimationFrame(animate);
    else onLanded(bf, targetSpan, color, onComplete);
  }
  requestAnimationFrame(animate);
}

function onLanded(bf, span, color, onComplete) {
  bf.classList.remove('bf-flying');
  bf.classList.add('bf-resting');
  bf.style.setProperty('--flap-speed', `${REST_BREATH_SPEED / 1000}s`);

  transformWord(span, color);
  emitPollen(span, color);

  setTimeout(() => {
    if (destroyed) return;
    bf.classList.remove('bf-resting');
    bf.classList.add('bf-floating');
    randomizePosition(bf);
    if (onComplete) onComplete();
  }, REST_BREATH_CYCLES * REST_BREATH_SPEED);
}

function randomizePosition(bf) {
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper) return;
  const rect = wrapper.getBoundingClientRect();
  bf.style.position = 'absolute';
  bf.style.left = `${rect.left + Math.random() * rect.width + window.scrollX}px`;
  bf.style.top = `${rect.top + Math.random() * rect.height * 0.6 + window.scrollY}px`;
  bf.style.transition = '';
}

function attachClickHandler(bf) {
  bf.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (bf.classList.contains('bf-flying') || bf.classList.contains('bf-resting')) return;
    const r = bf.getBoundingClientRect();
    const target = nearestWord(r.left + r.width / 2, r.top + r.height / 2);
    if (target) flyToWord(bf, target);
    else spinAway(bf);
  });
}

// ── Word-change rhythm ──

function getNextInterval() {
  if (rhythmIndex < CHANGE_RHYTHM.length) return CHANGE_RHYTHM[rhythmIndex++];
  return rand(45000, 90000);
}

function scheduleNextChange() {
  if (destroyed) return;
  rhythmTimer = setTimeout(() => {
    if (destroyed) return;
    performAutoChange();
  }, getNextInterval());
}

function performAutoChange() {
  if (destroyed) return;
  const target = randomAvailableWord();
  if (!target) { scheduleNextChange(); return; }

  const idle = ambientBFs.filter(bf =>
    !bf.classList.contains('bf-flying') && !bf.classList.contains('bf-resting')
  );
  if (!idle.length) {
    rhythmTimer = setTimeout(() => performAutoChange(), 2000);
    return;
  }
  idle.sort((a, b) => (parseInt(a.dataset.lastUsed || '0') - parseInt(b.dataset.lastUsed || '0')));
  const bf = idle[0];
  bf.dataset.lastUsed = Date.now().toString();
  flyToWord(bf, target, () => scheduleNextChange());
}

// ══════════════════════════════════════════════════════════════
//  BOUQUET ENTRANCE — viewport-fixed, organic, dramatic
// ══════════════════════════════════════════════════════════════

function playBouquetEntrance(onSettled) {
  const mobile = isMobile();
  const count = mobile ? BOUQUET_MOBILE : BOUQUET_DESKTOP;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const ambientCount = mobile ? AMBIENT_MOBILE : AMBIENT_DESKTOP;

  // ── Create all butterflies (position: fixed, viewport coords) ──
  const flock = [];
  for (let i = 0; i < count; i++) {
    const variant = BUTTERFLY_VARIANTS[i % BUTTERFLY_VARIANTS.length];
    const sc = pickSizeClass();
    const bf = createButterflyEl(variant, sc);
    bf.classList.add('bf-bouquet');
    bf.style.position = 'fixed';
    bf.style.pointerEvents = 'none';
    bf.style.opacity = '0';

    // Start in bottom-left quadrant cluster
    bf.style.left = `${rand(-20, vw * 0.25)}px`;
    bf.style.top = `${vh + rand(10, 60)}px`;

    document.body.appendChild(bf);
    flock.push({
      el: bf,
      sc,
      // Each butterfly's fill-screen target (viewport coords)
      fillX: rand(10, vw - 10),
      fillY: rand(10, vh - 10),
      // Individual timing offset for organic feel
      delay: rand(0, 0.4),
      // Per-butterfly drift personality during linger
      wanderAngle: rand(0, Math.PI * 2),
      wanderSpeed: rand(0.3, 1.2) / sc.driftSpeed,
      // Dispersal properties
      disperseAngle: 0,
      disperseSpeed: 0,
      disperseDelay: 0,
    });
    allEls.push(bf);
  }

  // ── Pick which become ambient ──
  const shuffled = [...Array(count).keys()].sort(() => Math.random() - 0.5);
  const keepSet = new Set();
  // Prefer medium-sized for ambient (they look best floating)
  const mediums = shuffled.filter(i => flock[i].sc.size >= 20 && flock[i].sc.size <= 40);
  const others = shuffled.filter(i => !mediums.includes(i));
  const ordered = [...mediums, ...others];
  for (let i = 0; i < Math.min(ambientCount, ordered.length); i++) {
    keepSet.add(ordered[i]);
  }

  // ── Pre-compute dispersal for non-ambient butterflies ──
  // Stagger: some leave early, some linger. Last 15% leave last.
  const leavers = [];
  for (let i = 0; i < count; i++) {
    if (!keepSet.has(i)) leavers.push(i);
  }
  // Shuffle leavers for random departure order
  leavers.sort(() => Math.random() - 0.5);
  leavers.forEach((idx, order) => {
    const f = flock[idx];
    f.disperseAngle = rand(0, Math.PI * 2);
    // Speed varies: some fast, some very slow
    f.disperseSpeed = rand(0.3, 1.5);
    // Stagger delay: early ones leave quickly, last ones linger longest
    const fraction = order / leavers.length;
    // First 50% depart in first 30% of time, last 15% use last 40% of time
    if (fraction < 0.5) f.disperseDelay = fraction * 0.3;
    else if (fraction < 0.85) f.disperseDelay = 0.15 + (fraction - 0.5) * 0.85;
    else f.disperseDelay = 0.45 + (fraction - 0.85) * 3.7; // last ones linger 0.45-1.0
  });

  // ══ PHASE 1: Burst upward (1.5s) ══
  const burstStart = performance.now();

  function animateBurst(now) {
    if (destroyed) { cleanup(flock); return; }
    const elapsed = now - burstStart;
    const tGlobal = Math.min(elapsed / BURST_DURATION, 1);

    for (let i = 0; i < flock.length; i++) {
      const f = flock[i];
      const bf = f.el;
      // Per-butterfly timing with individual delay
      const t = Math.max(0, Math.min(1, (tGlobal - f.delay * 0.5) / (1 - f.delay * 0.5)));
      // Ease out cubic
      const e = 1 - Math.pow(1 - t, 3);

      // Origin in bottom-left quadrant
      const ox = rand(-10, vw * 0.2);
      const oy = vh + 20;
      // Curved bezier upward
      const cpX = ox + (f.fillX - ox) * 0.3 + rand(-30, 30);
      const cpY = oy - vh * 0.8;
      const x = (1 - e) ** 2 * ox + 2 * (1 - e) * e * cpX + e * e * f.fillX;
      const y = (1 - e) ** 2 * oy + 2 * (1 - e) * e * cpY + e * e * f.fillY;

      bf.style.left = `${x}px`;
      bf.style.top = `${y}px`;
      bf.style.opacity = `${Math.min(1, e * 2.5)}`;
    }

    if (tGlobal < 1) requestAnimationFrame(animateBurst);
    else startLinger(flock, keepSet, onSettled);
  }
  requestAnimationFrame(animateBurst);
}

// ══ PHASE 2: Linger — butterflies mill about for 2s ══
function startLinger(flock, keepSet, onSettled) {
  if (destroyed) { cleanup(flock); return; }
  const lingerStart = performance.now();

  function animateLinger(now) {
    if (destroyed) { cleanup(flock); return; }
    const elapsed = now - lingerStart;

    // Gentle wandering movement for each butterfly
    for (const f of flock) {
      const bf = f.el;
      const phase = elapsed * 0.001 * f.wanderSpeed;
      const dx = Math.sin(f.wanderAngle + phase) * 15;
      const dy = Math.cos(f.wanderAngle * 1.3 + phase * 0.7) * 10;
      const baseX = parseFloat(bf.style.left) || f.fillX;
      const baseY = parseFloat(bf.style.top) || f.fillY;
      // Small gentle offset (don't accumulate — apply from fill position)
      bf.style.left = `${f.fillX + dx}px`;
      bf.style.top = `${f.fillY + dy}px`;
    }

    if (elapsed < LINGER_DURATION) requestAnimationFrame(animateLinger);
    else startDispersal(flock, keepSet, onSettled);
  }
  requestAnimationFrame(animateLinger);
}

// ══ PHASE 3: Slow organic dispersal (6-8s) ══
function startDispersal(flock, keepSet, onSettled) {
  if (destroyed) { cleanup(flock); return; }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const disperseStart = performance.now();

  // Snapshot current positions as dispersal start points
  for (const f of flock) {
    f.disperseStartX = parseFloat(f.el.style.left) || f.fillX;
    f.disperseStartY = parseFloat(f.el.style.top) || f.fillY;
  }

  function animateDisperse(now) {
    if (destroyed) { cleanup(flock); return; }
    const elapsed = now - disperseStart;
    const tGlobal = Math.min(elapsed / DISPERSE_DURATION, 1);
    let allGone = true;

    for (let i = 0; i < flock.length; i++) {
      if (keepSet.has(i)) continue; // ambient ones handled separately
      const f = flock[i];
      const bf = f.el;

      // Per-butterfly timing based on staggered delay
      const t = Math.max(0, (tGlobal - f.disperseDelay) / (1 - f.disperseDelay));
      if (t <= 0) { allGone = false; continue; }
      if (t >= 1) {
        bf.style.opacity = '0';
        continue;
      }
      allGone = false;

      // Organic curved exit path — not a straight line
      // Ease: start slow, middle fast, end slow (sine curve)
      const e = 0.5 - 0.5 * Math.cos(t * Math.PI);
      // Base exit direction with wandering
      const wobble = Math.sin(t * 4 + f.wanderAngle) * 20 * (1 - t);
      const exitDist = (Math.max(vw, vh) * 0.9 + 200) * f.disperseSpeed;
      const dx = Math.cos(f.disperseAngle) * exitDist * e + wobble;
      const dy = Math.sin(f.disperseAngle) * exitDist * e + wobble * 0.7;

      bf.style.left = `${f.disperseStartX + dx}px`;
      bf.style.top = `${f.disperseStartY + dy}px`;
      // Fade out in last 40% of individual journey
      bf.style.opacity = `${t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4}`;
    }

    if (tGlobal < 1 && !allGone) {
      requestAnimationFrame(animateDisperse);
    } else {
      finalizeEntrance(flock, keepSet, onSettled);
    }
  }
  requestAnimationFrame(animateDisperse);
}

// ══ PHASE 4: Promote ambient butterflies, clean up rest ══
function finalizeEntrance(flock, keepSet, onSettled) {
  for (let i = 0; i < flock.length; i++) {
    const bf = flock[i].el;
    if (keepSet.has(i)) {
      // Switch from fixed to absolute for word-landing behavior
      const rect = bf.getBoundingClientRect();
      bf.style.position = 'absolute';
      bf.style.left = `${rect.left + window.scrollX}px`;
      bf.style.top = `${rect.top + window.scrollY}px`;
      bf.classList.remove('bf-bouquet');
      bf.classList.add('bf-floating');
      bf.style.pointerEvents = 'auto';
      bf.style.opacity = '';
      bf.style.animationDelay = `${rand(0, 8)}s`;
      attachClickHandler(bf);
      ambientBFs.push(bf);
    } else {
      bf.remove();
    }
  }
  allEls = allEls.filter(el => document.body.contains(el));
  if (onSettled) onSettled();
}

function cleanup(flock) {
  flock.forEach(f => f.el.remove());
}

// ══════════════════════════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════════════════════════

export function spawnButterflies() {
  destroyButterflies();
  if (getTheme() !== 'tolstoy') return;

  container = document.getElementById('workspace');
  if (!container) return;
  destroyed = false;

  playBouquetEntrance(() => {
    if (destroyed) return;
    rhythmIndex = 0;
    scheduleNextChange();
  });
}

export function destroyButterflies() {
  destroyed = true;
  if (rhythmTimer) { clearTimeout(rhythmTimer); rhythmTimer = null; }
  ambientBFs.forEach(bf => bf.remove());
  allEls.forEach(bf => { if (bf.parentNode) bf.remove(); });
  ambientBFs = [];
  allEls = [];
  transformedSpans.clear();
  container = null;
  rhythmIndex = 0;
}
