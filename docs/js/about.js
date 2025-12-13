/**
 * Artur Morin About Page - Interactions
 * ======================================
 * Parallax, reveal animations, and smooth interactions for about page
 */

// =============================================================================
// Page Loader - Hide when page is fully loaded
// =============================================================================
(function() {
  'use strict';
  
  function hideLoader() {
    const pageLoader = document.getElementById("page-loader");
    if (pageLoader && !pageLoader.classList.contains("hidden")) {
      pageLoader.classList.add("hidden");
    }
  }

  // Strategy 1: Immediate check if already loaded
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(hideLoader, 100);
  }

  // Strategy 2: Wait for full page load
  window.addEventListener("load", function() {
    setTimeout(hideLoader, 100);
  });

  // Strategy 3: Also try on DOMContentLoaded
  // Check if DOMContentLoaded has already fired
  if (document.readyState === "loading") {
    // DOMContentLoaded hasn't fired yet, add listener
  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(hideLoader, 500);
  });
  } else {
    // DOMContentLoaded has already fired, call hideLoader directly
    setTimeout(hideLoader, 500);
  }

  // Strategy 4: Aggressive fallback - force hide after 1 second
  setTimeout(hideLoader, 1000);
  
  // Strategy 5: Final fallback - force hide after 2 seconds
  setTimeout(hideLoader, 2000);
})();

// =============================================================================
// Camera Settings Rotation - Rotate through different camera settings
// =============================================================================
(function() {
  'use strict';
  
  // Camera settings options (3 options for each field)
  const fNumbers = ['2.8', '4.0', '5.6'];
  const isoValues = ['400', '800', '1600'];
  const shutterValues = ['60', '125', '250'];
  
  let currentIndex = 0;
  
  function rotateCameraSettings() {
    const fNumberElement = document.querySelector('.f-number');
    const isoValueElement = document.querySelector('.iso-value');
    const shutterValueElement = document.querySelector('.shutter-value');
    
    if (!fNumberElement || !isoValueElement || !shutterValueElement) {
      return; // Elements not found, exit early
    }
    
    // Update to next index (cycle through 0, 1, 2)
    currentIndex = (currentIndex + 1) % fNumbers.length;
    
    // Update values with fade effect
    fNumberElement.style.opacity = '0';
    isoValueElement.style.opacity = '0';
    shutterValueElement.style.opacity = '0';
    
    setTimeout(() => {
      fNumberElement.textContent = fNumbers[currentIndex];
      isoValueElement.textContent = isoValues[currentIndex];
      shutterValueElement.textContent = shutterValues[currentIndex];
      
      fNumberElement.style.opacity = '1';
      isoValueElement.style.opacity = '1';
      shutterValueElement.style.opacity = '1';
    }, 200); // Half of transition time for smooth fade
  }
  
  // Start rotation when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
      // Rotate every 2 seconds
      setInterval(rotateCameraSettings, 2000);
    }
  });
})();

// Smooth scrolling is handled by CSS scroll-behavior: smooth
// No custom JavaScript needed for better performance

// =============================================================================
// Enhanced Parallax Effect with Smooth Easing
// Uses requestAnimationFrame for smooth 60fps animations and easing for natural motion.
// =============================================================================
let parallaxSections = [];
let lastScrollTop = 0;
let parallaxVelocity = 0;

// Initialize parallax sections - re-query on page load to ensure DOM is ready
function initParallaxSections() {
  parallaxSections = document.querySelectorAll('.parallax');
  // Initialize lastScrollTop to current scroll position to prevent jumps
  lastScrollTop = window.scrollY || 0;
  parallaxVelocity = 0;
  
  // Disable transitions on all parallax elements for immediate response
  parallaxSections.forEach(section => {
    section.style.transition = 'none';
  });
}

// Easing function for smooth parallax motion (ease-out cubic)
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function updateParallax() {
  // Early return if no parallax sections found (prevents errors during initialization)
  if (!parallaxSections || parallaxSections.length === 0) {
    return;
  }
  
  const scrollTop = window.scrollY;
  const delta = scrollTop - lastScrollTop;
  
  // Calculate scroll velocity for dynamic effects
  parallaxVelocity = delta * 0.1 + parallaxVelocity * 0.9;
  
  parallaxSections.forEach((section) => {
    const speed = Number(section.dataset.speed || 0.1);
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionCenter = sectionTop + rect.height / 2;
    
    // Calculate distance from viewport center
    const distanceFromCenter = scrollTop + window.innerHeight / 2 - sectionCenter;
    const normalizedDistance = distanceFromCenter / window.innerHeight;
    
    // Apply easing for smoother motion
    const eased = easeOutCubic(Math.abs(normalizedDistance)) * Math.sign(normalizedDistance);
    
    // Calculate offset with velocity influence
    const baseOffset = eased * speed * 100;
    const velocityOffset = parallaxVelocity * speed * 0.5;
    const totalOffset = baseOffset + velocityOffset;
    
    // Clamp to prevent extreme movement
    const clamped = Math.max(-80, Math.min(80, totalOffset));
    
    // Apply with smooth transform - no transition for immediate response
    section.style.setProperty('--parallax-offset', `${clamped}px`);
    section.style.transform = `translateY(${clamped}px)`;
    section.style.transition = 'none'; // Always use immediate updates for smooth scrolling
  });
  
  lastScrollTop = scrollTop;
}

// Scroll handler - update parallax immediately for smooth scrolling
function onScroll() {
  // Update parallax immediately without throttling for smooth scrolling
  updateParallax();
}

// =============================================================================
// Enhanced Scroll Reveal Animation
// Uses IntersectionObserver with smooth staggered animations.
// Elements fade in and slide up with easing for natural motion.
// =============================================================================
const revealElements = document.querySelectorAll('.reveal');

// Helper function to check if element is in viewport (any part visible)
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  // Check if any part of element is visible in viewport
  return (
    rect.top < windowHeight &&
    rect.bottom > 0 &&
    rect.left < windowWidth &&
    rect.right > 0
  );
}

// Helper function to reveal element immediately
function revealElement(element, delay = 0) {
  setTimeout(() => {
    element.classList.add('visible');
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, delay);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Reduced stagger delays for faster loading
        const delay = entry.target.dataset.delay || (index % 3 * 50);
        revealElement(entry.target, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { 
    threshold: 0.1, // Reduced from 0.15 for earlier trigger
    rootMargin: '100px 0px 0px 0px' // Increased top margin to trigger earlier
  }
);

revealElements.forEach((el, index) => {
  // Stagger delays for philosophy, equipment, and awards grids
  if (el.closest('.philosophy-values') || el.closest('.equipment-grid') || el.closest('.awards-grid')) {
    el.dataset.delay = index * 50; // Reduced from 100ms to 50ms
  }
  
  // Sequential downward animation for timeline items
  if (el.closest('.timeline')) {
    const timelineItems = Array.from(el.closest('.timeline').querySelectorAll('.timeline-item'));
    const itemIndex = timelineItems.indexOf(el);
    el.dataset.delay = itemIndex * 350; // 350ms delay between each timeline item for slower sequential reveal
  }
  
  revealObserver.observe(el);
});

// Make elements visible immediately if they're already in viewport on page load
// This prevents slow loading on refresh when user is scrolled down
function checkInitialViewport() {
  revealElements.forEach((el) => {
    if (isInViewport(el) && !el.classList.contains('visible')) {
      const delay = el.dataset.delay || 0;
      revealElement(el, delay);
      revealObserver.unobserve(el);
    }
  });
}

// Check after page is fully loaded to ensure all elements are positioned correctly
window.addEventListener('load', () => {
  setTimeout(checkInitialViewport, 50);
});

// Also check on DOMContentLoaded for faster initial render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkInitialViewport, 100);
  });
} else {
  setTimeout(checkInitialViewport, 100);
}

// =============================================================================
// Navigation Background on Scroll
// Keep navigation background transparent for levitating effect
// =============================================================================
const nav = document.querySelector('.nav');

function updateNavBackground() {
  // Keep background transparent at all times for levitating effect
  if (nav) {
    nav.style.background = 'transparent';
    nav.style.backdropFilter = 'none';
  }
}

// =============================================================================
// Smooth Scroll for Anchor Links
// =============================================================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    
    // Skip if href is just "#" (scroll to top handled elsewhere)
    if (href === '#' || href === '#!') {
      return;
    }
    
    // Skip if it's the logo (handled separately)
    if (anchor.classList.contains('logo')) {
      return;
    }
    
    // Skip if it's a nav link and mobile menu is open (handled by mobile menu handler)
    const primaryNav = document.querySelector('#primary-nav');
    const isNavLink = anchor.closest('#primary-nav');
    if (isNavLink && primaryNav && primaryNav.getAttribute('aria-hidden') === 'false' && window.innerWidth <= 1024) {
      return; // Let mobile handler take care of it
    }
    
    const target = document.querySelector(href);
    if (target) {
      // Use CSS smooth scroll with proper offset for sticky header
      e.preventDefault();
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      // Use smooth scroll behavior (CSS handles the smoothness)
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  });
});

// =============================================================================
// Footer Year
// =============================================================================
const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// =============================================================================
// Handle scroll restoration
// =============================================================================
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'auto';
}

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
    
    // Ensure body can scroll on mobile - remove inline style and restore CSS
    document.body.style.overflow = '';
    document.body.style.overflowY = '';
    document.body.style.overflowX = '';
    
    // Force reflow to ensure styles apply
    void document.body.offsetHeight;
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
  
  // Close menu when clicking a link - handled by grid effect on mobile/tablet
  // Desktop: close immediately
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Only close immediately on desktop
      if (window.innerWidth > 1024) {
        closeMenu();
      }
      // Mobile/tablet: let grid effect handle it (don't close here to avoid conflicts)
    });
  });
  
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
      // Remove focus BEFORE setting aria-hidden (accessibility fix)
      removeNavFocus();
      primaryNav.setAttribute('aria-hidden', 'true');
      if (navOverlay) navOverlay.setAttribute('aria-hidden', 'true');
    }
  });
}

// =============================================================================
// Initialize
// =============================================================================
// Initialize parallax sections when DOM is ready to ensure elements exist
function initializePage() {
  initParallaxSections();
  updateParallax();
  updateNavBackground();
}

// Initialize immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Use requestAnimationFrame to ensure rendering is complete before initializing
    requestAnimationFrame(initializePage);
  });
} else {
  requestAnimationFrame(initializePage);
}

// Simple scroll handler - no custom smooth scroll, just parallax updates
window.addEventListener('scroll', () => {
  onScroll();
  updateNavBackground();
}, { passive: true });

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
// Interactive Navigation Grid Effect
// When clicking nav links on mobile/tablet, a photography grid box appears
// around the clicked link, creating a compelling visual effect.
// =============================================================================
(function() {
  'use strict';
  
  const navLinks = document.querySelectorAll('.nav ul a:not(.nav-cta-mobile)');
  const navGridOverlay = document.querySelector('.nav-grid-overlay');
  const navUl = document.querySelector('.nav ul');
  
  if (!navLinks.length || !navGridOverlay || !navUl) return;
  
  let currentAnimationFrame = null;
  let activeLink = null;
  const gridDistance = 25; // Distance from link for # pattern
  const animationDuration = 500; // Total animation duration (warp out + warp back in)
  const easingFunction = (t) => {
    // Custom easing: ease-out-cubic for smooth deceleration
    return 1 - Math.pow(1 - t, 3);
  };
  
  // Clear all grid lines and paths
  function clearGrid() {
    // Remove all lines and paths but keep defs
    const existingLines = navGridOverlay.querySelectorAll('line, path');
    existingLines.forEach(line => line.remove());
    
    // Reset overlay state
    navGridOverlay.style.opacity = '';
  }
  
  // Calculate positions for mobile/tablet menu (viewport-relative)
  function getMobileCornerPositions(linkRect) {
    // Get the exact center of the clicked link in viewport coordinates
    const linkCenterX = linkRect.left + linkRect.width / 2;
    const linkCenterY = linkRect.top + linkRect.height / 2;
    
    // Use viewport dimensions for mobile menu
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate corners of the grid area (25px from link center)
    const corners = [
      // Top-left corner
      {
        x: Math.max(0, linkCenterX - gridDistance),
        y: Math.max(0, linkCenterY - gridDistance)
      },
      // Top-right corner
      {
        x: Math.min(viewportWidth, linkCenterX + gridDistance),
        y: Math.max(0, linkCenterY - gridDistance)
      },
      // Bottom-left corner
      {
        x: Math.max(0, linkCenterX - gridDistance),
        y: Math.min(viewportHeight, linkCenterY + gridDistance)
      },
      // Bottom-right corner
      {
        x: Math.min(viewportWidth, linkCenterX + gridDistance),
        y: Math.min(viewportHeight, linkCenterY + gridDistance)
      }
    ];
    
    return {
      center: { x: linkCenterX, y: linkCenterY }, // Viewport coordinates
      corners: corners,
      bounds: {
        minX: Math.min(...corners.map(c => c.x)),
        maxX: Math.max(...corners.map(c => c.x)),
        minY: Math.min(...corners.map(c => c.y)),
        maxY: Math.max(...corners.map(c => c.y))
      }
    };
  }
  
  // Create # (hash) pattern around the text box - cleaner design
  function createMobileGridLines(positions, progress = 1, viewportWidth, viewportHeight) {
    const { center } = positions;
    
    // Clear previous lines
    const existingLines = navGridOverlay.querySelectorAll('line, path');
    existingLines.forEach(line => line.remove());
    
    // Get actual link dimensions for better accuracy
    const linkElement = activeLink;
    let boxWidth = 80;
    let boxHeight = 30;
    
    if (linkElement) {
      const linkRect = linkElement.getBoundingClientRect();
      boxWidth = linkRect.width || 80;
      boxHeight = linkRect.height || 30;
    }
    
    const spread = gridDistance * progress; // How far the # extends from the box
    
    // Create # pattern with cleaner, more refined lines
    // Top horizontal line
    const topLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    topLine.setAttribute('x1', center.x - boxWidth/2 - spread);
    topLine.setAttribute('y1', center.y - boxHeight/2 - spread);
    topLine.setAttribute('x2', center.x + boxWidth/2 + spread);
    topLine.setAttribute('y2', center.y - boxHeight/2 - spread);
    topLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.9)');
    topLine.setAttribute('stroke-width', '1.5');
    topLine.setAttribute('stroke-linecap', 'round');
    topLine.style.opacity = progress;
    topLine.style.filter = 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.7))';
    navGridOverlay.appendChild(topLine);
    
    // Bottom horizontal line
    const bottomLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    bottomLine.setAttribute('x1', center.x - boxWidth/2 - spread);
    bottomLine.setAttribute('y1', center.y + boxHeight/2 + spread);
    bottomLine.setAttribute('x2', center.x + boxWidth/2 + spread);
    bottomLine.setAttribute('y2', center.y + boxHeight/2 + spread);
    bottomLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.9)');
    bottomLine.setAttribute('stroke-width', '1.5');
    bottomLine.setAttribute('stroke-linecap', 'round');
    bottomLine.style.opacity = progress;
    bottomLine.style.filter = 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.7))';
    navGridOverlay.appendChild(bottomLine);
    
    // Left vertical line
    const leftLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leftLine.setAttribute('x1', center.x - boxWidth/2 - spread);
    leftLine.setAttribute('y1', center.y - boxHeight/2 - spread);
    leftLine.setAttribute('x2', center.x - boxWidth/2 - spread);
    leftLine.setAttribute('y2', center.y + boxHeight/2 + spread);
    leftLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.9)');
    leftLine.setAttribute('stroke-width', '1.5');
    leftLine.setAttribute('stroke-linecap', 'round');
    leftLine.style.opacity = progress;
    leftLine.style.filter = 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.7))';
    navGridOverlay.appendChild(leftLine);
    
    // Right vertical line
    const rightLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rightLine.setAttribute('x1', center.x + boxWidth/2 + spread);
    rightLine.setAttribute('y1', center.y - boxHeight/2 - spread);
    rightLine.setAttribute('x2', center.x + boxWidth/2 + spread);
    rightLine.setAttribute('y2', center.y + boxHeight/2 + spread);
    rightLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.9)');
    rightLine.setAttribute('stroke-width', '1.5');
    rightLine.setAttribute('stroke-linecap', 'round');
    rightLine.style.opacity = progress;
    rightLine.style.filter = 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.7))';
    navGridOverlay.appendChild(rightLine);
    
    // Middle horizontal line (crossing through center)
    const middleHLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    middleHLine.setAttribute('x1', center.x - boxWidth/2 - spread);
    middleHLine.setAttribute('y1', center.y);
    middleHLine.setAttribute('x2', center.x + boxWidth/2 + spread);
    middleHLine.setAttribute('y2', center.y);
    middleHLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.7)');
    middleHLine.setAttribute('stroke-width', '1');
    middleHLine.setAttribute('stroke-linecap', 'round');
    middleHLine.style.opacity = progress * 0.7;
    middleHLine.style.filter = 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))';
    navGridOverlay.appendChild(middleHLine);
    
    // Middle vertical line (crossing through center)
    const middleVLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    middleVLine.setAttribute('x1', center.x);
    middleVLine.setAttribute('y1', center.y - boxHeight/2 - spread);
    middleVLine.setAttribute('x2', center.x);
    middleVLine.setAttribute('y2', center.y + boxHeight/2 + spread);
    middleVLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.7)');
    middleVLine.setAttribute('stroke-width', '1');
    middleVLine.setAttribute('stroke-linecap', 'round');
    middleVLine.style.opacity = progress * 0.7;
    middleVLine.style.filter = 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))';
    navGridOverlay.appendChild(middleVLine);
  }
  
  // Animate grid for mobile menu (viewport coordinates) - warp out then warp back in
  function animateMobileGrid(link, callback) {
    if (currentAnimationFrame) {
      cancelAnimationFrame(currentAnimationFrame);
    }
    
    activeLink = link;
    const linkRect = link.getBoundingClientRect();
    const positions = getMobileCornerPositions(linkRect);
    
    // Position overlay to cover viewport for mobile/tablet
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Ensure overlay is properly positioned and sized to match viewport exactly
    navGridOverlay.style.position = 'fixed';
    navGridOverlay.style.top = '0';
    navGridOverlay.style.left = '0';
    navGridOverlay.style.width = viewportWidth + 'px';
    navGridOverlay.style.height = viewportHeight + 'px';
    navGridOverlay.style.margin = '0';
    navGridOverlay.style.padding = '0';
    navGridOverlay.style.transform = 'none';
    
    // Set SVG viewBox to match viewport exactly (1:1 coordinate mapping)
    navGridOverlay.setAttribute('viewBox', `0 0 ${viewportWidth} ${viewportHeight}`);
    navGridOverlay.setAttribute('width', viewportWidth);
    navGridOverlay.setAttribute('height', viewportHeight);
    navGridOverlay.setAttribute('preserveAspectRatio', 'none');
    
    // Ensure overlay is visible and active
    navGridOverlay.classList.add('active');
    navGridOverlay.style.opacity = '1';
    
    // Make sure defs exist
    if (!navGridOverlay.querySelector('defs')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', 'gridGradient');
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '100%');
      ['0%', '50%', '100%'].forEach((offset, i) => {
        const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', offset);
        const colors = ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.1)'];
        stop.setAttribute('stop-color', colors[i]);
        stop.setAttribute('stop-opacity', i === 0 ? '1' : i === 1 ? '0.6' : '0.2');
        gradient.appendChild(stop);
      });
      defs.appendChild(gradient);
      navGridOverlay.appendChild(defs);
    }
    
    // Two-phase animation: warp out (40%) then warp back in (60%)
    const warpOutDuration = animationDuration * 0.4; // 40% of time to warp out
    const warpInDuration = animationDuration * 0.6; // 60% of time to warp back in
    const totalDuration = warpOutDuration + warpInDuration;
    const startTime = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const totalProgress = Math.min(elapsed / totalDuration, 1);
      
      let progress;
      if (elapsed < warpOutDuration) {
        // Phase 1: Warp out - expand from center
        const phaseProgress = elapsed / warpOutDuration;
        progress = easingFunction(phaseProgress); // 0 to 1
      } else {
        // Phase 2: Warp back in - contract to center
        const phaseProgress = (elapsed - warpOutDuration) / warpInDuration;
        const easedPhase = easingFunction(phaseProgress); // 0 to 1
        progress = 1 - easedPhase; // 1 to 0 (reverse)
      }
      
      // Pass viewport dimensions to ensure correct coordinate system
      createMobileGridLines(positions, progress, viewportWidth, viewportHeight);
      
      if (totalProgress < 1) {
        currentAnimationFrame = requestAnimationFrame(animate);
      } else {
        currentAnimationFrame = null;
        // Call callback when animation completes
        if (callback && typeof callback === 'function') {
          setTimeout(() => {
            callback();
          }, 0);
        }
      }
    }
    
    currentAnimationFrame = requestAnimationFrame(animate);
  }
  
  // Helper function to check if mobile/tablet
  function isMobileOrTablet() {
    return window.innerWidth <= 1024;
  }
  
  // Validate navigation URL to prevent open redirect attacks
  function isValidNavigationUrl(url) {
    if (!url) return false;
    
    // Allow relative paths
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }
    
    // Allow hash fragments
    if (url.startsWith('#')) {
      return true;
    }
    
    // Block dangerous protocols
    if (url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('vbscript:')) {
      return false;
    }
    
    // For absolute URLs, check if same origin
    try {
      const urlObj = new URL(url, window.location.origin);
      // Allow same origin or trusted external domains
      const allowedDomains = [
        'arturmorin.page',
        'arturmorin.com',
        'arturmorin.netlify.app',
        'x.com',
        'twitter.com',
        'threads.net',
        't.me',
        'telegram.org'
      ];
      const hostname = urlObj.hostname.replace('www.', '');
      return urlObj.origin === window.location.origin || 
             allowedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
    } catch (e) {
      // Invalid URL format
      return false;
    }
  }
  
  // Handle link click/touch (mobile/tablet only) - DISABLED: No grid effect
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Disable grid effect on mobile/tablet - just close menu and navigate normally
      if (isMobileOrTablet()) {
        const primaryNav = document.querySelector('#primary-nav');
        if (primaryNav && primaryNav.getAttribute('aria-hidden') === 'false') {
          // Store href for navigation
          const href = link.getAttribute('href');
          
          // Close menu immediately without grid animation
          const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
          const navOverlay = document.querySelector('.nav-overlay');
          
          if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
          }
          if (primaryNav) {
            // Remove focus BEFORE setting aria-hidden (accessibility fix)
            const activeElement = document.activeElement;
            if (activeElement && primaryNav.contains(activeElement)) {
              activeElement.blur();
            }
            
            // Make links non-focusable when hidden (accessibility fix)
            const navLinks = primaryNav.querySelectorAll('a, button');
            navLinks.forEach(link => {
              link.setAttribute('tabindex', '-1');
            });
            
            primaryNav.setAttribute('aria-hidden', 'true');
          }
          if (navOverlay) {
            navOverlay.setAttribute('aria-hidden', 'true');
          }
          
          // Ensure body can scroll on mobile - remove all overflow restrictions
          document.body.style.overflow = '';
          document.body.style.overflowY = '';
          document.body.style.overflowX = '';
          
          // Force reflow to ensure styles apply
          void document.body.offsetHeight;
          
          // Clear grid
          clearGrid();
          
          // Don't prevent default - let the browser handle navigation naturally
          // The link will navigate normally after menu closes
        }
      }
    });
  });
  
  // Handle window resize - clear grid
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      clearGrid();
      if (currentAnimationFrame) {
        cancelAnimationFrame(currentAnimationFrame);
      }
    }, 100);
  }, { passive: true });
  
  // Initial state
  clearGrid();
})();


// =============================================================================
// Logo Touch Effect - Toggle switch for mobile/tablet
// Artur and Morin slide in from sides when toggled on, slide out when toggled off
// When expanded, tapping again navigates to home
// =============================================================================
(function() {
  'use strict';
  
  const logo = document.querySelector('.logo');
  
  if (logo) {
    // Find elements inside the logo
    const logoMark = logo.querySelector('.logo-mark');
    const logoNameFirst = logo.querySelector('.logo-name-first');
    const logoNameLast = logo.querySelector('.logo-name-last');
    
    if (logoMark && logoNameFirst && logoNameLast) {
      let isTextVisible = false; // Start with text hidden (only AM box visible)
      let touchStartTime = 0;
      let touchStartX = 0;
      let touchStartY = 0;
      
      // Check if we're on mobile/tablet
      function isMobileTablet() {
        return window.innerWidth <= 1024;
      }
      
      // Set initial state - hide text by default on mobile/tablet
      function initLogoState() {
        if (isMobileTablet()) {
          logo.classList.remove('logo-text-expanded');
          logo.classList.add('logo-text-hidden');
          isTextVisible = false;
        } else {
          // Desktop - remove mobile classes
          logo.classList.remove('logo-text-hidden', 'logo-text-expanded');
          isTextVisible = false;
        }
      }
      
      // Initialize on load
      initLogoState();
      
      // Check initial scroll position
      function checkInitialScroll() {
        if (isMobileTablet()) {
          const scrollY = window.scrollY || window.pageYOffset;
          if (scrollY < 100) {
            // Already at top, ensure text is hidden
            if (isTextVisible) {
              logo.classList.remove('logo-text-expanded');
              logo.classList.add('logo-text-hidden');
              isTextVisible = false;
            }
          }
        }
      }
      
      // Check after page loads
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkInitialScroll);
      } else {
        checkInitialScroll();
      }
      
      // Re-initialize on resize
      let resizeTimeout;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
          initLogoState();
          checkInitialScroll();
        }, 100);
      });
      
      // Toggle function
      function toggleLogoText() {
        if (isTextVisible) {
          // Hide text - slide back into AM box, AM box moves back to left
          logo.classList.remove('logo-text-expanded');
          logo.classList.add('logo-text-hidden');
          isTextVisible = false;
        } else {
          // Show text - AM box moves right, text slides out from sides
          logo.classList.remove('logo-text-hidden');
          logo.classList.add('logo-text-expanded');
          isTextVisible = true;
        }
      }
      
      // Check if we're on a subpage (about.html or privacy-policy.html)
      function isSubpage() {
        const pathname = window.location.pathname;
        const href = window.location.href;
        return pathname.includes('about.html') || 
               pathname.includes('privacy-policy.html') ||
               href.includes('about.html') ||
               href.includes('privacy-policy.html');
      }
      
      // Unified click handler for all devices
      function handleLogoClick(e) {
        e.preventDefault();
        
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollThreshold = 100; // Consider "at top" if scrolled less than 100px
        const isAtTop = scrollY <= scrollThreshold;
        const isOnSubpage = isSubpage();
        
        if (isMobileTablet()) {
          // Mobile/Tablet behavior
          if (isOnSubpage && isAtTop) {
            // On subpage at top - directly navigate to home (no text expansion needed)
            window.location.href = 'photography-index.html';
          } else if (isTextVisible) {
            // Text is visible and scrolled down
            if (isOnSubpage) {
              // On subpage - scroll to top and collapse text
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
              toggleLogoText();
            } else {
              // On main page - scroll to top and collapse text
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
              toggleLogoText();
            }
          } else {
            // Text is hidden - toggle to show text (for interaction)
            toggleLogoText();
          }
        } else {
          // Desktop behavior
          if (isOnSubpage && isAtTop) {
            // On subpage at top - navigate to home
            window.location.href = '/';
          } else {
            // Scroll to top
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        }
        
        return false;
      }
      
      // Attach single handler for all devices
      logo.addEventListener('click', handleLogoClick);
      
      // Handle touch events for better mobile responsiveness
      logo.addEventListener('touchstart', function(e) {
        if (isMobileTablet()) {
          touchStartTime = Date.now();
          const touch = e.touches[0];
          touchStartX = touch.clientX;
          touchStartY = touch.clientY;
        }
      }, { passive: true });
      
      logo.addEventListener('touchend', function(e) {
        if (isMobileTablet()) {
          const touchEndTime = Date.now();
          const touchDuration = touchEndTime - touchStartTime;
          const touch = e.changedTouches[0];
          const touchEndX = touch.clientX;
          const touchEndY = touch.clientY;
          
          // Calculate movement
          const deltaX = Math.abs(touchEndX - touchStartX);
          const deltaY = Math.abs(touchEndY - touchStartY);
          
          // Only handle if it's a tap (not a swipe) and quick tap
          if (touchDuration < 300 && deltaX < 10 && deltaY < 10) {
            const scrollY = window.scrollY || window.pageYOffset;
            const scrollThreshold = 100;
            const isAtTop = scrollY <= scrollThreshold;
            const isOnSubpage = isSubpage();
            
            // If on subpage at top, navigate directly (don't toggle)
            if (isOnSubpage && isAtTop) {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = 'photography-index.html';
              return false;
            }
            
            if (isTextVisible) {
              // Text is already visible - allow click handler to handle it
              return true;
            } else {
              // Text is hidden - toggle to show text
              e.preventDefault();
              e.stopPropagation();
              toggleLogoText();
              return false;
            }
          }
        }
        return true;
      }, { passive: false });
      
      // Collapse text when page scrolls to top/home section
      function checkScrollPosition() {
        if (isMobileTablet() && isTextVisible) {
          const scrollY = window.scrollY || window.pageYOffset;
          
          // If we're at the top (within 150px), collapse text
          if (scrollY < 150) {
            toggleLogoText();
          }
        }
      }
      
      // Check scroll position on scroll
      let scrollTimeout;
      window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(checkScrollPosition, 100);
      }, { passive: true });
    }
  }
})();

// =============================================================================
// Award Cards Stacked Progressive Reveal Animation
// =============================================================================
(function() {
  'use strict';
  
  function initAwardCards() {
    const awardsGrid = document.querySelector('.awards-grid');
    if (!awardsGrid) return;

    // Disable all card interactions on mobile and tablet
    if (window.innerWidth <= 1024) {
      return;
    }

    const card2023 = awardsGrid.querySelector('.award-card[data-year="2023"]');
    const card2024 = awardsGrid.querySelector('.award-card[data-year="2024"]');
    const card2025 = awardsGrid.querySelector('.award-card[data-year="2025"]');

    if (!card2023 || !card2024 || !card2025) return;
    
    let visibleCards = 1; // Start with only 2023 visible
    
    function handleCardClick(e) {
      const clickedCard = e.target.closest('.award-card');
      if (!clickedCard) return;
      
      // Add resonate animation
      clickedCard.classList.add('resonating');
      setTimeout(() => {
        clickedCard.classList.remove('resonating');
      }, 400);
      
      const clickedYear = clickedCard.getAttribute('data-year');
      
      if (visibleCards === 1) {
        // Only 2023 visible - clicking 2023 reveals 2024
        if (clickedYear === '2023') {
          card2024.classList.add('expanded');
          visibleCards = 2;
        }
      } else if (visibleCards === 2) {
        // 2023 and 2024 visible
        if (clickedYear === '2023') {
          // Clicking 2023 closes 2024
          card2024.classList.remove('expanded');
          visibleCards = 1;
        } else if (clickedYear === '2024') {
          // Clicking 2024 reveals 2025
          card2025.classList.add('expanded');
          visibleCards = 3;
          awardsGrid.classList.add('all-expanded');
        }
      } else if (visibleCards === 3) {
        // All 3 cards visible - back and forth toggle behavior
        if (clickedYear === '2025') {
          // Clicking 2025 closes both 2024 and 2025 smoothly in sync
          card2024.classList.add('sliding-back');
          card2025.classList.add('sliding-back');
          
          // Force reflow for smooth animation
          void card2024.offsetWidth;
          void card2025.offsetWidth;
          
          requestAnimationFrame(() => {
            card2025.classList.remove('expanded');
            card2024.classList.remove('expanded');
            awardsGrid.classList.remove('all-expanded');
            visibleCards = 1;
            
            // Clean up sliding class after animation
            setTimeout(() => {
              card2024.classList.remove('sliding-back');
              card2025.classList.remove('sliding-back');
            }, 600);
          });
        } else if (clickedYear === '2023') {
          // Clicking 2023 closes only 2025 (first click), then closes 2024 (second click)
          if (card2025.classList.contains('expanded')) {
            // First click: close 2025
            card2025.classList.add('sliding-back');
            void card2025.offsetWidth;
            
            requestAnimationFrame(() => {
              card2025.classList.remove('expanded');
              awardsGrid.classList.remove('all-expanded');
              visibleCards = 2;
              
              setTimeout(() => {
                card2025.classList.remove('sliding-back');
              }, 600);
            });
          } else {
            // Second click: close 2024
            card2024.classList.add('sliding-back');
            void card2024.offsetWidth;
            
            requestAnimationFrame(() => {
              card2024.classList.remove('expanded');
              visibleCards = 1;
              
              setTimeout(() => {
                card2024.classList.remove('sliding-back');
              }, 600);
            });
          }
        }
      }
    }
    
    // Add click handler to all cards
    card2023.addEventListener('click', handleCardClick, false);
    card2024.addEventListener('click', handleCardClick, false);
    card2025.addEventListener('click', handleCardClick, false);
  }
  

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAwardCards);
  } else {
    setTimeout(initAwardCards, 50);
  }
  
  window.addEventListener('load', function() {
    setTimeout(initAwardCards, 100);
  });
})();

// =============================================================================
// Page Loaded Class
// =============================================================================
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

// =============================================================================
// Back/Forward Cache (bfcache) Support
// Handle page restoration from bfcache to ensure everything works correctly
// 
// Note: Chrome may show a "WebSocket" bfcache warning due to third-party scripts
// (Google Tag Manager, reCAPTCHA). This is a known false positive - our code
// doesn't use WebSockets. The page is bfcache-compatible and will work correctly
// when restored from cache.
// =============================================================================
window.addEventListener('pageshow', (event) => {
  // Check if page was restored from bfcache
  if (event.persisted) {
    // Re-initialize parallax when restored from cache
    if (typeof initParallaxSections === 'function') {
      initParallaxSections();
      updateParallax();
    }
    
    // Re-initialize navigation background
    if (typeof updateNavBackground === 'function') {
      updateNavBackground();
    }
    
    // Re-initialize reveal animations if needed
    const revealElements = document.querySelectorAll('.reveal:not(.visible)');
    if (revealElements.length > 0 && typeof revealObserver !== 'undefined') {
      revealElements.forEach((el) => {
        revealObserver.observe(el);
      });
    }
    
    // Re-initialize logo state if needed
    if (typeof checkInitialScroll === 'function') {
      checkInitialScroll();
    }
  }
}, { passive: true });

// Clean up on pagehide to ensure bfcache eligibility
// Using pagehide instead of beforeunload/unload (which block bfcache)
window.addEventListener('pagehide', (event) => {
  // Cancel any pending animations
  if (typeof currentAnimationFrame !== 'undefined' && currentAnimationFrame) {
    cancelAnimationFrame(currentAnimationFrame);
  }
  
  // Clean up any timers or intervals if needed
  // (Most timers are already scoped, but this ensures cleanup)
}, { passive: true });

