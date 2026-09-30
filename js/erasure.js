import { h } from './ui.js';
import { updatePoem } from './poem.js';

// ── State shared across this module ──
let layers = [];
let wState = {};
let undoStack = [];
let dragging = false;
let dragMode = null;

export const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

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

    const leanLabel = { left: 'L', center: 'C', right: 'R', unicorn: '✦' }[art.lean] || '';
    const leanClass = art.lean ? `lean-${art.lean}` : '';
    const srcDisplay = art.s || art.short;

    div.innerHTML = `
      <div class="src-tag"><span class="lean-badge ${leanClass}">${leanLabel}</span> ${h(srcDisplay)} <span class="src-lean-label">&middot; ${leanLabel}</span></div>
      <div class="art-kicker">${h(art.topic)}</div>
      <div class="art-hed"></div>
      <div class="art-byline"></div>
      <div class="art-body" id="ab-${li}"></div>`;

    const artWordCount = (art.paragraphs || []).join(' ').split(/\s+/).filter(Boolean).length;
    if (artWordCount < 150 && art.url) {
      const link = document.createElement('div');
      link.className = 'art-full-link';
      link.innerHTML = `Read the full article at <a href="${h(art.url)}" target="_blank" rel="noopener">${h(art.sourceName || art.short)}</a>`;
      div.appendChild(link);
    }

    wrapper.appendChild(div);

    let wi = 0;
    const hedToks = tokenize(art.headline || '');
    wi = populateWords(div.querySelector('.art-hed'), hedToks, li, wi);
    const bylToks = tokenize(art.byline || '');
    wi = populateWords(div.querySelector('.art-byline'), bylToks, li, wi);
    const bodyToks = tokenize(art.paragraphs.join(' ¶ '));
    art.toks = bodyToks;
    populateWords(div.querySelector(`#ab-${li}`), bodyToks, li, wi);
  });
}

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
    updatePoem();
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
    updatePoem();
  }
}

export function undoLast() {
  if (!undoStack.length) return;
  const entry = undoStack.pop();

  if (entry.batch) {
    for (const { key, prev } of entry.batch) {
      const [li, wi] = key.split('-').map(Number);
      const layerEl = document.getElementById(`al-${li}`);
      const span = [...layerEl.querySelectorAll('.w')].find(s => parseInt(s.dataset.wi) === wi);
      if (!span) continue;
      wState[key] = prev;
      span.classList.remove('erased', 'kept');
      span.style.visibility = '';
      if (prev === 'erased') span.classList.add('erased');
      else if (prev === 'kept') span.classList.add('kept');
    }
    updatePoem();
    return;
  }

  const { key, prev } = entry;
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

function unerase(span) {
  const li = parseInt(span.dataset.li);
  const wi = parseInt(span.dataset.wi);
  const key = `${li}-${wi}`;
  const prev = wState[key] || null;
  if (prev !== 'erased') return;
  undoStack.push({ key, prev });
  wState[key] = null;
  span.classList.remove('erased');
  span.classList.add('unerase-flash');
  span.addEventListener('animationend', () => span.classList.remove('unerase-flash'), { once: true });
  updatePoem();
}

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

  let touchStartedOnWord = false;
  let lastTouchSpan = null;
  let touchStartSpan = null;
  let touchMoved = false;
  let lastTapTime = 0;
  let lastTapSpan = null;

  wrapper.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const span = el?.closest('.w');
    if (!span) {
      touchStartedOnWord = false;
      return;
    }
    touchStartedOnWord = true;
    touchMoved = false;
    dragging = true;
    dragMode = 'erase';
    lastTouchSpan = span;
    touchStartSpan = span;
    e.preventDefault();
  }, { passive: false });

  wrapper.addEventListener('touchmove', e => {
    if (!touchStartedOnWord || !dragging) return;
    if (!touchMoved) {
      touchMoved = true;
      if (touchStartSpan) act(touchStartSpan, 'erase');
    }
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const span = el?.closest('.w');
    if (span && span !== lastTouchSpan) {
      act(span, 'erase');
      lastTouchSpan = span;
    }
    e.preventDefault();
  }, { passive: false });

  const endTouch = () => {
    if (!touchStartedOnWord) return;
    const span = lastTouchSpan;
    const now = Date.now();

    if (!touchMoved && span) {
      const key = `${span.dataset.li}-${span.dataset.wi}`;
      const isErased = wState[key] === 'erased';

      if (now - lastTapTime < 350 && lastTapSpan === span) {
        if (isErased) {
          unerase(span);
        }
        lastTapTime = 0;
        lastTapSpan = null;
      } else {
        if (!isErased) {
          act(span, 'erase');
        }
        lastTapTime = now;
        lastTapSpan = span;
      }
    } else if (touchMoved && lastTouchSpan) {
      const startKey = `${lastTouchSpan.dataset.li}-${lastTouchSpan.dataset.wi}`;
      if (wState[startKey] !== 'erased') {
        act(lastTouchSpan, 'erase');
      }
    }

    touchStartedOnWord = false;
    lastTouchSpan = null;
    touchStartSpan = null;
    touchMoved = false;
    dragging = false;
    dragMode = null;
  };
  wrapper.addEventListener('touchend', endTouch);
  wrapper.addEventListener('touchcancel', () => {
    touchStartedOnWord = false;
    lastTouchSpan = null;
    touchStartSpan = null;
    touchMoved = false;
    dragging = false;
    dragMode = null;
  });
}
