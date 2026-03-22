/** Theme manager — stores current theme and applies it to the DOM. */

let currentTheme = sessionStorage.getItem('erasure-theme') || 'default';

/** Get the current theme name. */
export function getTheme() {
  return currentTheme;
}

/** Set theme, persist to session storage, and update body class. */
export function setTheme(theme) {
  currentTheme = theme;
  sessionStorage.setItem('erasure-theme', theme);
  applyTheme();
}

/** Apply the current theme class to the body element.
 *  Removes all theme-* classes first, then adds the active one. */
export function applyTheme() {
  document.body.classList.remove('theme-tolstoy', 'theme-dostoevsky');
  if (currentTheme !== 'default') {
    document.body.classList.add(`theme-${currentTheme}`);
  }
}

/** Remove theme from body (used when returning to setup). */
export function clearTheme() {
  document.body.classList.remove('theme-tolstoy', 'theme-dostoevsky');
}

/** Reset theme selector UI to default. */
export function resetThemeSelector() {
  const selector = document.getElementById('theme-selector');
  if (!selector) return;
  selector.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === 'default');
  });
}

/** Initialize the theme selector buttons. */
export function initThemeSelector() {
  const selector = document.getElementById('theme-selector');
  if (!selector) return;

  selector.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selector.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setTheme(btn.dataset.theme);
    });
  });

  // Restore saved theme selection in UI
  const saved = getTheme();
  if (saved !== 'default') {
    selector.querySelectorAll('.theme-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === saved);
    });
  }
}
