import { getState } from './erasure.js';
import { getPoemString } from './poem.js';
import { getTheme } from './theme.js';
import { getFascismWordsInPoem, getRedStringPositions } from './dostoevsky.js';

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

function getPoemTitle() {
  const el = document.getElementById('share-title-input');
  return el ? el.value.trim() : '';
}

function shareString() {
  const { layers } = getState();
  const sources = layers.map(l => l.short).join('/');
  const title = getPoemTitle();
  if (title) {
    return `"${title}" \u2014 erasure from ${sources} \u00b7 ${dateShort} \u00b7 #ErasureNews #erasurepoetry`;
  }
  return `${getEditionString()} \u2014 erasure from ${sources} \u00b7 ${dateShort} \u00b7 Is it news or poetry? You decide! #ErasureNews #erasurepoetry`;
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

  // Re-render card when title changes
  const titleInput = document.getElementById('share-title-input');
  const rerender = () => renderCard(poem);
  titleInput.removeEventListener('input', rerender);
  titleInput.addEventListener('input', rerender);
  // Store for cleanup
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
    btn.textContent = '\u2713 Copied';
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  });
}

// Theme-specific palettes for share card rendering
const CARD_THEMES = {
  default: {
    bg: '#fafaf7',
    ruledLine: 'rgba(0,0,0,0.04)',
    border: '#0d0d0d',
    nameplateBg: '#0d0d0d',
    nameplateText: '#fafaf7',
    editionText: '#6b6560',
    ruleColor: '#0d0d0d',
    metaText: '#6b6560',
    poemText: '#0d0d0d',
    footerRule: '#c8c4ba',
    footerText: '#aaa49a',
    grainIntensity: 5,
    themeLabel: '',
  },
  tolstoy: {
    bg: '#faf8f0',
    ruledLine: 'rgba(138,170,106,0.06)',
    border: '#8aaa6a',
    nameplateBg: '#3a5c28',
    nameplateText: '#faf8f0',
    editionText: '#c17f24',
    ruleColor: '#8aaa6a',
    metaText: '#6b7a5e',
    poemText: '#2d4a1e',
    footerRule: '#8aaa6a',
    footerText: '#6b7a5e',
    grainIntensity: 4,
    themeLabel: 'Tolstoy Edition',
    cornerDeco: true,
  },
  dostoevsky: {
    bg: '#0e1014',
    ruledLine: 'rgba(255,255,255,0.015)',
    border: '#2a2c30',
    nameplateBg: '#5a0a0a',
    nameplateText: '#d4d4d4',
    editionText: '#4a6fa5',
    ruleColor: '#2a2c30',
    metaText: '#6a6e78',
    poemText: '#e8e8e8',
    footerRule: '#2a2c30',
    footerText: '#6a6e78',
    grainIntensity: 3,
    themeLabel: 'Dostoevsky Edition',
    crosshatch: true,
    fascismColor: '#8b0000',
    redString: true,
  },
};

/** Draw Tolstoy botanical corner decorations. */
function drawBotanicalCorners(ctx, W, H, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.3;
  const r = 28;
  // Top-left — small branch
  ctx.beginPath();
  ctx.moveTo(20, 20 + r); ctx.quadraticCurveTo(20, 20, 20 + r, 20);
  ctx.moveTo(22, 22 + r * 0.6); ctx.quadraticCurveTo(28, 28, 22 + r * 0.6, 22);
  // Small leaf
  ctx.moveTo(26, 26); ctx.quadraticCurveTo(34, 20, 40, 24);
  ctx.quadraticCurveTo(34, 28, 26, 26);
  ctx.stroke();
  // Top-right — mirror
  ctx.beginPath();
  ctx.moveTo(W - 20, 20 + r); ctx.quadraticCurveTo(W - 20, 20, W - 20 - r, 20);
  ctx.moveTo(W - 22, 22 + r * 0.6); ctx.quadraticCurveTo(W - 28, 28, W - 22 - r * 0.6, 22);
  ctx.moveTo(W - 26, 26); ctx.quadraticCurveTo(W - 34, 20, W - 40, 24);
  ctx.quadraticCurveTo(W - 34, 28, W - 26, 26);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(20, H - 20 - r); ctx.quadraticCurveTo(20, H - 20, 20 + r, H - 20);
  ctx.moveTo(26, H - 26); ctx.quadraticCurveTo(34, H - 20, 40, H - 24);
  ctx.quadraticCurveTo(34, H - 28, 26, H - 26);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(W - 20, H - 20 - r); ctx.quadraticCurveTo(W - 20, H - 20, W - 20 - r, H - 20);
  ctx.moveTo(W - 26, H - 26); ctx.quadraticCurveTo(W - 34, H - 20, W - 40, H - 24);
  ctx.quadraticCurveTo(W - 34, H - 28, W - 26, H - 26);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Draw Dostoevsky crosshatch texture. */
function drawCrosshatch(ctx, W, H) {
  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 0.5;
  const step = 8;
  for (let x = -H; x < W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke();
  }
  for (let x = 0; x < W + H; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - H, H); ctx.stroke();
  }
}

/** Word-wrap text into lines that fit within maxWidth. */
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

/** Draw a small leaf/butterfly motif for Tolstoy card. */
function drawLeafMotif(ctx, x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.2;
  ctx.lineWidth = 1;
  // Small leaf cluster
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 12, y - 8, x + 20, y);
  ctx.quadraticCurveTo(x + 12, y + 8, x, y);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 6, y - 2);
  ctx.quadraticCurveTo(x + 16, y - 12, x + 26, y - 4);
  ctx.quadraticCurveTo(x + 16, y + 2, x + 6, y - 2);
  ctx.fill();
  ctx.restore();
}

function renderCard(poem) {
  const { layers } = getState();
  const theme = getTheme();
  const t = CARD_THEMES[theme] || CARD_THEMES.default;
  const edition = getEditionString();
  const title = getPoemTitle();
  const canvas = document.getElementById('share-canvas');
  const W = 1200, H = 630;
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  const ctx = canvas.getContext('2d');

  // ── Background ──
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  // Dostoevsky crosshatch
  if (t.crosshatch) drawCrosshatch(ctx, W, H);

  // Faint ruled lines
  ctx.strokeStyle = t.ruledLine;
  ctx.lineWidth = 1;
  for (let y = 48; y < H; y += 48) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // ── Borders ──
  ctx.strokeStyle = t.border;
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Theme-specific decorations
  if (t.cornerDeco) {
    drawBotanicalCorners(ctx, W, H, t.border);
    // Extra leaf motifs for larger card
    drawLeafMotif(ctx, 50, 56, t.border);
    drawLeafMotif(ctx, W - 76, H - 56, t.border);
  }

  // ── Nameplate band ──
  ctx.fillStyle = t.nameplateBg;
  ctx.fillRect(24, 24, W - 48, 72);
  ctx.fillStyle = t.nameplateText;
  ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('ERASURE NEWS', W / 2, 70);

  // ── Edition + theme label ──
  ctx.fillStyle = t.editionText;
  ctx.font = '16px "Courier New", monospace';
  const editionStr = t.themeLabel ? `${edition}  \u00b7  ${t.themeLabel}` : edition;
  ctx.fillText(editionStr, W / 2, 114);

  // ── Rule ──
  ctx.fillStyle = t.ruleColor;
  ctx.fillRect(24, 122, W - 48, 2);

  // ── Red string conspiracy lines (Dostoevsky) ──
  if (t.redString) {
    const positions = getRedStringPositions();
    if (positions.length >= 2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(139, 0, 0, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      const poemAreaTop = 140;
      const poemAreaH = H - 240;
      for (let i = 1; i < positions.length; i++) {
        ctx.beginPath();
        ctx.moveTo(80 + positions[i - 1].x * (W - 160), poemAreaTop + positions[i - 1].y * poemAreaH);
        ctx.lineTo(80 + positions[i].x * (W - 160), poemAreaTop + positions[i].y * poemAreaH);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ── Poem title (if provided) ──
  let poemStartY = 155;
  if (title) {
    ctx.fillStyle = t.poemText;
    ctx.font = 'italic 28px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, W / 2, poemStartY);
    // Small decorative rule under title
    ctx.fillStyle = t.ruleColor;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(W / 2 - 40, poemStartY + 10, 80, 1);
    ctx.globalAlpha = 1;
    poemStartY += 40;
  }

  // ── Poem text — auto-scaling to fit ──
  const fascismWords = t.fascismColor ? getFascismWordsInPoem() : [];
  const poemLines = poem.split('\n');
  const maxPoemWidth = W - 160; // 80px padding each side
  const availableH = H - poemStartY - 80; // leave room for footer

  // Find the right font size (start large, scale down)
  let fontSize = 32;
  let lineHeight, wrappedLines;
  while (fontSize >= 14) {
    lineHeight = fontSize * 1.7;
    ctx.font = `italic ${fontSize}px "Playfair Display", Georgia, serif`;
    wrappedLines = [];
    for (const line of poemLines) {
      if (!line.trim()) { wrappedLines.push(''); continue; }
      wrappedLines.push(...wrapText(ctx, line, maxPoemWidth));
    }
    const totalPoemH = wrappedLines.length * lineHeight;
    if (totalPoemH <= availableH) break;
    fontSize -= 2;
  }

  // Center poem vertically in available space
  const totalPoemH = wrappedLines.length * lineHeight;
  let y = poemStartY + (availableH - totalPoemH) / 2 + lineHeight * 0.7;

  ctx.font = `italic ${fontSize}px "Playfair Display", Georgia, serif`;
  ctx.textAlign = 'center';

  for (const line of wrappedLines) {
    if (!line.trim()) { y += lineHeight * 0.4; continue; }

    if (fascismWords.length > 0) {
      // Word-by-word rendering for fascism words in blood red
      const words = line.split(/(\s+)/);
      const fullWidth = ctx.measureText(line).width;
      let x = (W - fullWidth) / 2;
      ctx.textAlign = 'left';
      for (const word of words) {
        const isFascism = fascismWords.some(fw => word.includes(fw));
        ctx.fillStyle = isFascism ? t.fascismColor : t.poemText;
        ctx.fillText(word, x, y);
        x += ctx.measureText(word).width;
      }
      ctx.textAlign = 'center';
    } else {
      ctx.fillStyle = t.poemText;
      ctx.fillText(line, W / 2, y);
    }
    y += lineHeight;
  }

  // ── Footer ──
  // Sources + date
  ctx.fillStyle = t.metaText;
  ctx.font = '14px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(layers.map(l => l.short).join(' \u00b7 ') + '   \u00b7   ' + dateShort, W / 2, H - 55);

  // Footer rule
  ctx.fillStyle = t.footerRule;
  ctx.fillRect(80, H - 44, W - 160, 1);

  // Footer text
  ctx.fillStyle = t.footerText;
  ctx.font = '13px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Is it news or poetry? You decide!  \u00b7  erasurenews.com', W / 2, H - 28);

  // Theme label bottom-left (Dostoevsky)
  if (t.themeLabel && t.crosshatch) {
    ctx.fillStyle = t.footerText;
    ctx.font = '11px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(t.themeLabel, 40, H - 28);
    ctx.textAlign = 'center';
  }

  // ── Film grain ──
  const id = ctx.getImageData(0, 0, W, H);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * t.grainIntensity;
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
    const theme = getTheme();
    const bgColor = theme === 'dostoevsky' ? '#0e1014' : theme === 'tolstoy' ? '#faf8f0' : '#fafaf7';
    const html2canvas = await loadHtml2Canvas();
    const canvas = await html2canvas(wrapper, {
      backgroundColor: bgColor,
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
