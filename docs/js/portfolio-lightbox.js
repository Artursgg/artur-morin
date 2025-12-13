/**
 * Portfolio Lightbox - Image Viewer
 * Opens images in a full-screen lightbox modal
 */

(function() {
  'use strict';
  
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox?.querySelector('.lightbox-image');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  const lightboxPrev = lightbox?.querySelector('.lightbox-prev');
  const lightboxNext = lightbox?.querySelector('.lightbox-next');
  const gridItems = document.querySelectorAll('.portfolio-grid-6x6 .grid-item');
  
  if (!lightbox || !lightboxImage) return;
  
  let currentImages = [];
  let currentIndex = 0;
  
  // Collect all images from the grid
  function collectImages() {
    currentImages = Array.from(gridItems).map(item => {
      const img = item.querySelector('img');
      return img ? {
        src: img.src,
        alt: img.alt || 'Portfolio image'
      } : null;
    }).filter(Boolean);
  }
  
  // Open lightbox with specific image
  function openLightbox(index) {
    if (index < 0 || index >= currentImages.length) return;
    
    currentIndex = index;
    const image = currentImages[currentIndex];
    
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    updateNavigationButtons();
  }
  
  // Close lightbox
  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scrolling
    lightboxImage.src = '';
  }
  
  // Navigate to previous image
  function prevImage() {
    if (currentIndex > 0) {
      openLightbox(currentIndex - 1);
    }
  }
  
  // Navigate to next image
  function nextImage() {
    if (currentIndex < currentImages.length - 1) {
      openLightbox(currentIndex + 1);
    }
  }
  
  // Update navigation button states
  function updateNavigationButtons() {
    if (lightboxPrev) {
      lightboxPrev.disabled = currentIndex === 0;
    }
    if (lightboxNext) {
      lightboxNext.disabled = currentIndex === currentImages.length - 1;
    }
  }
  
  // Initialize: collect images and add click handlers
  function init() {
    collectImages();
    
    // Add click handlers to grid items
    gridItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(index);
      });
    });
    
    // Close button
    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }
    
    // Previous button
    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        prevImage();
      });
    }
    
    // Next button
    if (lightboxNext) {
      lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
      });
    }
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (lightbox.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowLeft') {
          prevImage();
        } else if (e.key === 'ArrowRight') {
          nextImage();
        }
      }
    });
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

