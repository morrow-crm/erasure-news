import { fetchAllHeadlines } from './api.js';
import {
  initTopicPills,
  showLoading, setLoadingStatus, hideLoading,
  showSetup, showWorkspace,
  renderHeadlineCards, clearHeadlineCards,
} from './ui.js';
import {
  buildArticleLayers, attachInteraction, undoLast, resetState, getState,
} from './erasure.js';
import { updatePoem, initPoemTextarea, resetPoemState } from './poem.js';
import { openShare, closeShare, shareToX, shareToMastodon, copyText, downloadCard, setShareDate, downloadBlackout, resetEdition } from './share.js';
import { initThemeSelector, applyTheme, clearTheme, setTheme, resetThemeSelector } from './theme.js';

// ── Dates ──
const now = new Date();
const dateFull = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const dateShort = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

document.getElementById('date-left').textContent = dateFull;
document.getElementById('share-date').textContent = dateShort;
setShareDate(dateShort);

// ── Setup pills ──
const getTopics = initTopicPills(document.getElementById('topic-pills'));

// ── Attach interaction to article wrapper (delegated) ──
const wrapper = document.getElementById('article-wrapper');
attachInteraction(wrapper);
initPoemTextarea();
initThemeSelector();

// ── Headline browsing state ──
let headlineData = [];
let selectedIndices = new Set();

function updateCount() {
  const el = document.getElementById('hl-count');
  if (selectedIndices.size === 0) {
    el.textContent = 'Select 1\u20133 stories for erasure';
  } else {
    const leans = [...selectedIndices].map(i => headlineData[i]?.sourceObj?.lean).filter(Boolean);
    const leanSummary = leans.map(l => ({ left: 'L', center: 'C', right: 'R', unicorn: '\u2726' }[l] || '?')).join(' ');
    el.textContent = `${selectedIndices.size} of 3 selected \u00B7 ${leanSummary}`;
  }
}

/** Find a balanced L/C/R suggestion from available headlines. */
function suggestBalanced() {
  const leftIdx = headlineData.findIndex(hl => hl.sourceObj?.lean === 'left');
  const centerIdx = headlineData.findIndex(hl => hl.sourceObj?.lean === 'center');
  const rightIdx = headlineData.findIndex(hl => hl.sourceObj?.lean === 'right');
  if (leftIdx >= 0 && centerIdx >= 0 && rightIdx >= 0) {
    return [leftIdx, centerIdx, rightIdx];
  }
  return null;
}

function showBalanceSuggestion() {
  const suggestion = suggestBalanced();
  document.querySelectorAll('.hl-card').forEach((card, i) => {
    card.classList.toggle('suggested', suggestion !== null && suggestion.includes(i) && selectedIndices.size === 0);
  });
}

function onCardClick(index) {
  if (selectedIndices.has(index)) {
    selectedIndices.delete(index);
  } else if (selectedIndices.size < 3) {
    selectedIndices.add(index);
  }
  document.querySelectorAll('.hl-card').forEach((card, i) => {
    card.classList.toggle('selected', selectedIndices.has(i));
    card.classList.toggle('disabled', selectedIndices.size >= 3 && !selectedIndices.has(i));
    card.classList.remove('suggested');
  });
  document.getElementById('erasure-btn').disabled = selectedIndices.size === 0;
  updateCount();
  if (selectedIndices.size === 0) showBalanceSuggestion();
}

function buildParagraphsFromHeadline(hl) {
  const desc = (hl.description || '').trim();
  const body = (hl.content || '').trim();

  let text;
  if (body && desc && body.startsWith(desc.substring(0, 50))) {
    text = body;
  } else {
    text = [desc, body].filter(Boolean).join(' ');
  }

  if (!text) return ['No article text available.'];

  const sentences = text.split(/(?<=[.!?])\s+/);
  const targetParas = Math.min(3, Math.max(2, Math.ceil(sentences.length / 2)));
  const per = Math.ceil(sentences.length / targetParas);
  const paragraphs = [];
  for (let i = 0; i < targetParas; i++) {
    const slice = sentences.slice(i * per, (i + 1) * per).join(' ');
    if (slice) paragraphs.push(slice);
  }

  while (paragraphs.length < 2) {
    paragraphs.push(paragraphs[paragraphs.length - 1]);
  }

  return paragraphs;
}

// ── Step 1: Find Stories ──
document.getElementById('begin-btn').addEventListener('click', async () => {
  const topics = getTopics();

  showLoading('Searching today\u2019s press\u2026');
  headlineData = [];
  selectedIndices.clear();

  try {
    setLoadingStatus('Searching across the spectrum\u2026');
    const headlines = await fetchAllHeadlines(topics, dateShort);
    headlines.forEach(hl => {
      headlineData.push({
        ...hl,
        sourceObj: { s: hl.sourceName, lean: hl.lean, short: hl.short },
        topic: topics[0],
      });
    });

    renderHeadlineCards(headlineData, onCardClick);
    document.getElementById('headlines-section').style.display = '';
    document.getElementById('erasure-btn').disabled = true;
    updateCount();
    showBalanceSuggestion();

    document.getElementById('headlines-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    console.error(err);
    alert('Press jammed. Please try again.\n' + err.message);
  } finally {
    hideLoading();
  }
});

// ── Step 2: Begin Erasure ──
document.getElementById('erasure-btn').addEventListener('click', () => {
  if (selectedIndices.size === 0) return;

  resetState();

  const results = [...selectedIndices].map(i => {
    const hl = headlineData[i];
    const src = hl.sourceObj;
    const pubDate = hl.publishedAt
      ? new Date(hl.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : dateShort;
    return {
      short: src.short,
      lean: src.lean,
      s: src.s,
      topic: hl.topic,
      headline: hl.title || 'Untitled',
      byline: `By ${hl.author} | ${hl.sourceName} | ${pubDate}`,
      paragraphs: buildParagraphsFromHeadline(hl),
      url: hl.url,
      sourceName: hl.sourceName,
      textQuality: hl.textQuality || 'short',
    };
  });

  buildArticleLayers(results, wrapper);
  applyTheme();
  showWorkspace();
  updatePoem();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Workspace buttons ──
document.getElementById('undo-btn').addEventListener('click', undoLast);
document.getElementById('share-btn').addEventListener('click', openShare);
document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('Start over?')) return;
  resetState();
  resetPoemState();
  resetEdition();
  clearHeadlineCards();
  clearTheme();
  setTheme('default');
  resetThemeSelector();
  document.getElementById('headlines-section').style.display = 'none';
  headlineData = [];
  selectedIndices.clear();
  showSetup();
});

// ── Poem panel buttons ──
document.getElementById('dl-blackout-btn').addEventListener('click', downloadBlackout);

// ── Format toolbar ──
const poemEl = document.getElementById('poem-display');
document.getElementById('fmt-bold').addEventListener('click', () => {
  poemEl.focus();
  document.execCommand('bold');
});
document.getElementById('fmt-italic').addEventListener('click', () => {
  poemEl.focus();
  document.execCommand('italic');
});
document.getElementById('fmt-break').addEventListener('click', () => {
  poemEl.focus();
  document.execCommand('insertParagraph');
});
document.getElementById('fmt-clear').addEventListener('click', () => {
  poemEl.focus();
  document.execCommand('removeFormat');
});

// ── Share modal buttons ──
document.getElementById('share-close-btn').addEventListener('click', closeShare);
document.getElementById('share-x-btn').addEventListener('click', shareToX);
document.getElementById('share-mastodon-btn').addEventListener('click', shareToMastodon);
document.getElementById('copy-btn').addEventListener('click', copyText);
document.getElementById('download-btn').addEventListener('click', downloadCard);
