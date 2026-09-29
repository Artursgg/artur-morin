// =============================================================================
// AM Logo Button - shared by every page
//   Hover (desktop): "Artur" and "Morin" collapse into the AM box (pure CSS)
//   Click while scrolled down: smooth scroll to the top of the page
//   Click while already at the top: go to the home page
// =============================================================================
(function() {
  'use strict';

  const logo = document.querySelector('.logo');
  if (!logo) return;

  const HOME_URL = '/';
  const TOP_THRESHOLD = 10; // px - counts as "at the top"
  const HOME_PATHS = ['/', '/index.html', '/photography-index.html'];

  const isHomePage = () => HOME_PATHS.includes(window.location.pathname);
  const isAtTop = () => window.scrollY <= TOP_THRESHOLD;
  const isMobileTablet = () => window.innerWidth <= 1024;

  // On mobile/tablet only the AM box is shown (CSS uses .logo-text-hidden)
  function syncLayoutClass() {
    logo.classList.remove('logo-text-expanded');
    logo.classList.toggle('logo-text-hidden', isMobileTablet());
  }

  syncLayoutClass();
  window.addEventListener('resize', syncLayoutClass, { passive: true });
  window.addEventListener('pageshow', syncLayoutClass);

  logo.addEventListener('click', (e) => {
    e.preventDefault();

    if (!isAtTop()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!isHomePage()) {
      window.location.href = HOME_URL;
    }
    // Already at the top of the home page: nothing to do
  });
})();
