import { fetchArticle } from './api.js';
import {
  initTopicPills, initSourcePills,
  showLoading, setLoadingStatus, hideLoading,
  showSetup, showWorkspace, buildLayerTags,
} from './ui.js';
import {
  buildArticleLayers, attachInteraction, undoLast, resetState, getState,
} from './erasure.js';
import { updatePoem } from './poem.js';
import { openShare, closeShare, shareToX, shareToMastodon, copyText, downloadCard, setShareDate } from './share.js';

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

// ── Begin button ──
document.getElementById('begin-btn').addEventListener('click', async () => {
  const topics = getTopics();
  const sources = getSources();

  showLoading('Searching today\u2019s press\u2026');

  try {
    resetState();
    const results = [];
    for (let i = 0; i < sources.length; i++) {
      const src = sources[i];
      const topic = topics[i % topics.length];
      setLoadingStatus(`Searching ${src.short} \u2014 ${topic}\u2026`);
      const art = await fetchArticle(src.s, topic, dateShort);
      results.push({ ...src, topic, ...art });
    }

    buildArticleLayers(results, wrapper);
    buildLayerTags(results, 0);
    showWorkspace();
    updatePoem();
  } catch (err) {
    console.error(err);
    alert('Press jammed. Please try again.\n' + err.message);
  } finally {
    hideLoading();
  }
});

// ── Workspace buttons ──
document.getElementById('undo-btn').addEventListener('click', undoLast);
document.getElementById('share-btn').addEventListener('click', openShare);
document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('Start over?')) return;
  resetState();
  showSetup();
});

// ── Share modal buttons ──
document.getElementById('share-close-btn').addEventListener('click', closeShare);
document.getElementById('share-x-btn').addEventListener('click', shareToX);
document.getElementById('share-mastodon-btn').addEventListener('click', shareToMastodon);
document.getElementById('copy-btn').addEventListener('click', copyText);
document.getElementById('download-btn').addEventListener('click', downloadCard);
