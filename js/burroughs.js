import { getState } from './erasure.js';
import { updatePoem } from './poem.js';

// ── Helpers ──

function getWrapper() {
  return document.getElementById('article-wrapper');
}

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

function eraseInState(word) {
  const { wState } = getState();
  const prev = wState[word.key] || null;
  wState[word.key] = 'erased';
  return { key: word.key, prev };
}

function pushBatchUndo(entries) {
  const { undoStack } = getState();
  undoStack.push({ batch: entries });
}

function applyErasedClass(span) {
  span.classList.remove('kept');
  span.classList.add('erased');
}

// ── Technique 1: The Cut-Up ──

async function doCutUp() {
  const wrapper = getWrapper();
  if (!wrapper) return;

  const visibleWords = getVisibleWords();
  if (visibleWords.length === 0) return;

  const wrapperRect = wrapper.getBoundingClientRect();

  const angleDeg = 15 + Math.random() * 30;
  const angleRad = angleDeg * Math.PI / 180;
  const sign = Math.random() < 0.5 ? 1 : -1;
  const slope = Math.tan(angleRad) * sign;

  const yFraction = 0.2 + Math.random() * 0.6;
  const cutY = wrapperRect.top + wrapperRect.height * yFraction;
  const cutX = wrapperRect.left;

  function lineY(x) {
    return slope * (x - cutX) + cutY;
  }

  const eraseAbove = Math.random() < 0.5;

  const toErase = [];
  for (const w of visibleWords) {
    const rect = w.span.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const ly = lineY(cx);
    const isAbove = cy < ly;
    if (isAbove === eraseAbove) {
      w.dist = Math.abs(cy - ly);
      toErase.push(w);
    }
  }

  if (toErase.length === 0) return;

  toErase.sort((a, b) => a.dist - b.dist);

  const undoEntries = toErase.map(w => eraseInState(w));
  pushBatchUndo(undoEntries);

  // ── Animate the slash line ──
  const lineEl = document.createElement('div');
  lineEl.className = 'burroughs-cut-line';

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
  lineEl.style.background = 'var(--ink, #1a1a1a)';
  lineEl.style.zIndex = '300';
  document.body.appendChild(lineEl);

  lineEl.style.clipPath = 'inset(0 100% 0 0)';
  lineEl.style.transition = 'clip-path 0.4s ease-out';
  lineEl.offsetWidth;
  lineEl.style.clipPath = 'inset(0 0 0 0)';

  await delay(400);

  lineEl.style.transition = 'opacity 0.3s ease-out';
  lineEl.style.opacity = '0';
  setTimeout(() => lineEl.remove(), 300);

  // ── Cascade erasure ──
  const cascadeDuration = 800;
  const totalWords = toErase.length;

  for (let i = 0; i < totalWords; i++) {
    const w = toErase[i];
    const t = (i / Math.max(1, totalWords - 1)) * cascadeDuration;
    setTimeout(() => applyErasedClass(w.span), t);
  }
  await delay(cascadeDuration);

  updatePoem();
}

// ── Technique 2: The Fold-In ──

async function doFoldIn() {
  const wrapper = getWrapper();
  if (!wrapper) return;

  const columns = getVisibleWordsByColumn();
  const activeColumns = columns.filter(c => c.length > 0);
  if (activeColumns.length === 0) return;

  const interleaved = [];
  const maxLen = Math.max(...activeColumns.map(c => c.length));
  for (let i = 0; i < maxLen; i++) {
    for (const col of activeColumns) {
      if (i < col.length) {
        interleaved.push(col[i]);
      }
    }
  }

  const toErase = interleaved.filter((_, i) => i % 2 === 1);

  if (toErase.length === 0) return;

  const undoEntries = toErase.map(w => eraseInState(w));
  pushBatchUndo(undoEntries);

  // ── Wave animation ──
  const waveDuration = 2000;
  const wrapperRect = wrapper.getBoundingClientRect();
  const wrapperLeft = wrapperRect.left;
  const wrapperWidth = wrapperRect.width;

  const eraseWithX = toErase.map(w => {
    const rect = w.span.getBoundingClientRect();
    return { ...w, x: rect.left + rect.width / 2 };
  });
  eraseWithX.sort((a, b) => a.x - b.x);

  for (const w of eraseWithX) {
    const progress = (w.x - wrapperLeft) / wrapperWidth;
    const t = progress * waveDuration;
    setTimeout(() => applyErasedClass(w.span), t);
  }
  await delay(waveDuration);

  updatePoem();
}

// ── Utility ──

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Public API ──

export async function fireBurroughs() {
  const visibleWords = getVisibleWords();
  if (visibleWords.length === 0) {
    return false;
  }

  const coin = Math.random() < 0.5;
  if (coin) {
    await doCutUp();
  } else {
    await doFoldIn();
  }
  return true;
}
