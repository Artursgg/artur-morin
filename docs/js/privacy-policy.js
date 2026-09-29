/**
 * Privacy Policy Page - Specific JavaScript
 * ==========================================
 */

// =============================================================================
// Wrap "Opening new experiences" letters for outline animation (near AM box)
// =============================================================================
function wrapTaglineLetters() {
  const taglineElements = document.querySelectorAll('.footer-tagline-mobile, .footer-tagline-desktop-inline');
  taglineElements.forEach((element) => {
    // Skip if already processed
    if (element.querySelector('.letter')) return;
    
    const text = element.textContent.trim();
    const letters = text.split('');
    element.textContent = '';
    
    letters.forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
      span.setAttribute('data-char', char === ' ' ? '\u00A0' : char);
      span.style.setProperty('--letter-index', index);
      element.appendChild(span);
    });
  });
}

// Initialize after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wrapTaglineLetters);
} else {
  wrapTaglineLetters();
}

// Logo (AM button) behaviour lives in js/logo.js

// =============================================================================
// Page Loaded Class
// =============================================================================
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

// Back/forward cache: the logo state is handled by js/logo.js

// =============================================================================
// Spotlight Effect for "Let's Talk" Button
// WW2 Projector Spotlight - activates when mouse is near the button
// =============================================================================
(function() {
  const navCta = document.querySelector('.nav-cta');
  if (!navCta) return;

  let spotlightPosition = { x: 50, y: 50 };
  let spotlightOpacity = 0;
  let opacityRef = 0;
  const proximityRadius = 200;
  let animationFrameRef = null;

  // Calculate distance from mouse to button center
  function getDistanceToButton(mouseX, mouseY) {
    const rect = navCta.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;
    const dx = mouseX - buttonCenterX;
    const dy = mouseY - buttonCenterY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Global mouse move handler
  function handleGlobalMouseMove(e) {
    if (animationFrameRef) {
      cancelAnimationFrame(animationFrameRef);
    }

    animationFrameRef = requestAnimationFrame(() => {
      const rect = navCta.getBoundingClientRect();
      const distance = getDistanceToButton(e.clientX, e.clientY);
      
      // Calculate position relative to button (match CSS extension: 300px total)
      const extension = 150;
      const extendedLeft = rect.left - extension;
      const extendedTop = rect.top - extension;
      const extendedWidth = rect.width + (extension * 2);
      const extendedHeight = rect.height + (extension * 2);
      
      const relativeX = e.clientX - extendedLeft;
      const relativeY = e.clientY - extendedTop;
      
      const x = Math.max(0, Math.min(100, (relativeX / extendedWidth) * 100));
      const y = Math.max(0, Math.min(100, (relativeY / extendedHeight) * 100));

      spotlightPosition = { x, y };

      // Activate spotlight if mouse is within proximity radius
      if (distance <= proximityRadius) {
        const proximityRatio = 1 - (distance / proximityRadius);
        const opacity = Math.max(0, Math.min(1, proximityRatio * 1.2));
        spotlightOpacity = opacity;
        opacityRef = opacity;
      } else {
        spotlightOpacity = 0;
        opacityRef = 0;
      }

      // Update CSS variables
      navCta.style.setProperty('--spotlight-x', `${spotlightPosition.x}%`);
      navCta.style.setProperty('--spotlight-y', `${spotlightPosition.y}%`);
      navCta.style.setProperty('--spotlight-opacity', spotlightOpacity);
    });
  }

  // Mouse enter - ensure spotlight is active
  navCta.addEventListener('mouseenter', () => {
    spotlightOpacity = 1;
    opacityRef = 1;
    navCta.style.setProperty('--spotlight-opacity', '1');
  });

  // Mouse leave - fade out smoothly
  navCta.addEventListener('mouseleave', () => {
    const startOpacity = opacityRef;
    const duration = 300;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newOpacity = startOpacity * (1 - easeOut);
      spotlightOpacity = newOpacity;
      opacityRef = newOpacity;
      navCta.style.setProperty('--spotlight-opacity', newOpacity);

      if (progress < 1) {
        animationFrameRef = requestAnimationFrame(animate);
      }
    }

    animationFrameRef = requestAnimationFrame(animate);
  });

  // Set up global mouse tracking
  window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });

  // Mobile CTA button uses simple CSS glow effect (no spotlight)
})();

// =============================================================================
// Mobile Menu Toggle
// =============================================================================
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
const navLinks = document.querySelectorAll('#primary-nav a');

if (mobileMenuToggle && primaryNav) {
  const navOverlay = document.querySelector('.nav-overlay');
  
  // Helper function to remove focus from nav elements and make them non-focusable
  function removeNavFocus() {
    // Check if any element inside nav has focus and blur it
    const activeElement = document.activeElement;
    if (activeElement && primaryNav.contains(activeElement)) {
      activeElement.blur();
    }
    
    // Make all links and buttons non-focusable
    const navLinks = primaryNav.querySelectorAll('a, button');
    navLinks.forEach(link => {
      link.setAttribute('tabindex', '-1');
    });
  }
  
  // Initialize menu state - hidden on mobile by default
  if (window.innerWidth <= 768) {
    primaryNav.setAttribute('aria-hidden', 'true');
    if (navOverlay) navOverlay.setAttribute('aria-hidden', 'true');
    // Remove focus and make links non-focusable when hidden (accessibility fix)
    removeNavFocus();
  }
  
  function closeMenu() {
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    
    // Remove focus BEFORE setting aria-hidden (accessibility fix)
    removeNavFocus();
    
    primaryNav.setAttribute('aria-hidden', 'true');
    if (navOverlay) navOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  
  function openMenu() {
    mobileMenuToggle.setAttribute('aria-expanded', 'true');
    primaryNav.setAttribute('aria-hidden', 'false');
    if (navOverlay) navOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Restore focusability when menu is open (accessibility fix)
    const navLinks = primaryNav.querySelectorAll('a, button');
    navLinks.forEach(link => {
      link.removeAttribute('tabindex');
    });
  }
  
  mobileMenuToggle.addEventListener('click', () => {
    const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });
  
  // Close menu when clicking overlay
  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }
  
  // Close menu when clicking a link
  // Desktop: close immediately
  // Mobile/tablet: handled separately
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Only close immediately on desktop
      if (window.innerWidth > 1024) {
        closeMenu();
      }
      // Mobile/tablet: close menu when link is clicked
      if (window.innerWidth <= 1024) {
        closeMenu();
      }
    });
  });
  
  // Close menu when clicking mobile CTA button
  const mobileCta = document.querySelector('.nav-cta-mobile');
  if (mobileCta) {
    mobileCta.addEventListener('click', closeMenu);
  }

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      mobileMenuToggle.focus();
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      primaryNav.removeAttribute('aria-hidden');
      if (navOverlay) navOverlay.setAttribute('aria-hidden', 'true');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      // Restore focusability on desktop
      const navLinks = primaryNav.querySelectorAll('a, button');
      navLinks.forEach(link => {
        link.removeAttribute('tabindex');
      });
    } else {
      // On mobile, ensure menu is hidden
      if (primaryNav.getAttribute('aria-hidden') !== 'true') {
        closeMenu();
      }
    }
  });
}

