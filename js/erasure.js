import { h } from './ui.js';
import { updatePoem } from './poem.js';

// ── State shared across this module ──
let layers = [];
let wState = {};
let undoStack = [];
let dragging = false;
let dragMode = null;

export function getState() {
  return { layers, wState, undoStack };
}

export function resetState() {
  layers = [];
  wState = {};
  undoStack = [];
  dragging = false;
  dragMode = null;
}

/** Tokenize article text into words, spaces, and paragraph breaks. */
function tokenize(text) {
  const out = [];
  text.split(/([ \t\n]+|¶)/g).forEach(chunk => {
    if (!chunk) return;
    if (/^[ \t\n]+$/.test(chunk)) out.push({ type: 'sp', v: chunk });
    else if (chunk === '¶') out.push({ type: 'br' });
    else out.push({ type: 'w', v: chunk });
  });
  return out;
}

/** Populate a container with word spans and space text nodes.
 *  Returns the next word index after all words are added. */
function populateWords(container, toks, li, wiStart) {
  let wi = wiStart;
  toks.forEach(tok => {
    if (tok.type === 'sp') {
      container.appendChild(document.createTextNode(tok.v));
    } else if (tok.type === 'br') {
      container.appendChild(document.createElement('br'));
      container.appendChild(document.createElement('br'));
    } else {
      const s = document.createElement('span');
      s.className = 'w';
      s.dataset.li = li;
      s.dataset.wi = wi;
      s.textContent = tok.v;
      container.appendChild(s);
      wi++;
    }
  });
  return wi;
}

/** Build all article columns in the DOM. */
export function buildArticleLayers(articles, wrapper) {
  layers = articles;
  wState = {};
  undoStack = [];
  wrapper.innerHTML = '';
  wrapper.style.setProperty('--col-count', layers.length);

  layers.forEach((art, li) => {
    const div = document.createElement('div');
    div.className = 'article-col';
    div.id = `al-${li}`;

    div.innerHTML = `
      <div class="src-tag">${h(art.short)} \u00b7 ${h(art.topic)}</div>
      <div class="art-kicker">${h(art.topic)} \u00b7 ${h(art.short)}</div>
      <div class="art-hed"></div>
      <div class="art-byline"></div>
      <div class="art-body" id="ab-${li}"></div>`;
    wrapper.appendChild(div);

    let wi = 0;

    // Headline words
    const hedToks = tokenize(art.headline || '');
    wi = populateWords(div.querySelector('.art-hed'), hedToks, li, wi);

    // Byline words
    const bylToks = tokenize(art.byline || '');
    wi = populateWords(div.querySelector('.art-byline'), bylToks, li, wi);

    // Body words
    const bodyToks = tokenize(art.paragraphs.join(' ¶ '));
    art.toks = bodyToks;
    populateWords(div.querySelector(`#ab-${li}`), bodyToks, li, wi);
  });
}

/** Apply erase or keep action to a word span. */
function act(span, mode) {
  const li = parseInt(span.dataset.li);
  const wi = parseInt(span.dataset.wi);
  const key = `${li}-${wi}`;
  const prev = wState[key] || null;

  if (mode === 'erase') {
    if (prev === 'erased') return;
    undoStack.push({ key, prev });
    wState[key] = 'erased';
    span.classList.remove('kept');
    span.classList.add('erased');
  } else {
    if (prev === 'erased') return;
    undoStack.push({ key, prev });
    if (prev === 'kept') {
      wState[key] = null;
      span.classList.remove('kept');
    } else {
      wState[key] = 'kept';
      span.classList.add('kept');
    }
  }
  updatePoem();
}

/** Undo the last erase/keep action. */
export function undoLast() {
  if (!undoStack.length) return;
  const { key, prev } = undoStack.pop();
  const [li, wi] = key.split('-').map(Number);
  const layerEl = document.getElementById(`al-${li}`);
  const span = [...layerEl.querySelectorAll('.w')].find(s => parseInt(s.dataset.wi) === wi);
  if (!span) return;

  wState[key] = prev;
  span.classList.remove('erased', 'kept');
  if (prev === 'erased') span.classList.add('erased');
  else if (prev === 'kept') span.classList.add('kept');

  updatePoem();
}

/** Attach mouse/pointer event delegation on the article wrapper. */
export function attachInteraction(wrapper) {
  wrapper.addEventListener('mousedown', e => {
    const span = e.target.closest('.w');
    if (!span) return;
    dragging = true;
    dragMode = e.shiftKey ? 'keep' : 'erase';
    act(span, dragMode);
    e.preventDefault();
  });

  wrapper.addEventListener('mouseover', e => {
    if (!dragging || !dragMode) return;
    const span = e.target.closest('.w');
    if (!span) return;
    act(span, dragMode);
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
    dragMode = null;
  });
}
