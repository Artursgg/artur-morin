// =============================================================================
// AM Logo Button - shared by every page, same behaviour on all devices
//   Hover (mouse): "Artur" and "Morin" collapse into the AM box (pure CSS)
//   Tap (touch, no hover): plays that same collapse, then acts
//   Click/tap while scrolled down: smooth scroll to the top of the page
//   Click/tap while already at the top: go to the home page
// =============================================================================
(function() {
  'use strict';

  const logo = document.querySelector('.logo');
  if (!logo) return;

  const HOME_URL = '/';
  const TOP_THRESHOLD = 10; // px - counts as "at the top"
  const HOME_PATHS = ['/', '/index.html'];
  const COLLAPSE_MS = 380; // matches the CSS collapse transition

  const isHomePage = () => HOME_PATHS.includes(window.location.pathname);
  const isAtTop = () => window.scrollY <= TOP_THRESHOLD;
  const hasHover = () => window.matchMedia('(hover: hover)').matches;
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Older versions hid the name on phones/tablets; always show the full logo now
  logo.classList.remove('logo-text-hidden', 'logo-text-expanded');

  function act() {
    if (!isAtTop()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!isHomePage()) {
      window.location.href = HOME_URL;
    }
    // Already at the top of the home page: nothing to do
  }

  let busy = false;
  logo.addEventListener('click', (e) => {
    e.preventDefault();

    // Mouse users already saw the collapse on hover
    if (hasHover() || reduceMotion()) {
      act();
      return;
    }

    if (busy) return;
    busy = true;
    logo.classList.add('logo-collapsing');
    setTimeout(() => {
      act();
      // expand back after the scroll starts (skipped if we navigated away)
      setTimeout(() => {
        logo.classList.remove('logo-collapsing');
        busy = false;
      }, 250);
    }, COLLAPSE_MS);
  });

  // Coming back via the back button: make sure the logo isn't stuck collapsed
  window.addEventListener('pageshow', () => {
    logo.classList.remove('logo-collapsing');
    busy = false;
  });
})();
