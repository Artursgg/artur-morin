/**
 * Portfolio Lightbox - Dynamic Image Viewer
 * Powered by ImageLoader (JSON)
 */
document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  console.log('Lightbox at DOMContentLoaded:', lightbox);
});


document.addEventListener('DOMContentLoaded', async () => {
  if (!imageLoader.loaded) {
    await imageLoader.loadImages();
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox?.querySelector('.lightbox-image');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  const lightboxPrev = lightbox?.querySelector('.lightbox-prev');
  const lightboxNext = lightbox?.querySelector('.lightbox-next');

  if (!lightbox || !lightboxImage) return;

  let images = imageLoader.getPortfolioImages(); // all categories
  let currentIndex = 0;

  const grid = document.querySelector('.portfolio-grid-6x6');
  if (!grid) return;

  // Render portfolio grid dynamically
  function renderGrid() {
    grid.innerHTML = '';
    images.forEach(img => {
      const div = document.createElement('div');
      div.className = 'grid-item';
      div.innerHTML = `<img src="${img.thumbnail}" data-full="${img.full}" alt="${img.alt}">`;
      grid.appendChild(div);
    });
  }

  renderGrid();

  // Open lightbox
  function open(index) {
    console.log("Open called for index:", index, images[index]);
    if (index < 0 || index >= images.length) return;
    currentIndex = index;
    const img = images[currentIndex];

    lightboxImage.src = img.full;
    lightboxImage.alt = img.alt || img.title || 'Portfolio image';
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    updateButtons();
  }

  // Close lightbox
  function close() {
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    document.body.style.overflow = '';
  }

  // Navigate
  function prev() { if (currentIndex > 0) open(currentIndex - 1); }
  function next() { if (currentIndex < images.length - 1) open(currentIndex + 1); }

  function updateButtons() {
    if (lightboxPrev) lightboxPrev.disabled = currentIndex === 0;
    if (lightboxNext) lightboxNext.disabled = currentIndex === images.length - 1;
  }

  // Attach events
  function attachEvents() {
    const gridItems = grid.querySelectorAll('.grid-item');
    gridItems.forEach((item, idx) => {
      item.addEventListener('click', e => {
        e.preventDefault();
        open(idx);
      });
    });
    console.log("Grid items found:", gridItems.length);

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

  attachEvents();
});
