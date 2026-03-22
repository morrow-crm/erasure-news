import { getState } from './erasure.js';
import { getPoemString } from './poem.js';

let dateShort = '';
let editionVolume = new Date().getMonth() + 1;
let editionNumber = null;
let sessionCounted = false;

export function setShareDate(d) {
  dateShort = d;
}

/** Get the current edition string, e.g. "Vol. 3 · No. 47" or just "Vol. 3". */
export function getEditionString() {
  if (editionNumber) {
    return `Vol. ${editionVolume} \u00b7 No. ${editionNumber}`;
  }
  return `Vol. ${editionVolume}`;
}

/** Set the edition after a successful counter increment. */
export function setEdition(vol, num) {
  editionVolume = vol;
  editionNumber = num;
}

/** Reset session flag (called on Start Over). */
export function resetEdition() {
  sessionCounted = false;
  editionNumber = null;
  updateNameplate();
}

/** Update the nameplate edition label. */
function updateNameplate() {
  const el = document.getElementById('edition-label');
  if (el) el.textContent = getEditionString();
}

// Set initial nameplate on load
updateNameplate();

/** Increment the global counter (once per session). Returns {volume, number} or null. */
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
    if (data.number) {
      editionVolume = data.volume;
      editionNumber = data.number;
    }
    updateNameplate();
    return data;
  } catch (err) {
    console.error('[edition] Counter failed:', err.message);
    sessionCounted = true; // Don't retry on failure
    updateNameplate();
    return null;
  }
}

/** Ensure the counter is called (fire-and-forget for downloads, awaited for share). */
export async function ensureCounted() {
  return incrementCounter();
}

function shareString() {
  const { layers } = getState();
  const sources = layers.map(l => l.short).join('/');
  const edition = getEditionString();
  return `${edition} \u2014 erasure from ${sources} \u00b7 ${dateShort} \u00b7 Is it news or poetry? You decide! #ErasureNews #erasurepoetry`;
}

export async function openShare() {
  const poem = getPoemString();
  if (!poem) {
    alert('Shift+click words to build your poem first.');
    return;
  }

  // Increment counter before showing modal
  await ensureCounted();

  const { layers } = getState();
  const edition = getEditionString();

  document.getElementById('share-poem-text').textContent = poem;
  document.getElementById('share-sources').textContent = layers.map(l => l.short).join(' \u00b7 ');
  document.getElementById('share-meta').textContent =
    `${edition} \u00b7 Topics: ${[...new Set(layers.map(l => l.topic))].join(', ')} \u00b7 Erasure News \u00b7 ${dateShort}`;
  document.getElementById('share-date').textContent = dateShort;
  document.getElementById('share-modal').classList.add('show');
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
    btn.textContent = '\u2713 Copied';
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  });
}

function renderCard(poem) {
  const { layers } = getState();
  const edition = getEditionString();
  const canvas = document.getElementById('share-canvas');
  const W = 520, H = 310;
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#fafaf7';
  ctx.fillRect(0, 0, W, H);

  // Ruled lines
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1;
  for (let y = 24; y < H; y += 24) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Borders
  ctx.strokeStyle = '#0d0d0d';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, W - 24, H - 24);
  ctx.lineWidth = 0.5;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  // Nameplate
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(12, 12, W - 24, 40);
  ctx.fillStyle = '#fafaf7';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('ERASURE NEWS', W / 2, 38);

  // Edition line beneath nameplate band
  ctx.fillStyle = '#6b6560';
  ctx.font = '9px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(edition, W / 2, 60);

  // Rule
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(12, 64, W - 24, 1);

  // Source + date
  ctx.fillStyle = '#6b6560';
  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(layers.map(l => l.short).join(' \u00b7 ') + '   \u00b7   ' + dateShort, W / 2, 80);

  // Poem
  const lines = poem.split('\n');
  ctx.fillStyle = '#0d0d0d';
  ctx.font = 'italic 17px Georgia, "Times New Roman", serif';
  const lh = 28;
  const totalH = lines.length * lh;
  let y = Math.max((H - totalH) / 2 + 16 + 28, 100);
  lines.forEach(line => { ctx.fillText(line, W / 2, y); y += lh; });

  // Footer
  ctx.fillStyle = '#c8c4ba';
  ctx.fillRect(40, H - 32, W - 80, 1);
  ctx.fillStyle = '#aaa49a';
  ctx.font = '9px "Courier New", monospace';
  ctx.fillText('Is it news or poetry? Nobody can say!  \u00b7  erasurenews.com', W / 2, H - 18);

  // Film grain
  const id = ctx.getImageData(0, 0, W, H);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 5;
    d[i]     = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
  }
  ctx.putImageData(id, 0, 0);
}

export async function downloadCard() {
  const poem = getPoemString();
  if (!poem) return;
  // Increment counter before rendering the card
  await ensureCounted();
  renderCard(poem);
  const canvas = document.getElementById('share-canvas');
  const a = document.createElement('a');
  a.download = `erasure-news-${Date.now()}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

/** Dynamically load html2canvas from CDN (cached after first load). */
let html2canvasPromise = null;
function loadHtml2Canvas() {
  if (html2canvasPromise) return html2canvasPromise;
  html2canvasPromise = import('https://esm.sh/html2canvas@1.4.1')
    .then(mod => mod.default);
  return html2canvasPromise;
}

/** Download #article-wrapper as a PNG screenshot. */
export async function downloadBlackout() {
  const wrapper = document.getElementById('article-wrapper');
  if (!wrapper) return;

  // Increment counter (fire-and-forget, don't block the download)
  ensureCounted();

  const btn = document.getElementById('dl-blackout-btn');
  const orig = btn.innerHTML;
  btn.textContent = 'Rendering\u2026';
  btn.disabled = true;

  try {
    const html2canvas = await loadHtml2Canvas();
    const canvas = await html2canvas(wrapper, {
      backgroundColor: '#fafaf7',
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

/** Download the poem textarea text as a .txt file. */
export function downloadPoemText() {
  const poem = getPoemString();
  if (!poem) {
    alert('Write or circle some words first.');
    return;
  }
  const blob = new Blob([poem], { type: 'text/plain' });
  const a = document.createElement('a');
  a.download = `erasure-poem-${Date.now()}.txt`;
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
}
