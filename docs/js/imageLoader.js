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
      const jsonPath = '../data/images.json';
      const response = await fetch(jsonPath);
      if (!response.ok) {
        console.warn('Could not load images.json, using fallback images');
        return null;
      }
      this.images = await response.json();
      this.loaded=true;
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

  if (imageLoader.loaded) {
    updateHeroImage();
    updateAboutImage();
  }
});

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageLoader;
}
