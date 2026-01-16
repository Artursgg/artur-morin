/**
 * Portfolio Lightbox - Image Viewer
 * Opens images in a full-screen lightbox modal
 */

(function() {
  'use strict';

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox?.querySelector('.lightbox-image');
  const lightboxTitle = lightbox?.querySelector('.lightbox-title'); // optional
  const closeBtn = lightbox?.querySelector('.lightbox-close');
  const prevBtn = lightbox?.querySelector('.lightbox-prev');
  const nextBtn = lightbox?.querySelector('.lightbox-next');

  if (!lightbox || !lightboxImage) return;

  let images = [];
  let currentIndex = 0;

  function collectImages() {
    const imgs = document.querySelectorAll('.portfolio-grid-6x6 .grid-item img');
    images = Array.from(imgs).map(img => ({
      full: img.dataset.full || img.src,
      alt: img.alt || 'Portfolio image',
      title: img.dataset.title || ''
    }));
  }

  function openLightbox(index) {
    if (index < 0 || index >= images.length) return;

    currentIndex = index;
    const img = images[currentIndex];

    lightboxImage.src = img.full;
    lightboxImage.alt = img.alt;
    if (lightboxTitle) lightboxTitle.textContent = img.title;

    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateButtons();
  }

  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImage.src = '';
  }

  function prevImage() {
    if (currentIndex > 0) openLightbox(currentIndex - 1);
  }

  function nextImage() {
    if (currentIndex < images.length - 1) openLightbox(currentIndex + 1);
  }

  function updateButtons() {
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === images.length - 1;
  }

  function init() {
    collectImages();
    document.querySelectorAll('.portfolio-grid-6x6 .grid-item img')
      .forEach((img, i) => img.addEventListener('click', e => {
        e.preventDefault();
        openLightbox(i);
      }));

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', e => { e.stopPropagation(); prevImage(); });
    if (nextBtn) nextBtn.addEventListener('click', e => { e.stopPropagation(); nextImage(); });

    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (lightbox.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') prevImage();
        else if (e.key === 'ArrowRight') nextImage();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
