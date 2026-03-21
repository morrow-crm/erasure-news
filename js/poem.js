import { h } from './ui.js';
import { getState } from './erasure.js';
import { POEM_LINE_LENGTH } from './config.js';

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

/** Update the poem display element. */
export function updatePoem() {
  const el = document.getElementById('poem-display');
  const words = getKeptWords();

  if (!words.length) {
    el.className = 'empty';
    el.textContent = 'Shift + click words above to circle keepers \u2014 they gather here as your poem';
    return;
  }

  el.className = '';
  let html = '';
  words.forEach((w, i) => {
    html += `<span class="pw-${w.li}">${h(w.text)}</span>`;
    if ((i + 1) % POEM_LINE_LENGTH === 0) html += '\n';
    else if (i + 1 < words.length) html += ' ';
  });
  el.innerHTML = html;
}

/** Get poem as plain text string. */
export function getPoemString() {
  const words = getKeptWords();
  let t = '';
  words.forEach((w, i) => {
    t += w.text;
    if ((i + 1) % POEM_LINE_LENGTH === 0) t += '\n';
    else if (i + 1 < words.length) t += ' ';
  });
  return t.trim();
}
