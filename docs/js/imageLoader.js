// Image Loader - Manages portfolio images from JSON data

class ImageLoader {
  constructor() {
    this.images = null;
    this.loaded = false;
  }

  // Load images from JSON
  async loadImages() {
    try {
      const jsonPath = '../data/images.json'; // relative from portfolio/index.html
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

  // Get images from a specific category or all
  getPortfolioImages(category = null) {
    if (!this.loaded || !this.images) return [];

    if (category) {
      return this.images.portfolio[category] || [];
    }

    // return all images
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

// Populate portfolio grid
function populatePortfolioGrid() {
  const workGrid = document.querySelector('.work-grid');
  if (!workGrid || !imageLoader.loaded) return;

  const categories = [
    'editorial', 'fashion', 'landscape', 'portrait',
    'commercial', 'documentary', 'other', 'cars', 'products'
  ];

  const workCards = Array.from(workGrid.querySelectorAll('.work-card'));

  categories.forEach((category, index) => {
    const images = imageLoader.getPortfolioImages(category);
    if (images.length > 0 && workCards[index]) {
      const firstImage = images[0];
      const workCard = workCards[index];

      // Update image
      const img = workCard.querySelector('img');
      if (img && firstImage.thumbnail) {
        const testImg = new Image();
        testImg.onload = () => {
          img.src = firstImage.thumbnail;
          img.alt = firstImage.title || img.alt;
        };
        testImg.src = firstImage.thumbnail;
      }

      // Update title
      const title = workCard.querySelector('h3');
      if (title && firstImage.title) {
        title.textContent = firstImage.title;
      }

      // Update description
      const description = workCard.querySelector('.work-card-info p');
      if (description && firstImage.description) {
        description.textContent = firstImage.description;
      }

      // Update category
      const categorySpan = workCard.querySelector('.work-category');
      if (categorySpan && firstImage.category) {
        categorySpan.textContent = firstImage.category;
      }
    }
  });
}

// Update hero image
function updateHeroImage() {
  const heroImage = imageLoader.getHeroImage();
  if (heroImage) {
    const heroImgs = document.querySelectorAll('.hero-image img, .image-frame img, .hero-media img');
    heroImgs.forEach(heroImg => {
      const testImg = new Image();
      testImg.onload = () => heroImg.src = heroImage;
      testImg.src = heroImage;
    });
  }
}

// Update about image
function updateAboutImage() {
  const aboutImage = imageLoader.getAboutImage();
  if (aboutImage) {
    const aboutImgs = document.querySelectorAll('.about-image img, .about-hero-image img');
    aboutImgs.forEach(aboutImg => {
      const testImg = new Image();
      testImg.onload = () => aboutImg.src = aboutImage;
      testImg.src = aboutImage;
    });
  }
}

// Load images on page load
document.addEventListener('DOMContentLoaded', async () => {
  await imageLoader.loadImages();

  console.log('Loaded images:', imageLoader.images);

  if (imageLoader.loaded) {
    populatePortfolioGrid();
    updateHeroImage();
    updateAboutImage();
  }
});

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageLoader;
}
