/**
 * Portfolio Lightbox - Dynamic Image Viewer
 * Works with images loaded from ImageLoader (JSON)
 */

(function() {
  'use strict';

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox?.querySelector('.lightbox-image');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  const lightboxPrev = lightbox?.querySelector('.lightbox-prev');
  const lightboxNext = lightbox?.querySelector('.lightbox-next');

  if (!lightbox || !lightboxImage) return;

  let currentIndex = 0;
  let images = [];

  // Initialize Lightbox images from the grid
  function initImages() {
    const gridItems = document.querySelectorAll('.portfolio-grid-6x6 .grid-item');
    images = Array.from(gridItems).map(item => {
      const img = item.querySelector('img');
      if (!img) return null;
      return {
        thumbnail: img.src,
        full: img.dataset.full || img.src,
        alt: img.alt
      };
    }).filter(Boolean);
  }

  function open(index) {
    if (index < 0 || index >= images.length) return;
    currentIndex = index;
    const img = images[currentIndex];

    lightboxImage.src = img.full;
    lightboxImage.alt = img.alt;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    updateButtons();
  }

  function close() {
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    document.body.style.overflow = '';
  }

  function prev() { if (currentIndex > 0) open(currentIndex - 1); }
  function next() { if (currentIndex < images.length - 1) open(currentIndex + 1); }

  function updateButtons() {
    if (lightboxPrev) lightboxPrev.disabled = currentIndex === 0;
    if (lightboxNext) lightboxNext.disabled = currentIndex === images.length - 1;
  }

  function attachEvents() {
    const gridItems = document.querySelectorAll('.portfolio-grid-6x6 .grid-item');
    gridItems.forEach((item, idx) => {
      item.addEventListener('click', e => {
        e.preventDefault();
        open(idx);
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', close);
    if (lightboxPrev) lightboxPrev.addEventListener('click', e => { e.stopPropagation(); prev(); });
    if (lightboxNext) lightboxNext.addEventListener('click', e => { e.stopPropagation(); next(); });

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', e => {
      if (lightbox.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') prev();
        else if (e.key === 'ArrowRight') next();
      }
    });
  }

  function init() {
    initImages();
    attachEvents();
  }

  // Wait until DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
