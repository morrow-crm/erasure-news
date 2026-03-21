import { getState } from './erasure.js';
import { POEM_LINE_LENGTH } from './config.js';

/** Whether the user has manually edited the poem. */
let userEdited = false;

/** Get the contenteditable poem element. */
function el() {
  return document.getElementById('poem-display');
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

/** Update the poem display (unless user has manually edited). */
export function updatePoem() {
  if (userEdited) return;
  el().textContent = buildPoemText();
}

/** Get poem text — reads from the contenteditable div (respects edits). */
export function getPoemString() {
  return el().innerText.trim();
}

/** Reset the user-edited lock (called on "Start Over"). */
export function resetPoemState() {
  userEdited = false;
  el().textContent = '';
}

/** Attach input listener to detect manual edits. */
export function initPoemTextarea() {
  el().addEventListener('input', () => {
    userEdited = true;
  });
}
