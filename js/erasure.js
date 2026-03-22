import { h } from './ui.js';
import { updatePoem } from './poem.js';
import { getTheme } from './theme.js';
import { burnWord, onWordAction, isFascismWord } from './dostoevsky.js';

// ── State shared across this module ──
let layers = [];
let wState = {};
let undoStack = [];
let dragging = false;
let dragMode = null;

/** Detect touch-capable device (used for mobile interaction model). */
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

    const leanLabel = { left: 'L', center: 'C', right: 'R', unicorn: '\u2726' }[art.lean] || '';
    const leanClass = art.lean ? `lean-${art.lean}` : '';
    const srcDisplay = art.s || art.short;

    div.innerHTML = `
      <div class="src-tag"><span class="lean-badge ${leanClass}">${leanLabel}</span> ${h(srcDisplay)} <span class="src-lean-label">&middot; ${leanLabel}</span></div>
      <div class="art-kicker">${h(art.topic)}</div>
      <div class="art-hed"></div>
      <div class="art-byline"></div>
      <div class="art-body" id="ab-${li}"></div>`;

    // Add "Read full article" link for any article under 150 words
    const artWordCount = (art.paragraphs || []).join(' ').split(/\s+/).filter(Boolean).length;
    if (artWordCount < 150 && art.url) {
      const link = document.createElement('div');
      link.className = 'art-full-link';
      link.innerHTML = `Read the full article at <a href="${h(art.url)}" target="_blank" rel="noopener">${h(art.sourceName || art.short)}</a>`;
      div.appendChild(link);
    }

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

    // Dostoevsky: fire-and-ash burn animation
    if (getTheme() === 'dostoevsky') {
      burnWord(span).then(() => {
        span.classList.add('erased');
        updatePoem();
        onWordAction();
      });
    } else {
      span.classList.add('erased');
      updatePoem();
    }
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
    onWordAction();
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

  updatePoem();
}

/** Un-erase a word (restore from erased state). */
function unerase(span) {
  const li = parseInt(span.dataset.li);
  const wi = parseInt(span.dataset.wi);
  const key = `${li}-${wi}`;
  const prev = wState[key] || null;
  if (prev !== 'erased') return;
  undoStack.push({ key, prev });
  wState[key] = null;
  span.classList.remove('erased');
  // Flash animation for visual feedback
  span.classList.add('unerase-flash');
  span.addEventListener('animationend', () => span.classList.remove('unerase-flash'), { once: true });
  updatePoem();
}

/** Attach mouse and touch event delegation on the article wrapper. */
export function attachInteraction(wrapper) {
  // ── Mouse events (desktop — unchanged) ──
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

  // ── Touch events (mobile) ──
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
      return; // Let normal scrolling happen
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
      // First move — erase the starting word (drag started)
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

  const endTouch = (e) => {
    if (!touchStartedOnWord) return;
    const span = lastTouchSpan;
    const now = Date.now();

    if (!touchMoved && span) {
      // Single tap (no drag) — check for double tap
      const key = `${span.dataset.li}-${span.dataset.wi}`;
      const isErased = wState[key] === 'erased';

      if (now - lastTapTime < 350 && lastTapSpan === span) {
        // Double tap
        if (isErased) {
          unerase(span);
        }
        // Double tap on non-erased word does nothing
        lastTapTime = 0;
        lastTapSpan = null;
      } else {
        // First tap — erase the word
        if (!isErased) {
          act(span, 'erase');
        }
        lastTapTime = now;
        lastTapSpan = span;
      }
    } else if (touchMoved && lastTouchSpan) {
      // Drag ended — also erase the starting word if it wasn't already
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
