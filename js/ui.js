/** HTML-escape a string. */
export function h(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Initialize topic pill toggles. Returns getter for current selection. */
export function initTopicPills(container) {
  let selected = ['climate'];

  container.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.t;
      if (btn.classList.contains('active')) {
        if (selected.length > 1) {
          btn.classList.remove('active');
          selected = selected.filter(x => x !== t);
        }
      } else if (selected.length < 3) {
        btn.classList.add('active');
        selected.push(t);
      }
    });
  });

  return () => [...selected];
}

/** Initialize source pill toggles. Returns getter for current selection. */
export function initSourcePills(container) {
  let selected = [
    { s: 'New York Times', lean: 'left', short: 'NYT' },
    { s: 'Wall Street Journal', lean: 'right', short: 'WSJ' },
  ];

  container.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) {
        if (selected.length > 1) {
          btn.classList.remove('active');
          selected = selected.filter(x => x.s !== btn.dataset.s);
        }
      } else if (selected.length < 3) {
        btn.classList.add('active');
        selected.push({ s: btn.dataset.s, lean: btn.dataset.lean, short: btn.dataset.short });
      }
    });
  });

  return () => selected.map(x => ({ ...x }));
}

/** Show loading overlay with optional status text. */
export function showLoading(msg) {
  const el = document.getElementById('loading');
  el.classList.add('show');
  if (msg) document.getElementById('load-status').textContent = msg;
}

export function setLoadingStatus(msg) {
  document.getElementById('load-status').textContent = msg;
}

export function hideLoading() {
  document.getElementById('loading').classList.remove('show');
}

/** Switch between setup and workspace screens. */
export function showSetup() {
  document.getElementById('setup').style.display = '';
  document.getElementById('workspace').style.display = 'none';
}

export function showWorkspace() {
  document.getElementById('setup').style.display = 'none';
  document.getElementById('workspace').style.display = 'block';
}

/** Render headline cards into the grid. */
export function renderHeadlineCards(headlines, onClickCallback) {
  const grid = document.getElementById('hl-grid');
  grid.innerHTML = '';

  headlines.forEach((hl, index) => {
    const card = document.createElement('div');
    card.className = 'hl-card';
    card.dataset.index = index;

    const dateStr = hl.publishedAt
      ? new Date(hl.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '';

    card.innerHTML = `
      <div class="hl-card-source">${h(hl.sourceName)}</div>
      <div class="hl-card-title">${h(hl.title)}</div>
      <div class="hl-card-desc">${h(hl.description)}</div>
      <div class="hl-card-meta">${h(hl.author)} &middot; ${dateStr}</div>
    `;

    card.addEventListener('click', () => onClickCallback(index));
    grid.appendChild(card);
  });
}

/** Clear the headline card grid. */
export function clearHeadlineCards() {
  const grid = document.getElementById('hl-grid');
  if (grid) grid.innerHTML = '';
}

