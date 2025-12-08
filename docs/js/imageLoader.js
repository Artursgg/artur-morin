// Image Loader - Manages portfolio images from JSON data
// This allows you to manage images through a simple JSON file instead of hardcoding in HTML

class ImageLoader {
  constructor() {
    this.images = null;
    this.loaded = false;
  }

  async loadImages() {
    try {
      // Use absolute path from root to work from any page location
      // Calculate relative path from current page to data/images.json
      const pathname = window.location.pathname;
      const pathParts = pathname.split('/').filter(Boolean);
      
      // Remove the last part (filename or empty if directory)
      // Count how many levels deep we are
      const depth = pathParts.length > 0 && !pathParts[pathParts.length - 1].includes('.html') 
        ? pathParts.length 
        : pathParts.length - 1;
      
      // Build relative path: go up 'depth' levels, then into data/
      const jsonPath = depth > 0 
        ? '../'.repeat(depth) + 'data/images.json'
        : 'data/images.json';
      
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
      // Don't break the site if JSON fails - use existing images as fallback
      return null;
    }
  }

  getPortfolioImages(category = null) {
    if (!this.loaded || !this.images) return [];

    if (category) {
      return this.images.portfolio[category] || [];
    }

    // Return all images from all categories
    const allImages = [];
    Object.keys(this.images.portfolio).forEach(cat => {
      if (this.images.portfolio[cat] && Array.isArray(this.images.portfolio[cat])) {
        allImages.push(...this.images.portfolio[cat]);
      }
    });
    return allImages;
  }

  getImageById(id) {
    if (!this.loaded || !this.images) return null;

    for (const category in this.images.portfolio) {
      if (this.images.portfolio[category] && Array.isArray(this.images.portfolio[category])) {
        const image = this.images.portfolio[category].find(img => img.id === id);
        if (image) return image;
      }
    }
    return null;
  }

  getHeroImage() {
    return this.images?.hero?.featured || null;
  }

  getAboutImage() {
    return this.images?.about?.portrait || null;
  }
}

// Initialize image loader
const imageLoader = new ImageLoader();

// Function to populate portfolio grid
function populatePortfolioGrid() {
  const workGrid = document.querySelector('.work-grid');
  if (!workGrid || !imageLoader.loaded) return;

  const categories = ['editorial', 'fashion', 'landscape', 'portrait', 'commercial'];
  const workCards = Array.from(workGrid.querySelectorAll('.work-card'));
  
  categories.forEach((category, index) => {
    const images = imageLoader.getPortfolioImages(category);
    if (images.length > 0 && workCards[index]) {
      const firstImage = images[0];
      const workCard = workCards[index];
      
      // Update image
      const img = workCard.querySelector('img');
      if (img && firstImage.thumbnail) {
        // Only update if image exists and path is valid
        const testImg = new Image();
        testImg.onload = () => {
          img.src = firstImage.thumbnail;
          img.alt = firstImage.title || img.alt;
        };
        testImg.onerror = () => {
          // Keep existing image if new one doesn't exist
          // Silently fail - image not found
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
      if (heroImg) {
        const testImg = new Image();
        testImg.onload = () => {
          heroImg.src = heroImage;
        };
        testImg.onerror = () => {
          // Silently fail - hero image not found
        };
        testImg.src = heroImage;
      }
    });
  }
}

// Update about image
function updateAboutImage() {
  const aboutImage = imageLoader.getAboutImage();
  if (aboutImage) {
    const aboutImgs = document.querySelectorAll('.about-image img, .about-hero-image img');
    aboutImgs.forEach(aboutImg => {
      if (aboutImg) {
        const testImg = new Image();
        testImg.onload = () => {
          aboutImg.src = aboutImage;
        };
        testImg.onerror = () => {
          // Silently fail - about image not found
        };
        testImg.src = aboutImage;
      }
    });
  }
}

// Load images on page load
document.addEventListener('DOMContentLoaded', async () => {
  await imageLoader.loadImages();
  
  // Only update if images were loaded successfully
  if (imageLoader.loaded) {
    // Populate portfolio grid
    populatePortfolioGrid();
    
    // Update hero image
    updateHeroImage();
    
    // Update about image
    updateAboutImage();
  }
});

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageLoader;
}

