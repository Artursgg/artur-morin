// =============================================================================
// Phone/tablet menu - keyboard focus (shared by every page)
//   - opening the menu moves focus to the first link
//   - while open, Tab / Shift+Tab stay inside: menu button, links, "Let's Talk"
// Opening/closing itself is handled by each page's script; Escape closes there.
// =============================================================================
(function () {
  'use strict';

  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const focusables = () =>
    // visible ones only (getClientRects also works for position:fixed elements)
    [toggle, ...nav.querySelectorAll('a[href], button')].filter((el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden');

  // after the page script has opened the menu, put focus on the first link
  toggle.addEventListener('click', () => {
    setTimeout(() => {
      if (isOpen()) {
        const first = nav.querySelector('a[href]');
        if (first) first.focus({ preventScroll: true });
      }
    }, 0);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !isOpen()) return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const inside = items.includes(document.activeElement);
    if (e.shiftKey && (document.activeElement === first || !inside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
      e.preventDefault();
      first.focus();
    }
  });
})();
