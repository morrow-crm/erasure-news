import { getState } from './erasure.js';
import { updatePoem } from './poem.js';
import { getTheme } from './theme.js';
import { disintegrateWord, onWordAction } from './dostoevsky.js';

/**
 * Burroughs cut-up techniques for erasure poetry.
 * Technique 1: The Cut-Up — diagonal slash erases one side
 * Technique 2: The Fold-In — interleaved columns, erase every other word
 */

// ── Helpers ──

/** Get the article wrapper element. */
function getWrapper() {
  return document.getElementById('article-wrapper');
}

/** Get all visible (non-erased) word spans across all columns. */
function getVisibleWords() {
  const { layers, wState } = getState();
  const words = [];
  layers.forEach((_, li) => {
    const col = document.getElementById(`al-${li}`);
    if (!col) return;
    col.querySelectorAll('.w').forEach(span => {
      const key = `${li}-${span.dataset.wi}`;
      if (wState[key] !== 'erased') {
        words.push({ span, li, wi: parseInt(span.dataset.wi), key });
      }
    });
  });
  return words;
}

/** Get visible words grouped by column (layer index). */
function getVisibleWordsByColumn() {
  const { layers, wState } = getState();
  const columns = [];
  layers.forEach((_, li) => {
    const col = document.getElementById(`al-${li}`);
    if (!col) return;
    const colWords = [];
    col.querySelectorAll('.w').forEach(span => {
      const key = `${li}-${span.dataset.wi}`;
      if (wState[key] !== 'erased') {
        colWords.push({ span, li, wi: parseInt(span.dataset.wi), key });
      }
    });
    columns.push(colWords);
  });
  return columns;
}

/** Erase a word in state (no animation). */
function eraseInState(word) {
  const { wState } = getState();
  const prev = wState[word.key] || null;
  wState[word.key] = 'erased';
  return { key: word.key, prev };
}

/** Push a batch undo entry onto the stack. */
function pushBatchUndo(entries) {
  const { undoStack } = getState();
  undoStack.push({ batch: entries });
}

/** Apply the erased CSS class (non-Dostoevsky). */
function applyErasedClass(span) {
  span.classList.remove('kept');
  span.classList.add('erased');
}

// ── Technique 1: The Cut-Up ──

async function doCutUp() {
  console.log('Burroughs: Cut-Up');
  const wrapper = getWrapper();
  if (!wrapper) return;

  const visibleWords = getVisibleWords();
  if (visibleWords.length === 0) return;

  const wrapperRect = wrapper.getBoundingClientRect();
  const theme = getTheme();

  // Random angle 15-45 degrees
  const angleDeg = 15 + Math.random() * 30;
  const angleRad = angleDeg * Math.PI / 180;
  // Random sign — cut can tilt either way
  const sign = Math.random() < 0.5 ? 1 : -1;
  const slope = Math.tan(angleRad) * sign;

  // Random vertical position 20%-80% of article height
  const yFraction = 0.2 + Math.random() * 0.6;
  const cutY = wrapperRect.top + wrapperRect.height * yFraction;
  const cutX = wrapperRect.left;

  // Line equation: y = slope * (x - cutX) + cutY
  // Points above line: y < slope * (x - cutX) + cutY
  function lineY(x) {
    return slope * (x - cutX) + cutY;
  }

  // Determine which side to erase — random
  const eraseAbove = Math.random() < 0.5;

  // Classify words
  const toErase = [];
  const toSurvive = [];
  for (const w of visibleWords) {
    const rect = w.span.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const ly = lineY(cx);
    const isAbove = cy < ly;
    if (isAbove === eraseAbove) {
      // Distance from line for cascade ordering
      w.dist = Math.abs(cy - ly);
      toErase.push(w);
    } else {
      toSurvive.push(w);
    }
  }

  if (toErase.length === 0) return;

  // Sort by distance from cut line — closest first for cascade
  toErase.sort((a, b) => a.dist - b.dist);

  // Push batch undo entries
  const undoEntries = toErase.map(w => eraseInState(w));
  pushBatchUndo(undoEntries);

  // ── Animate the slash line ──
  const lineEl = document.createElement('div');
  lineEl.className = 'burroughs-cut-line';

  // Calculate line endpoints across wrapper width
  const y1 = lineY(wrapperRect.left);
  const y2 = lineY(wrapperRect.right);
  const dx = wrapperRect.width;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  lineEl.style.position = 'fixed';
  lineEl.style.left = `${wrapperRect.left}px`;
  lineEl.style.top = `${y1}px`;
  lineEl.style.width = `${length}px`;
  lineEl.style.height = '1px';
  lineEl.style.transformOrigin = '0 0';
  lineEl.style.transform = `rotate(${angle}deg)`;

  // Theme-specific line color
  if (theme === 'dostoevsky') {
    lineEl.style.background = '#6b0000';
  } else if (theme === 'tolstoy') {
    lineEl.style.background = '#3a5c28';
  } else {
    lineEl.style.background = 'var(--ink, #1a1a1a)';
  }

  lineEl.style.zIndex = '300';
  document.body.appendChild(lineEl);

  // Animate slash line drawing (0.4s) using clip-path
  lineEl.style.clipPath = 'inset(0 100% 0 0)';
  lineEl.style.transition = 'clip-path 0.4s ease-out';
  // Force reflow
  lineEl.offsetWidth;
  lineEl.style.clipPath = 'inset(0 0 0 0)';

  // Wait for line to draw
  await delay(400);

  // Fade line out
  lineEl.style.transition = 'opacity 0.3s ease-out';
  lineEl.style.opacity = '0';
  setTimeout(() => lineEl.remove(), 300);

  // ── Cascade erasure (0.8s total) ──
  const cascadeDuration = 800;
  const totalWords = toErase.length;

  if (theme === 'dostoevsky') {
    // Dostoevsky: disintegrate in cascade
    const promises = [];
    for (let i = 0; i < totalWords; i++) {
      const w = toErase[i];
      const t = (i / Math.max(1, totalWords - 1)) * cascadeDuration;
      promises.push(
        delay(t).then(() => {
          applyErasedClass(w.span);
          return disintegrateWord(w.span);
        })
      );
    }
    await Promise.all(promises);
    onWordAction();
  } else if (theme === 'tolstoy') {
    // Tolstoy: green flash before settling
    for (let i = 0; i < totalWords; i++) {
      const w = toErase[i];
      const t = (i / Math.max(1, totalWords - 1)) * cascadeDuration;
      setTimeout(() => {
        w.span.classList.add('burroughs-tolstoy-flash');
        setTimeout(() => {
          w.span.classList.remove('burroughs-tolstoy-flash');
          applyErasedClass(w.span);
        }, 150);
      }, t);
    }
    await delay(cascadeDuration + 150);
  } else {
    // Default: cascade blackout
    for (let i = 0; i < totalWords; i++) {
      const w = toErase[i];
      const t = (i / Math.max(1, totalWords - 1)) * cascadeDuration;
      setTimeout(() => applyErasedClass(w.span), t);
    }
    await delay(cascadeDuration);
  }

  updatePoem();
}

// ── Technique 2: The Fold-In ──

async function doFoldIn() {
  console.log('Burroughs: Fold-In');
  const wrapper = getWrapper();
  if (!wrapper) return;

  const columns = getVisibleWordsByColumn();
  const activeColumns = columns.filter(c => c.length > 0);
  if (activeColumns.length === 0) return;

  const theme = getTheme();

  // Interleave words from columns
  const interleaved = [];
  const maxLen = Math.max(...activeColumns.map(c => c.length));
  for (let i = 0; i < maxLen; i++) {
    for (const col of activeColumns) {
      if (i < col.length) {
        interleaved.push(col[i]);
      }
    }
  }

  // Erase every other word (positions 1, 3, 5... → 0-indexed)
  const toErase = interleaved.filter((_, i) => i % 2 === 1);

  if (toErase.length === 0) return;

  // Push batch undo
  const undoEntries = toErase.map(w => eraseInState(w));
  pushBatchUndo(undoEntries);

  // ── Wave animation (2s, left to right) ──
  const waveDuration = 2000;
  const wrapperRect = wrapper.getBoundingClientRect();
  const wrapperLeft = wrapperRect.left;
  const wrapperWidth = wrapperRect.width;

  // Sort toErase by horizontal position for wave timing
  const eraseWithX = toErase.map(w => {
    const rect = w.span.getBoundingClientRect();
    return { ...w, x: rect.left + rect.width / 2 };
  });
  eraseWithX.sort((a, b) => a.x - b.x);

  if (theme === 'dostoevsky') {
    // Dostoevsky: burning trail wave
    const promises = [];
    for (const w of eraseWithX) {
      const progress = (w.x - wrapperLeft) / wrapperWidth;
      const t = progress * waveDuration;
      promises.push(
        delay(t).then(() => {
          // Orange glow trail
          w.span.classList.add('burroughs-dosto-trail');
          setTimeout(() => w.span.classList.remove('burroughs-dosto-trail'), 300);
          applyErasedClass(w.span);
          return disintegrateWord(w.span);
        })
      );
    }
    await Promise.all(promises);
    onWordAction();
  } else if (theme === 'tolstoy') {
    // Tolstoy: butterfly cluster follows wave
    const butterflyCluster = createButterflyCluster();
    document.body.appendChild(butterflyCluster);

    for (const w of eraseWithX) {
      const progress = (w.x - wrapperLeft) / wrapperWidth;
      const t = progress * waveDuration;
      const rect = w.span.getBoundingClientRect();
      setTimeout(() => {
        // Move butterfly cluster to word position
        butterflyCluster.style.left = `${rect.left}px`;
        butterflyCluster.style.top = `${rect.top - 15}px`;
        w.span.classList.add('burroughs-tolstoy-flash');
        setTimeout(() => {
          w.span.classList.remove('burroughs-tolstoy-flash');
          applyErasedClass(w.span);
        }, 150);
      }, t);
    }
    await delay(waveDuration + 200);
    butterflyCluster.style.transition = 'opacity 0.5s';
    butterflyCluster.style.opacity = '0';
    setTimeout(() => butterflyCluster.remove(), 500);
  } else {
    // Default: wave blackout
    for (const w of eraseWithX) {
      const progress = (w.x - wrapperLeft) / wrapperWidth;
      const t = progress * waveDuration;
      setTimeout(() => applyErasedClass(w.span), t);
    }
    await delay(waveDuration);
  }

  updatePoem();
}

// ── Tolstoy butterfly cluster for Fold-In wave ──

function createButterflyCluster() {
  const cluster = document.createElement('div');
  cluster.className = 'burroughs-butterfly-cluster';
  cluster.style.position = 'fixed';
  cluster.style.pointerEvents = 'none';
  cluster.style.zIndex = '300';
  cluster.style.transition = 'left 0.15s ease, top 0.15s ease';

  for (let i = 0; i < 4; i++) {
    const bf = document.createElement('span');
    bf.className = 'burroughs-butterfly';
    bf.textContent = '\u2726';
    bf.style.position = 'absolute';
    bf.style.fontSize = `${8 + Math.random() * 6}px`;
    bf.style.color = '#c17f24';
    bf.style.left = `${(Math.random() - 0.5) * 30}px`;
    bf.style.top = `${(Math.random() - 0.5) * 20}px`;
    bf.style.animationDelay = `${Math.random() * 0.5}s`;
    cluster.appendChild(bf);
  }
  return cluster;
}

// ── Utility ──

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Public API ──

/**
 * Fire a random Burroughs technique.
 * Returns a promise that resolves when the animation is complete.
 */
export async function fireBurroughs() {
  const visibleWords = getVisibleWords();
  if (visibleWords.length === 0) {
    return false; // Nothing to do
  }

  const coin = Math.random() < 0.5;
  if (coin) {
    await doCutUp();
  } else {
    await doFoldIn();
  }
  return true;
}
