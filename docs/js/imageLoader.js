// Image Loader - manages portfolio images from JSON
/**
 * ImageLoader.js - loads portfolio, hero, and about images from JSON
 * Populates grids dynamically and integrates with Lightbox
 */

class ImageLoader {
  constructor(jsonPath = '/data/images.json') {
    this.jsonPath = jsonPath;
    this.images = null;
    this.loaded = false;
  }

  // Load JSON
  async loadImages() {
    try {
      const response = await fetch(this.jsonPath);
      if (!response.ok) throw new Error(`Could not fetch ${this.jsonPath}`);
      this.images = await response.json();
      this.loaded = true;
      return this.images;
    } catch (err) {
      console.error('Error loading images.json:', err);
      return null;
    }
  }

  // Get images by category or all
  getPortfolioImages(category = null) {
    if (!this.loaded || !this.images?.portfolio) return [];
    if (category) return this.images.portfolio[category] || [];

    const all = [];
    Object.values(this.images.portfolio).forEach(arr => {
      if (Array.isArray(arr)) all.push(...arr);
    });
    return all;
  }

  getHeroImage() {
    return this.images?.hero?.featured || null;
  }

  getAboutImage() {
    return this.images?.about?.portrait || null;
  }
}

// ======== Grid Population ========
const imageLoader = new ImageLoader();

// Populate portfolio grid (6x6)
function populatePortfolioGrid() {
  const portfolioGrid = document.querySelector('.portfolio-grid-6x6');
  if (!portfolioGrid || !imageLoader.loaded) return;

  const gridItems = Array.from(portfolioGrid.querySelectorAll('.grid-item'));
  const allImages = imageLoader.getPortfolioImages();
  const maxItems = Math.min(gridItems.length, allImages.length);

  for (let i = 0; i < maxItems; i++) {
    const item = gridItems[i];
    const image = allImages[i];

    let img = item.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      item.appendChild(img);
    }

    img.src = image.thumbnail;
    img.alt = image.alt || image.title || 'Portfolio image';
    img.dataset.full = image.full; // for lightbox
    item.style.display = '';
  }

  // Hide extra placeholders
  for (let i = maxItems; i < gridItems.length; i++) {
    gridItems[i].style.display = 'none';
  }
}

// ======== Hero / About Images ========
function updateHeroImage() {
  const heroSrc = imageLoader.getHeroImage();
  if (!heroSrc) return;
  document.querySelectorAll('.hero-image img, .image-frame img, .hero-media img')
    .forEach(img => img.src = heroSrc);
}

function updateAboutImage() {
  const aboutSrc = imageLoader.getAboutImage();
  if (!aboutSrc) return;
  document.querySelectorAll('.about-image img, .about-hero-image img')
    .forEach(img => img.src = aboutSrc);
}

// ======== Lightbox ========
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox?.querySelector('.lightbox-image');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  const lightboxPrev = lightbox?.querySelector('.lightbox-prev');
  const lightboxNext = lightbox?.querySelector('.lightbox-next');

  if (!lightbox || !lightboxImage) return;

  const gridItems = document.querySelectorAll('.portfolio-grid-6x6 .grid-item');
  let currentIndex = 0;
  const images = Array.from(gridItems).map(item => {
    const img = item.querySelector('img');
    if (!img) return null;
    return {
      thumbnail: img.src,
      full: img.dataset.full || img.src,
      alt: img.alt
    };
  }).filter(Boolean);

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

  // Event listeners
  gridItems.forEach((item, idx) => item.addEventListener('click', e => {
    e.preventDefault();
    open(idx);
  }));

  if (lightboxClose) lightboxClose.addEventListener('click', close);
  if (lightboxPrev) lightboxPrev.addEventListener('click', e => { e.stopPropagation(); prev(); });
  if (lightboxNext) lightboxNext.addEventListener('click', e => { e.stopPropagation(); next(); });
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', e => {
    if (lightbox.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    }
  });
}

// ======== Initialize ========
document.addEventListener('DOMContentLoaded', async () => {
  await imageLoader.loadImages();
  if (!imageLoader.loaded) return;

  populatePortfolioGrid();
  updateHeroImage();
  updateAboutImage();
  initLightbox();

  console.log('Portfolio images loaded from JSON');
});

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageLoader;
}

