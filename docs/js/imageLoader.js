// Image Loader - manages portfolio images from JSON
class ImageLoader {
  constructor(jsonPath = 'assets/data/images.json') {
    this.jsonPath = jsonPath;
    this.images = null;
    this.loaded = false;
  }

  async loadImages() {
    try {
      const response = await fetch(this.jsonPath);
      if (!response.ok) {
        console.warn('Could not load images.json');
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

  getPortfolioImages(category = null) {
    if (!this.loaded || !this.images) return [];
    if (category) return this.images.portfolio[category] || [];
    return Object.values(this.images.portfolio).flat();
  }

  getHeroImage() {
    return this.images?.hero?.featured || null;
  }

  getAboutImage() {
    return this.images?.about?.portrait || null;
  }
}

const imageLoader = new ImageLoader();

// Populate portfolio grid safely
async function populatePortfolioGrid() {
  const grid = document.querySelector('.portfolio-grid-6x6');
  if (!grid) return;

  await imageLoader.loadImages();
  if (!imageLoader.loaded) return;

  const gridItems = Array.from(grid.querySelectorAll('.grid-item'));
  const allImages = imageLoader.getPortfolioImages();
  const maxItems = Math.min(gridItems.length, allImages.length);

  for (let i = 0; i < maxItems; i++) {
    const item = gridItems[i];
    const image = allImages[i];
    if (!image) continue;

    let img = item.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      item.appendChild(img);
    }

    img.src = image.thumbnail;
    img.alt = image.alt || image.title || 'Portfolio image';
    img.dataset.full = image.full;   // Full image for lightbox
    img.dataset.title = image.title || '';

    item.style.display = ''; // ensure visible
  }

  for (let i = maxItems; i < gridItems.length; i++) {
    gridItems[i].style.display = 'none'; // hide extra placeholders
  }
}

document.addEventListener('DOMContentLoaded', populatePortfolioGrid);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageLoader;
}
