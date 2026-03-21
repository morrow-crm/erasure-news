import { fetchHeadlines } from './api.js';
import {
  initTopicPills, initSourcePills,
  showLoading, setLoadingStatus, hideLoading,
  showSetup, showWorkspace,
  renderHeadlineCards, clearHeadlineCards,
} from './ui.js';
import {
  buildArticleLayers, attachInteraction, undoLast, resetState, getState,
} from './erasure.js';
import { updatePoem, initPoemTextarea, resetPoemState } from './poem.js';
import { openShare, closeShare, shareToX, shareToMastodon, copyText, downloadCard, setShareDate, downloadBlackout } from './share.js';

// ── Dates ──
const now = new Date();
const dateFull = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const dateShort = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

document.getElementById('top-date').textContent = dateFull;
document.getElementById('date-left').textContent = dateFull;
document.getElementById('share-date').textContent = dateShort;
setShareDate(dateShort);

// ── Setup pills ──
const getTopics = initTopicPills(document.getElementById('topic-pills'));
const getSources = initSourcePills(document.getElementById('source-pills'));

// ── Attach interaction to article wrapper (delegated) ──
const wrapper = document.getElementById('article-wrapper');
attachInteraction(wrapper);
initPoemTextarea();

// ── Headline browsing state ──
let headlineData = [];
let selectedIndices = new Set();

function updateCount() {
  const el = document.getElementById('hl-count');
  if (selectedIndices.size === 0) {
    el.textContent = 'Select 1\u20133 stories for erasure';
  } else {
    el.textContent = `${selectedIndices.size} of 3 selected`;
  }
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
  });
  document.getElementById('erasure-btn').disabled = selectedIndices.size === 0;
  updateCount();
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
  const sources = getSources();

  showLoading('Searching today\u2019s press\u2026');
  headlineData = [];
  selectedIndices.clear();

  try {
    for (let i = 0; i < sources.length; i++) {
      const src = sources[i];
      const topic = topics[i % topics.length];
      setLoadingStatus(`Searching ${src.short} \u2014 ${topic}\u2026`);
      const headlines = await fetchHeadlines(src.s, topic, dateShort);
      headlines.forEach(hl => {
        headlineData.push({ ...hl, sourceObj: src, topic });
      });
    }

    // Deduplicate by title
    const seen = new Set();
    headlineData = headlineData.filter(hl => {
      const key = hl.title?.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Cap at 12
    headlineData = headlineData.slice(0, 12);

    renderHeadlineCards(headlineData, onCardClick);
    document.getElementById('headlines-section').style.display = '';
    document.getElementById('erasure-btn').disabled = true;
    updateCount();

    document.getElementById('headlines-section').scrollIntoView({ behavior: 'smooth' });
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
    };
  });

  buildArticleLayers(results, wrapper);
  showWorkspace();
  updatePoem();
});

// ── Workspace buttons ──
document.getElementById('undo-btn').addEventListener('click', undoLast);
document.getElementById('share-btn').addEventListener('click', openShare);
document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('Start over?')) return;
  resetState();
  resetPoemState();
  clearHeadlineCards();
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
