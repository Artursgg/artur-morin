// =============================================================================
// Nav "you are here" highlight - shared by every page
//   - Separate pages (/about/, /portfolio/, ...): that link is always highlighted
//   - Home page: Work / Services / Contact light up while that section is in the
//     middle of the screen; nothing is highlighted over the hero
// Uses the existing .active style (gold text) + aria-current for screen readers.
// =============================================================================
(function () {
  'use strict';

  // menu links + the separate desktop Portfolio button (not the "Let's Talk" buttons)
  const links = Array.from(document.querySelectorAll('#primary-nav ul a[href], .nav-portfolio[href]'));
  if (!links.length) return;

  const normalise = (path) => path.replace(/index\.html$/, '');
  const currentPath = normalise(window.location.pathname);
  const isHome = currentPath === '/';

  function setActive(link, on, kind) {
    link.classList.toggle('active', on);
    if (on) link.setAttribute('aria-current', kind);
    else link.removeAttribute('aria-current');
  }

  // 1. Page links
  links.forEach((link) => {
    const url = new URL(link.getAttribute('href'), window.location.href);
    const isThisPage = !url.hash && normalise(url.pathname) === currentPath;
    setActive(link, isThisPage && !isHome, 'page');
  });

  if (!isHome) return;

  // 2. Home page sections (links like "#work" or "/#work")
  const sectionLinks = links
    .map((link) => {
      const url = new URL(link.getAttribute('href'), window.location.href);
      const section = url.hash && normalise(url.pathname) === '/' ? document.getElementById(url.hash.slice(1)) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);
  if (!sectionLinks.length) return;

  // Current = the menu section covering the middle line of the screen (one at a time)
  function update() {
    const middle = window.innerHeight / 2;
    let current = null;
    sectionLinks.forEach(({ section }) => {
      const r = section.getBoundingClientRect();
      if (r.top <= middle && r.bottom > middle) current = section;
    });
    sectionLinks.forEach(({ link, section }) => setActive(link, section === current, 'location'));
  }

  // throttled: at most every 100ms while scrolling, plus once when scrolling stops
  let last = 0;
  let trailing;
  function onScroll() {
    const now = Date.now();
    clearTimeout(trailing);
    if (now - last > 100) {
      last = now;
      update();
    }
    trailing = setTimeout(update, 120);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
