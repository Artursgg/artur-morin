/**
 * Portfolio Lightbox - Dynamic Image Viewer
 * Powered by ImageLoader (data/images.json)
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (!imageLoader.loaded) {
    await imageLoader.loadImages();
  }

  const lightbox = document.getElementById('lightbox');
  const grid = document.querySelector('.portfolio-grid-6x6');
  if (!lightbox || !grid) return;

  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');
  const lightboxCounter = lightbox.querySelector('.lightbox-counter');

  // Safety net: position:fixed breaks inside a transformed parent
  if (lightbox.parentElement !== document.body) {
    document.body.appendChild(lightbox);
  }

  const images = imageLoader.getPortfolioImages(); // all categories
  let currentIndex = 0;
  let lastFocused = null;

  // Responsive grid images: the browser picks the smallest thumbnail that stays
  // sharp for the tile size (tiles are square crops, so wide photos need
  // proportionally more width). Tile widths follow the grid CSS breakpoints.
  function thumbSources(image) {
    if (!image.thumbnailSmall || !image.width || !image.height) return null;
    const ratio = image.width / image.height;
    const widthFor = (shortSide, maxLong) => Math.round(ratio >= 1 ? Math.min(maxLong, shortSide * ratio) : shortSide);
    const crop = Math.max(1, ratio).toFixed(2);
    return {
      srcset: `${image.thumbnailSmall} ${widthFor(400, 1600)}w, ${image.thumbnail} ${widthFor(800, 1600)}w`,
      sizes: [
        `(max-width: 480px) calc((92vw - 12px) / 2 * ${crop})`,
        `(max-width: 768px) calc((92vw - 16px) / 2 * ${crop})`,
        `(max-width: 1024px) calc((92vw - 40px) / 3 * ${crop})`,
        `calc((90vw - 80px) / 5 * ${crop})`,
      ].join(', '),
    };
  }

  // Photo viewer: the 1600px version unless the screen really needs more pixels
  function viewerSrc(image) {
    const needed = Math.max(window.innerWidth, window.innerHeight) * (window.devicePixelRatio || 1);
    return image.large && needed <= 1600 * 1.15 ? image.large : image.full;
  }

  // Render portfolio grid
  function renderGrid() {
    grid.innerHTML = '';
    images.forEach((image, idx) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'grid-item';
      item.dataset.index = idx;
      item.setAttribute('aria-label', `Open ${image.title || 'image'}`);

      const img = document.createElement('img');
      const sources = thumbSources(image);
      if (sources) {
        img.srcset = sources.srcset;
        img.sizes = sources.sizes;
      }
      img.src = image.thumbnail;
      img.alt = image.alt || image.title || 'Portfolio image';
      img.loading = 'lazy';
      img.decoding = 'async';

      item.appendChild(img);
      grid.appendChild(item);
    });
  }

  function isOpen() {
    return lightbox.getAttribute('aria-hidden') === 'false';
  }

  function preload(index) {
    if (images[index]) new Image().src = viewerSrc(images[index]);
  }

  function show(index) {
    if (index < 0 || index >= images.length) return;
    currentIndex = index;
    const image = images[currentIndex];

    lightboxImage.src = viewerSrc(image);
    lightboxImage.alt = image.alt || image.title || 'Portfolio image';
    if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
    if (lightboxPrev) lightboxPrev.disabled = currentIndex === 0;
    if (lightboxNext) lightboxNext.disabled = currentIndex === images.length - 1;

    preload(currentIndex + 1);
    preload(currentIndex - 1);
  }

  function open(index) {
    lastFocused = document.activeElement;
    show(index);
    lightbox.setAttribute('aria-hidden', 'false');
    // the window scrolls (not <body>), so the page lock goes on <html>
    document.documentElement.classList.add('lightbox-open');
    lightboxClose?.focus({ preventScroll: true });
  }

  function close() {
    lightbox.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('lightbox-open');
    lastFocused?.focus({ preventScroll: true });
  }

  const prev = () => show(currentIndex - 1);
  const next = () => show(currentIndex + 1);

  renderGrid();

  // One listener for the whole grid
  grid.addEventListener('click', e => {
    const item = e.target.closest('.grid-item');
    if (item) open(Number(item.dataset.index));
  });

  lightboxClose?.addEventListener('click', close);
  lightboxPrev?.addEventListener('click', e => { e.stopPropagation(); prev(); });
  lightboxNext?.addEventListener('click', e => { e.stopPropagation(); next(); });

  // Click on the dark background closes
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', e => {
    if (!isOpen()) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  });

  // Swipe left/right on touch screens (no swipe-to-close: it fired while
  // people were just trying to scroll)
  let touchX = 0;
  let touchY = 0;
  lightbox.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });
});
