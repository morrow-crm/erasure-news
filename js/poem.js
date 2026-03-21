import { getState } from './erasure.js';
import { POEM_LINE_LENGTH } from './config.js';

/** Whether the user has manually edited the textarea. */
let userEdited = false;

/** Get the textarea element. */
function el() {
  return document.getElementById('poem-display');
}

/** Auto-size textarea height (fallback for browsers without field-sizing). */
function autoSize(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}

/** Get all kept words in document order. */
export function getKeptWords() {
  const { layers, wState } = getState();
  const out = [];
  layers.forEach((_, li) => {
    const layer = document.getElementById(`al-${li}`);
    if (!layer) return;
    layer.querySelectorAll('.w').forEach(s => {
      if (wState[`${li}-${s.dataset.wi}`] === 'kept') {
        out.push({ text: s.textContent, li });
      }
    });
  });
  return out;
}

/** Build plain-text poem from kept words. */
function buildPoemText() {
  const words = getKeptWords();
  let t = '';
  words.forEach((w, i) => {
    t += w.text;
    if ((i + 1) % POEM_LINE_LENGTH === 0) t += '\n';
    else if (i + 1 < words.length) t += ' ';
  });
  return t.trim();
}

/** Update the poem textarea (unless user has manually edited). */
export function updatePoem() {
  if (userEdited) return;
  const ta = el();
  ta.value = buildPoemText();
  autoSize(ta);
}

/** Get poem text — always reads from the textarea (respects edits). */
export function getPoemString() {
  return el().value.trim();
}

/** Reset the user-edited lock (called on "Start Over"). */
export function resetPoemState() {
  userEdited = false;
  const ta = el();
  ta.value = '';
  autoSize(ta);
}

/** Attach input listener to detect manual edits. */
export function initPoemTextarea() {
  const ta = el();
  ta.addEventListener('input', () => {
    userEdited = true;
    autoSize(ta);
  });
}
