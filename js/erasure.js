import { h, refreshLayerTags } from './ui.js';
import { updatePoem } from './poem.js';

// ── State shared across this module ──
let layers = [];
let wState = {};
let curTop = 0;
let undoStack = [];
let dragging = false;
let dragMode = null;

export function getState() {
  return { layers, wState, curTop, undoStack };
}

export function resetState() {
  layers = [];
  wState = {};
  curTop = 0;
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

/** Build all article layers in the DOM. */
export function buildArticleLayers(articles, wrapper) {
  layers = articles;
  wState = {};
  undoStack = [];
  curTop = 0;
  wrapper.innerHTML = '';

  layers.forEach((art, li) => {
    const toks = tokenize(art.paragraphs.join(' ¶ '));
    art.toks = toks;

    const div = document.createElement('div');
    div.className = `article-layer bg-${li}`;
    div.id = `al-${li}`;
    if (li === 0) div.classList.add('is-top');

    div.innerHTML = `
      <div class="src-tag">${h(art.short)} \u00b7 Layer ${li + 1}</div>
      <div class="art-kicker">${h(art.topic)} \u00b7 ${h(art.short)}</div>
      <div class="art-hed">${h(art.headline || '')}</div>
      <div class="art-byline">${h(art.byline || '')}</div>
      <div class="art-body" id="ab-${li}"></div>`;
    wrapper.appendChild(div);

    const body = div.querySelector(`#ab-${li}`);
    let wi = 0;
    toks.forEach(tok => {
      if (tok.type === 'sp') {
        body.appendChild(document.createTextNode(tok.v));
      } else if (tok.type === 'br') {
        body.appendChild(document.createElement('br'));
        body.appendChild(document.createElement('br'));
      } else {
        const s = document.createElement('span');
        s.className = 'w';
        s.dataset.li = li;
        s.dataset.wi = wi;
        s.textContent = tok.v;
        body.appendChild(s);
        wi++;
      }
    });
  });

  // Set wrapper min-height to match top layer
  requestAnimationFrame(() => {
    const top = document.querySelector('.article-layer.is-top');
    if (top) wrapper.style.minHeight = Math.max(top.scrollHeight, 500) + 'px';
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
    checkComplete(li);
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

/** If all words on a layer are erased, advance to the next. */
function checkComplete(li) {
  const layer = document.getElementById(`al-${li}`);
  const words = layer.querySelectorAll('.w');
  const allErased = Array.from(words).every(w => wState[`${li}-${w.dataset.wi}`] === 'erased');

  if (allErased && li === curTop && li + 1 < layers.length) {
    curTop = li + 1;
    layer.classList.remove('is-top');
    const next = document.getElementById(`al-${curTop}`);
    next.classList.add('is-top');
    requestAnimationFrame(() => {
      const wr = document.getElementById('article-wrapper');
      wr.style.minHeight = Math.max(next.scrollHeight, 500) + 'px';
    });
    refreshLayerTags(layers, curTop);
  }
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

  // Recalculate which layer is on top
  let top = 0;
  for (let i = 0; i < layers.length; i++) {
    const ws = document.getElementById(`al-${i}`).querySelectorAll('.w');
    if (!Array.from(ws).every(w => wState[`${i}-${w.dataset.wi}`] === 'erased')) {
      top = i;
      break;
    }
    if (i === layers.length - 1) top = i;
  }
  curTop = top;
  layers.forEach((_, i) => {
    document.getElementById(`al-${i}`).classList.toggle('is-top', i === curTop);
  });
  refreshLayerTags(layers, curTop);
  updatePoem();
}

/** Attach mouse/pointer event delegation on the article wrapper. */
export function attachInteraction(wrapper) {
  wrapper.addEventListener('mousedown', e => {
    const span = e.target.closest('.w');
    if (!span || !span.closest('.is-top')) return;
    dragging = true;
    dragMode = e.shiftKey ? 'keep' : 'erase';
    act(span, dragMode);
    e.preventDefault();
  });

  wrapper.addEventListener('mouseover', e => {
    if (!dragging || !dragMode) return;
    const span = e.target.closest('.w');
    if (!span || !span.closest('.is-top')) return;
    act(span, dragMode);
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
    dragMode = null;
  });
}
