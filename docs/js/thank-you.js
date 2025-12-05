/**
 * Thank You Page - Specific JavaScript
 * =====================================
 */

(function() {
  'use strict';
  
  // Shutter animation on load
  window.addEventListener('load', () => {
    const shutter = document.getElementById('shutter');
    const flash = document.getElementById('flash');
    
    // Trigger shutter and flash
    setTimeout(() => {
      shutter.classList.add('active');
      flash.style.animation = 'none';
      setTimeout(() => {
        flash.style.animation = 'flash 0.3s ease-out';
      }, 10);
    }, 100);
    
    // Remove shutter after animation
    setTimeout(() => {
      shutter.style.display = 'none';
    }, 700);
  });
  
  // Create floating particles
  function createParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.bottom = '-10px';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
      container.appendChild(particle);
    }
  }
  
  // Initialize particles when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createParticles);
  } else {
    createParticles();
  }
  
  // Track thank you page view
  if (window.dataLayer) {
    window.dataLayer.push({
      'event': 'thank_you_page_view',
      'page_type': 'form_submission_success'
    });
  }
})();

