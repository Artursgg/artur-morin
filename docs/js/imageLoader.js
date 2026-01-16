// Image Loader - Manages portfolio images from JSON data
// Works with data/images.json relative to docs/index.html

class ImageLoader {
  constructor() {
    this.images = null;
    this.loaded = false;
  }

  // Load images from JSON
  async loadImages() {
    try {
      // Relative path from docs/index.html
      const jsonPath = 'data/images.json';
      const response = await fetch(jsonPath);
      if (!response.ok) {
        console.warn('Could not load images.json, using fallback images');
        return null;
      }
      this.images = await response.json();
      this.loaded = true;
      return this.images;
    } catch (error) {
      console.warn('Error loading images:', error);
      return null;
    }
  }

  // Get images from a specific category or all categories
  getPortfolioImages(category = null) {
    if (!this.loaded || !this.images) return [];

    if (category) {
      return this.images.portfolio[category] || [];
    }

    // Get all images from all categories
    const allImages = [];
    Object.keys(this.images.portfolio).forEach(cat => {
      if (Array.isArray(this.images.portfolio[cat])) {
        allImages.push(...this.images.portfolio[cat]);
      }
    });
    return allImages;
  }

  // Get hero image
  getHeroImage() {
    return this.images?.hero?.featured || null;
  }

  // Get about image
  getAboutImage() {
    return this.images?.about?.portrait || null;
  }
}

// Initialize image loader
const imageLoader = new ImageLoader();

// Populate portfolio grid (work-grid)
function populatePortfolioGrid() {
  const workGrid = document.querySelector('.work-grid');
  if (!workGrid || !imageLoader.loaded) return;

  const workCards = Array.from(workGrid.querySelectorAll('.work-card'));
  let cardIndex = 0;

  // Loop through all categories
  Object.keys(imageLoader.images.portfolio).forEach(category => {
    const images = imageLoader.getPortfolioImages(category);

    images.forEach(image => {
      if (cardIndex >= workCards.length) return;

      const workCard = workCards[cardIndex];
      const img = workCard.querySelector('img');
      if (img && image.thumbnail) {
        const testImg = new Image();
        testImg.onload = () => {
          img.src = image.thumbnail;
          img.alt = image.title || img.alt;
        };
        testImg.src = image.thumbnail;
      }

      const title = workCard.querySelector('h3');
      if (title) title.textContent = image.title || '';

      const description = workCard.querySelector('.work-card-info p');
      if (description) description.textContent = image.description || '';

      const categorySpan = workCard.querySelector('.work-category');
      if (categorySpan) categorySpan.textContent = category;

      cardIndex++;
    });
  });
}

// Populate dedicated portfolio page grid (6x6)
function populatePortfolioPageGrid() {
  const portfolioGrid = document.querySelector('.portfolio-grid-6x6');
  if (!portfolioGrid || !imageLoader.loaded || !imageLoader.images) return;

  const gridItems = Array.from(portfolioGrid.querySelectorAll('.grid-item'));
  if (!gridItems.length) return;

  const allImages = imageLoader.getPortfolioImages();
  if (!allImages.length) return;

  const maxItems = Math.min(gridItems.length, allImages.length);

  for (let i = 0; i < maxItems; i++) {
    const item = gridItems[i];
    const image = allImages[i];
    if (!image || !image.thumbnail || !image.full) continue;

    let img = item.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      item.appendChild(img);
    }

    // Set thumbnail as src
    img.src = image.thumbnail;
    img.alt = image.alt || image.title || 'Portfolio image';
    // Set full image path in data attribute for lightbox
    img.setAttribute('data-src', image.full);
    img.setAttribute('loading', 'lazy');

    item.style.display = ''; // ensure visible
  }

  // Hide extra placeholders if fewer images
  for (let i = maxItems; i < gridItems.length; i++) {
    gridItems[i].style.display = 'none';
  }
}

// Update hero image
function updateHeroImage() {
  const heroImage = imageLoader.getHeroImage();
  if (!heroImage) return;

  const heroImgs = document.querySelectorAll('.hero-image img, .image-frame img, .hero-media img');
  heroImgs.forEach(heroImg => {
    const testImg = new Image();
    testImg.onload = () => heroImg.src = heroImage;
    testImg.src = heroImage;
  });
}

// Update about image
function updateAboutImage() {
  const aboutImage = imageLoader.getAboutImage();
  if (!aboutImage) return;

  const aboutImgs = document.querySelectorAll('.about-image img, .about-hero-image img');
  aboutImgs.forEach(aboutImg => {
    const testImg = new Image();
    testImg.onload = () => aboutImg.src = aboutImage;
    testImg.src = aboutImage;
  });
}

// Load images on page load
document.addEventListener('DOMContentLoaded', async () => {
  await imageLoader.loadImages();

  console.log('Loaded images:', imageLoader.images);

  if (imageLoader.loaded) {
    populatePortfolioGrid();
    populatePortfolioPageGrid();
    updateHeroImage();
    updateAboutImage();
  }
});

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageLoader;
}
