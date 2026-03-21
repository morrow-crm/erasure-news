import { getState } from './erasure.js';
import { getPoemString } from './poem.js';

let dateShort = '';

export function setShareDate(d) {
  dateShort = d;
}

function shareString() {
  const { layers } = getState();
  return `"${getPoemString()}"\n\n\u2014 erasure from ${layers.map(l => l.short).join('/')} \u00b7 ${dateShort}\n\nIs it news or poetry? Nobody can say!\n\n#ErasureNews #erasurepoetry #foundpoetry`;
}

export function openShare() {
  const poem = getPoemString();
  if (!poem) {
    alert('Shift+click words to build your poem first.');
    return;
  }
  const { layers } = getState();

  document.getElementById('share-poem-text').textContent = poem;
  document.getElementById('share-sources').textContent = layers.map(l => l.short).join(' \u00b7 ');
  document.getElementById('share-meta').textContent =
    `Topics: ${[...new Set(layers.map(l => l.topic))].join(', ')} \u00b7 Erasure News \u00b7 ${dateShort}`;
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

  // Rule
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(12, 52, W - 24, 1);

  // Source + date
  ctx.fillStyle = '#6b6560';
  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(layers.map(l => l.short).join(' \u00b7 ') + '   \u00b7   ' + dateShort, W / 2, 68);

  // Poem
  const lines = poem.split('\n');
  ctx.fillStyle = '#0d0d0d';
  ctx.font = 'italic 17px Georgia, "Times New Roman", serif';
  const lh = 28;
  const totalH = lines.length * lh;
  let y = Math.max((H - totalH) / 2 + 16 + 16, 88);
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

export function downloadCard() {
  const poem = getPoemString();
  if (!poem) return;
  renderCard(poem);
  const canvas = document.getElementById('share-canvas');
  const a = document.createElement('a');
  a.download = `erasure-news-${Date.now()}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}
