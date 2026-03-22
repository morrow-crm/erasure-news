/**
 * Butterfly word transformation — Tolstoy theme only.
 *
 * Floating butterflies drift across the workspace. Clicking one sends it
 * to the nearest visible un-transformed, un-erased word. The word fades
 * out and a beautiful replacement fades in, colored to match the butterfly.
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

const REST_DURATION = 2500;          // ms butterfly sits on word
const FLIGHT_DURATION = 900;         // ms flight to target
const POLLEN_COUNT = 5;

// ── State ──
let butterflies = [];                // active butterfly DOM elements
let transformedSpans = new Set();    // spans already transformed
let container = null;                // #workspace or body

// ── Helpers ──

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomWord() { return pick(TRANSFORM_WORDS); }

/** Create the SVG butterfly element. */
function createButterflyEl(variant) {
  const wrap = document.createElement('div');
  wrap.className = `butterfly ${variant.cls}`;
  wrap.dataset.wordColor = variant.wordColor;
  wrap.innerHTML = `
    <svg class="bf-svg" viewBox="0 0 40 40" width="28" height="28">
      <g class="bf-wings">
        <path class="bf-wing-l" d="M20 20 Q10 8 4 14 Q0 20 8 24 Q14 26 20 20Z"/>
        <path class="bf-wing-r" d="M20 20 Q30 8 36 14 Q40 20 32 24 Q26 26 20 20Z"/>
      </g>
      <ellipse cx="20" cy="22" rx="1.2" ry="4" fill="currentColor" opacity="0.7"/>
    </svg>`;
  // Generous hit area
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
    // Must be visible
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

/** Emit pollen/pixie-dust particles around a span. */
function emitPollen(span, color) {
  const rect = span.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < POLLEN_COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'bf-pollen';
    dot.style.background = color;
    dot.style.left = `${cx + (Math.random() - 0.5) * 20}px`;
    dot.style.top = `${cy + (Math.random() - 0.5) * 10}px`;
    dot.style.setProperty('--dx', `${(Math.random() - 0.5) * 30}px`);
    dot.style.setProperty('--dy', `${-20 - Math.random() * 25}px`);
    document.body.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  }
}

/** Transform a word span — crossfade old text to new beautiful word. */
function transformWord(span, color) {
  const newWord = randomWord();
  transformedSpans.add(span);
  span.dataset.originalWord = span.textContent;
  span.dataset.bfColor = color;

  // Crossfade: fade out old, fade in new
  span.style.transition = 'opacity 0.3s';
  span.style.opacity = '0';
  setTimeout(() => {
    span.textContent = newWord;
    span.style.color = color;
    span.style.opacity = '1';
    span.classList.add('bf-transformed');
    // Tiny colored dot under the word
    const dot = document.createElement('span');
    dot.className = 'bf-word-dot';
    dot.style.background = color;
    span.appendChild(dot);
  }, 300);
}

/** Make a butterfly do a playful spin then resume floating (no target available). */
function spinAway(bf) {
  bf.classList.add('bf-spin');
  bf.addEventListener('animationend', () => {
    bf.classList.remove('bf-spin');
  }, { once: true });
}

// ── Flight animation ──

/** Fly a butterfly from its current position to target span. */
function flyToWord(bf, targetSpan) {
  bf.classList.add('bf-flying');
  bf.classList.remove('bf-floating');

  const bfRect = bf.getBoundingClientRect();
  const targetRect = targetSpan.getBoundingClientRect();
  const startX = bfRect.left + bfRect.width / 2;
  const startY = bfRect.top + bfRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top - 4;

  // Convert to absolute page coords
  const sx = startX + window.scrollX;
  const sy = startY + window.scrollY;
  const ex = endX + window.scrollX;
  const ey = endY + window.scrollY;

  // Curved control point (arc upward)
  const midX = (sx + ex) / 2 + (Math.random() - 0.5) * 80;
  const midY = Math.min(sy, ey) - 40 - Math.random() * 40;

  bf.style.transition = 'none';
  bf.style.position = 'absolute';

  const start = performance.now();
  const color = bf.dataset.wordColor;

  function animate(now) {
    const t = Math.min((now - start) / FLIGHT_DURATION, 1);
    // Ease out
    const e = 1 - (1 - t) * (1 - t);
    // Quadratic bezier
    const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * midX + e * e * ex;
    const y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * midY + e * e * ey;
    bf.style.left = `${x - 14}px`;
    bf.style.top = `${y - 14}px`;

    // Slow wing flap as it approaches
    const flapSpeed = 0.15 + 0.65 * (1 - t);
    bf.style.setProperty('--flap-speed', `${flapSpeed}s`);

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      // Landed
      onLanded(bf, targetSpan, color);
    }
  }
  requestAnimationFrame(animate);
}

/** Called when the butterfly has reached the word. */
function onLanded(bf, span, color) {
  bf.classList.remove('bf-flying');
  bf.classList.add('bf-resting');
  bf.style.setProperty('--flap-speed', '0.8s');

  // Transform the word
  transformWord(span, color);
  emitPollen(span, color);

  // Rest for a few seconds, then lift off
  setTimeout(() => {
    bf.classList.remove('bf-resting');
    bf.classList.add('bf-floating');
    // Re-randomize float position
    randomizePosition(bf);
  }, REST_DURATION);
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

// ── Public API ──

/** Spawn butterflies in the workspace (Tolstoy theme only). */
export function spawnButterflies() {
  destroyButterflies();
  if (getTheme() !== 'tolstoy') return;

  container = document.getElementById('workspace');
  if (!container) return;

  // Spawn fewer on mobile (2-3) vs desktop (4-6)
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  const count = isMobile ? 2 + Math.floor(Math.random() * 2) : 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const variant = BUTTERFLY_VARIANTS[i % BUTTERFLY_VARIANTS.length];
    const bf = createButterflyEl(variant);
    bf.classList.add('bf-floating');
    document.body.appendChild(bf);
    randomizePosition(bf);

    // Stagger animation start
    bf.style.animationDelay = `${Math.random() * 6}s`;

    // Click handler
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

    butterflies.push(bf);
  }
}

/** Remove all butterflies. */
export function destroyButterflies() {
  butterflies.forEach(bf => bf.remove());
  butterflies = [];
  transformedSpans.clear();
  container = null;
}
