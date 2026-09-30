import { getState } from './erasure.js';
import { getPoemString } from './poem.js';

const LAUNCH_YEAR = 2026;
const LAUNCH_MONTH = 3;

function calcVolume() {
  const now = new Date();
  return (now.getFullYear() - LAUNCH_YEAR) * 12 + (now.getMonth() + 1 - LAUNCH_MONTH) + 1;
}

let dateShort = '';
let editionVolume = calcVolume();
let editionNumber = null;
let sessionCounted = false;

export function setShareDate(d) {
  dateShort = d;
}

export function getEditionString() {
  if (editionNumber) {
    return `Vol. ${editionVolume} · No. ${editionNumber}`;
  }
  return `Vol. ${editionVolume}`;
}

export function resetEdition() {
  sessionCounted = false;
  updateNameplate();
}

function updateNameplate() {
  const el = document.getElementById('edition-label');
  if (el) el.textContent = getEditionString();
}

async function fetchCurrentCount() {
  try {
    const res = await fetch('/api/increment-counter');
    const data = await res.json();
    if (data.volume) editionVolume = data.volume;
    if (data.number) editionNumber = data.number;
  } catch (err) {
    console.error('[edition] Failed to fetch counter:', err.message);
  }
  updateNameplate();
}

fetchCurrentCount();

async function incrementCounter() {
  if (sessionCounted) return { volume: editionVolume, number: editionNumber };

  try {
    const res = await fetch('/api/increment-counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const data = await res.json();
    sessionCounted = true;
    if (data.volume) editionVolume = data.volume;
    if (data.number) editionNumber = data.number;
    updateNameplate();
    return data;
  } catch (err) {
    console.error('[edition] Counter increment failed:', err.message);
    sessionCounted = true;
    return null;
  }
}

export async function ensureCounted() {
  return incrementCounter();
}

function getPoemTitle() {
  const el = document.getElementById('share-title-input');
  return el ? el.value.trim() : '';
}

function shareString() {
  const { layers } = getState();
  const sources = layers.map(l => l.short).join('/');
  const edition = getEditionString();
  const title = getPoemTitle();
  if (title) {
    return `${edition} — "${title}" — erasure from ${sources} · ${dateShort} · #ErasureNews #erasurepoetry`;
  }
  return `${edition} — erasure from ${sources} · ${dateShort} · Is it news or poetry? You decide! #ErasureNews #erasurepoetry`;
}

export async function openShare() {
  const poem = getPoemString();
  if (!poem) {
    alert('Shift+click words to build your poem first.');
    return;
  }

  await ensureCounted();

  const { layers } = getState();
  const edition = getEditionString();

  document.getElementById('share-poem-text').textContent = poem;
  document.getElementById('share-sources').textContent = layers.map(l => l.short).join(' · ');
  document.getElementById('share-meta').textContent =
    `${edition} · Topics: ${[...new Set(layers.map(l => l.topic))].join(', ')} · Erasure News · ${dateShort}`;
  document.getElementById('share-date').textContent = dateShort;
  document.getElementById('share-modal').classList.add('show');

  const titleInput = document.getElementById('share-title-input');
  const rerender = () => renderCard(poem);
  titleInput.removeEventListener('input', rerender);
  titleInput.addEventListener('input', rerender);
  titleInput._rerenderFn = rerender;

  renderCard(poem);
}

export function closeShare() {
  document.getElementById('share-modal').classList.remove('show');
}

export function shareToX() {
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareString())}`, '_blank');
}

export function shareToMastodon() {
  window.open(`https://shareopenly.org/share/?text=${encodeURIComponent(shareString())}`, '_blank');
}

export function copyText() {
  navigator.clipboard.writeText(shareString()).then(() => {
    const btn = document.getElementById('copy-btn');
    const orig = btn.innerHTML;
    btn.textContent = '✓ Copied';
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function renderCard(poem) {
  const { layers } = getState();
  const edition = getEditionString();
  const title = getPoemTitle();
  const canvas = document.getElementById('share-canvas');
  const W = 1200, H = 630;
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  const ctx = canvas.getContext('2d');

  const bg = '#FAFAF9';
  const ink = '#171412';
  const muted = '#A8A29E';
  const rule = '#D6D3D1';
  const accent = '#4338CA';

  // ── Background ──
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Border ──
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // ── Nameplate band ──
  ctx.fillStyle = ink;
  ctx.fillRect(28, 28, W - 56, 64);
  ctx.fillStyle = bg;
  ctx.font = '600 32px "Newsreader", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Erasure News', W / 2, 70);

  // ── Edition ──
  ctx.fillStyle = muted;
  ctx.font = '500 14px "JetBrains Mono", monospace';
  ctx.fillText(edition, W / 2, 110);

  // ── Rule ──
  ctx.fillStyle = rule;
  ctx.fillRect(60, 120, W - 120, 1);

  // ── Poem title ──
  let poemStartY = 150;
  if (title) {
    ctx.fillStyle = ink;
    ctx.font = 'italic 26px "Newsreader", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, W / 2, poemStartY);
    ctx.fillStyle = accent;
    ctx.fillRect(W / 2 - 30, poemStartY + 10, 60, 1);
    poemStartY += 40;
  }

  // ── Poem text ──
  const poemLines = poem.split('\n');
  const maxPoemWidth = W - 160;
  const availableH = H - poemStartY - 80;

  let fontSize = 30;
  let lineHeight, wrappedLines;
  while (fontSize >= 14) {
    lineHeight = fontSize * 1.7;
    ctx.font = `italic ${fontSize}px "Newsreader", Georgia, serif`;
    wrappedLines = [];
    for (const line of poemLines) {
      if (!line.trim()) { wrappedLines.push(''); continue; }
      wrappedLines.push(...wrapText(ctx, line, maxPoemWidth));
    }
    const totalPoemH = wrappedLines.length * lineHeight;
    if (totalPoemH <= availableH) break;
    fontSize -= 2;
  }

  const totalPoemH = wrappedLines.length * lineHeight;
  let y = poemStartY + (availableH - totalPoemH) / 2 + lineHeight * 0.7;

  ctx.font = `italic ${fontSize}px "Newsreader", Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = ink;

  for (const line of wrappedLines) {
    if (!line.trim()) { y += lineHeight * 0.4; continue; }
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }

  // ── Footer ──
  ctx.fillStyle = muted;
  ctx.font = '500 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(layers.map(l => l.short).join(' · ') + '   ·   ' + dateShort, W / 2, H - 55);

  ctx.fillStyle = rule;
  ctx.fillRect(80, H - 44, W - 160, 1);

  ctx.fillStyle = muted;
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillText('Is it news or poetry? You decide!  ·  erasurenews.com', W / 2, H - 28);
}

export async function downloadCard() {
  const poem = getPoemString();
  if (!poem) return;
  await ensureCounted();
  renderCard(poem);
  const canvas = document.getElementById('share-canvas');
  const a = document.createElement('a');
  a.download = `erasure-news-${Date.now()}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

let html2canvasPromise = null;
function loadHtml2Canvas() {
  if (html2canvasPromise) return html2canvasPromise;
  html2canvasPromise = import('https://esm.sh/html2canvas@1.4.1')
    .then(mod => mod.default);
  return html2canvasPromise;
}

export async function downloadBlackout() {
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper) return;

  ensureCounted();

  const btn = document.getElementById('dl-blackout-btn');
  const orig = btn.innerHTML;
  btn.textContent = 'Rendering…';
  btn.disabled = true;

  try {
    const html2canvas = await loadHtml2Canvas();
    const canvas = await html2canvas(wrapper, {
      backgroundColor: '#FFFFFF',
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const a = document.createElement('a');
    a.download = `erasure-blackout-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  } catch (err) {
    console.error('Blackout screenshot failed:', err);
    alert('Could not render blackout image. Try again.');
  } finally {
    btn.innerHTML = orig;
    btn.disabled = false;
  }
}

export function downloadPoemText() {
  const poem = getPoemString();
  if (!poem) {
    alert('Write or circle some words first.');
    return;
  }
  ensureCounted();
  const blob = new Blob([poem], { type: 'text/plain' });
  const a = document.createElement('a');
  a.download = `erasure-poem-${Date.now()}.txt`;
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
}
