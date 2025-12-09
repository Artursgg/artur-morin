/**
 * Portfolio Image Loader
 * Dynamically populates the portfolio grid from images.json
 * Automatically loads images from all categories and displays them in the grid
 */

(function() {
  'use strict';

  const portfolioGrid = document.querySelector('.portfolio-grid-6x6');
  if (!portfolioGrid) return;

  let allPortfolioImages = [];
  let isLoading = false;

  /**
   * Load images from images.json
   */
  async function loadPortfolioImages() {
    if (isLoading) return;
    isLoading = true;

    try {
      const response = await fetch('../data/images.json');
      if (!response.ok) {
        console.warn('Could not load images.json, using existing grid items');
        isLoading = false;
        return;
      }

      const data = await response.json();
      const portfolio = data.portfolio || {};

      // Collect all images from all categories
      allPortfolioImages = [];
      
      Object.keys(portfolio).forEach(category => {
        const categoryImages = portfolio[category] || [];
        if (Array.isArray(categoryImages)) {
          categoryImages.forEach(image => {
            if (image && image.thumbnail && image.full) {
              allPortfolioImages.push({
                thumbnail: image.thumbnail,
                full: image.full,
                alt: image.alt || image.title || `${category} photography`,
                category: category,
                title: image.title || null
              });
            }
          });
        }
      });

      // Images are already sorted by newest first in images.json
      // No need to shuffle - maintain the order from JSON

      // Populate grid
      populateGrid();

    } catch (error) {
      console.error('Error loading portfolio images:', error);
    } finally {
      isLoading = false;
    }
  }

  /**
   * Shuffle array for random order
   */
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Populate the grid with images
   */
  function populateGrid() {
    if (!portfolioGrid || allPortfolioImages.length === 0) {
      console.warn('No portfolio images to display');
      return;
    }

    // Clear existing grid items (keep structure if needed)
    const existingItems = portfolioGrid.querySelectorAll('.grid-item');
    const maxItems = 36; // 6x6 grid
    const itemsToShow = Math.min(allPortfolioImages.length, maxItems);

    // Update existing items or create new ones
    existingItems.forEach((item, index) => {
      if (index < itemsToShow) {
        const image = allPortfolioImages[index];
        const img = item.querySelector('img');
        
        if (img) {
          // Update existing image
          img.src = image.thumbnail;
          img.alt = image.alt;
          img.setAttribute('data-src', image.full);
          img.setAttribute('loading', 'lazy');
        } else {
          // Create new image if doesn't exist
          const newImg = document.createElement('img');
          newImg.src = image.thumbnail;
          newImg.alt = image.alt;
          newImg.setAttribute('data-src', image.full);
          newImg.setAttribute('loading', 'lazy');
          item.appendChild(newImg);
        }
        
        // Make item visible
        item.style.display = '';
      } else {
        // Hide extra items if we have fewer images than grid slots
        item.style.display = 'none';
      }
    });

    // If we need more items than exist, create them
    if (itemsToShow > existingItems.length) {
      for (let i = existingItems.length; i < itemsToShow; i++) {
        const image = allPortfolioImages[i];
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        
        const img = document.createElement('img');
        img.src = image.thumbnail;
        img.alt = image.alt;
        img.setAttribute('data-src', image.full);
        img.setAttribute('loading', 'lazy');
        
        gridItem.appendChild(img);
        portfolioGrid.appendChild(gridItem);
      }
    }

    // Re-initialize lightbox after images are loaded
    if (window.initPortfolioLightbox) {
      setTimeout(() => {
        window.initPortfolioLightbox();
      }, 100);
    }
  }

  /**
   * Initialize portfolio loader
   */
  function init() {
    // Load images when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadPortfolioImages);
    } else {
      loadPortfolioImages();
    }
  }

  // Start initialization
  init();

  // Export for external use if needed
  window.portfolioLoader = {
    reload: loadPortfolioImages,
    getImages: () => allPortfolioImages
  };
})();

