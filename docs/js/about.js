/**
 * Artur Morin About Page - Interactions
 * ======================================
 * Parallax, reveal animations, and smooth interactions for about page
 */

// =============================================================================
// Page Loader - fade out as soon as the page is ready, then remove it
// (scripts load at the end of <body>, so the DOM is already there)
// =============================================================================
(function() {
  'use strict';

  const pageLoader = document.getElementById('page-loader');
  if (!pageLoader) return;

  pageLoader.classList.add('hidden');
  // remove after the fade so its animations stop running
  setTimeout(() => pageLoader.remove(), 700);
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
let parallaxData = [];
let parallaxFrame = 0;

// Parallax: sections with class "parallax" drift slightly while scrolling.
// Runs at most once per frame (requestAnimationFrame) and uses section positions
// measured without the parallax offset (cached, re-measured on resize/content
// changes), so scrolling never forces the browser to recalculate the layout.
const reduceMotionParallax = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function pageTop(el) {
  // layout position (offsetTop chain) - not affected by the parallax transform
  let top = 0;
  for (let n = el; n; n = n.offsetParent) top += n.offsetTop;
  return top;
}

function measureParallax() {
  parallaxData = Array.from(parallaxSections).map((section) => ({
    section,
    speed: Number(section.dataset.speed || 0.1),
    top: pageTop(section),
    height: section.offsetHeight,
  }));
}

function initParallaxSections() {
  parallaxSections = document.querySelectorAll('.parallax');
  lastScrollTop = window.scrollY;
  parallaxVelocity = 0;
  parallaxSections.forEach((section) => { section.style.transition = 'none'; });
  measureParallax();
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function updateParallax() {
  parallaxFrame = 0;
  if (reduceMotionParallax || !parallaxData.length) return;

  const scrollTop = window.scrollY;
  const viewportHeight = window.innerHeight;
  const delta = scrollTop - lastScrollTop;
  parallaxVelocity = delta * 0.1 + parallaxVelocity * 0.9;

  parallaxData.forEach(({ section, speed, top, height }) => {
    // skip sections far off screen
    if (top + height < scrollTop - viewportHeight || top > scrollTop + viewportHeight * 2) return;

    const distanceFromCenter = scrollTop + viewportHeight / 2 - (top + height / 2);
    const normalizedDistance = distanceFromCenter / viewportHeight;
    const eased = easeOutCubic(Math.abs(normalizedDistance)) * Math.sign(normalizedDistance);
    const offset = eased * speed * 100 + parallaxVelocity * speed * 0.5;
    const clamped = Math.max(-80, Math.min(80, offset));

    section.style.setProperty('--parallax-offset', `${clamped}px`);
    section.style.transform = `translateY(${clamped}px)`;
  });

  lastScrollTop = scrollTop;
}

function onScroll() {
  if (!parallaxFrame) parallaxFrame = requestAnimationFrame(updateParallax);
}

// re-measure when the page layout changes (images/fonts loading, resize)
if ('ResizeObserver' in window) {
  new ResizeObserver(() => { measureParallax(); onScroll(); }).observe(document.body);
}
window.addEventListener('resize', () => { measureParallax(); onScroll(); }, { passive: true });

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

    // Skip link: move keyboard focus into the main content, not just the scroll position
    if (anchor.classList.contains('skip-link')) {
      const main = document.getElementById('main-content');
      if (main) {
        e.preventDefault();
        main.setAttribute('tabindex', '-1');
        main.focus();
      }
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
// parallax only (the nav background is constant, set once below)
window.addEventListener('scroll', onScroll, { passive: true });
if (typeof updateNavBackground === 'function') updateNavBackground();

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


// Logo (AM button) behaviour lives in js/logo.js

// =============================================================================
// Awards - card stack
// Closed: the cards lie on top of each other like a deck, slightly rotated.
// Each tap deals the top card: it stays in its place and the rest of the deck
// takes the next place (so nothing is ever hidden under a dealt card). On
// desktop the group stays centred and grows from the middle.
// Order: 2024, then 2025 + TBC (the last card follows on its own), then a
// tap gathers them back.
// The button deals all remaining cards at once ("Show 'em all!").
// Cards stay in the normal grid; only transforms move them, so nothing jumps.
// =============================================================================
(function() {
  'use strict';

  const stack = document.getElementById('award-stack');
  if (!stack) return;

  const cards = Array.from(stack.querySelectorAll('.stack-card'));
  const toggle = document.querySelector('.award-stack-toggle');
  const toggleLabel = toggle && toggle.querySelector('.award-stack-toggle-label');
  if (!cards.length) return;

  // Deal order, as positions in the HTML (0 = TBC, 1 = 2024, 2 = 2025)
  const DEAL_ORDER = [1, 2, 0].filter((i) => i < cards.length);
  cards.forEach((_, i) => { if (!DEAL_ORDER.includes(i)) DEAL_ORDER.push(i); });
  // How cards lie in the deck by depth, top -> bottom: [x px, y px, rotate deg]
  const POSES = [[0, 0, 0], [14, 7, 5], [-18, 14, -7]];
  const DEAL_DELAY = 80; // ms between cards when several move at once
  const total = cards.length;
  let dealt = 0; // how many cards (from the start of DEAL_ORDER) are out
  let fanned = false;

  const positionInOrder = (i) => DEAL_ORDER.indexOf(i);
  const isDealt = (i) => positionInOrder(i) < dealt;

  // changed: indexes of cards that move now, in the order they should move
  function render(changed = []) {
    const next = dealt < total ? DEAL_ORDER[dealt] : -1; // top of the deck
    cards.forEach((card, i) => {
      const order = changed.indexOf(i);
      card.style.transitionDelay = order > 0 ? `${order * DEAL_DELAY}ms` : '0ms';
      card.classList.toggle('is-dealt', isDealt(i));
      card.classList.toggle('is-deck-top', i === next);
      // dealt cards lie above the deck; inside the deck the next card is on top
      card.style.zIndex = isDealt(i) ? String(20 + positionInOrder(i)) : String(10 - (positionInOrder(i) - dealt));
    });

    // Measure twice: setting the height can shift rows slightly, so place the
    // cards only after the height matches the new state.
    // (offsetLeft/offsetTop are layout positions - transforms don't affect them)
    for (let pass = 0; pass < 2; pass++) {
      const spread = fanned && dealt === 0 ? 1.6 : 1; // hover: the closed deck fans a little
      // full-width cards on phones: a tighter fan so corners stay on screen
      const narrow = Math.min(1, stack.clientWidth / 700);
      const oneColumn = cards.every((c) => c.offsetLeft === cards[0].offsetLeft);

      // Places are filled in deal order: place j = the j-th card dealt, the deck
      // takes the next place. Row (desktop/tablet): the visible group is centred,
      // so it grows from the middle. Column (phones): the column's own slots.
      const visible = dealt + (dealt < total ? 1 : 0);
      const cardW = cards[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(stack).columnGap) || 0;
      const rowStart = (stack.clientWidth - (visible * cardW + (visible - 1) * gap)) / 2;
      const place = (j) => {
        if (oneColumn) {
          const slot = cards[DEAL_ORDER[Math.min(j, total - 1)]];
          return { x: slot.offsetLeft + slot.offsetWidth / 2, y: slot.offsetTop };
        }
        return { x: rowStart + j * (cardW + gap) + cardW / 2, y: cards[0].offsetTop };
      };

      let height = 0;
      cards.forEach((card, i) => {
        const ownX = card.offsetLeft + card.offsetWidth / 2;
        if (isDealt(i)) {
          const p = place(positionInOrder(i));
          const dx = p.x - ownX;
          const dy = p.y - card.offsetTop;
          card.style.transform = Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 ? '' : `translate(${dx}px, ${dy}px)`;
          height = Math.max(height, p.y + card.offsetHeight);
        } else {
          const p = place(dealt);
          const depth = positionInOrder(i) - dealt; // 0 = top of the deck
          const [px, py, rot] = POSES[Math.min(depth, POSES.length - 1)];
          const dx = p.x - ownX + px * spread * narrow;
          const dy = p.y - card.offsetTop + py * spread;
          const r = rot * spread * (narrow < 1 ? narrow * 0.6 : 1);
          card.style.transform = `translate(${dx}px, ${dy}px) rotate(${r}deg)`;
          height = Math.max(height, p.y + card.offsetHeight + 24);
        }
      });
      stack.style.height = `${height}px`;
    }

    const allOut = dealt === total;
    stack.dataset.state = allOut ? 'open' : dealt ? 'dealing' : 'stacked';
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(allOut));
      if (toggleLabel) toggleLabel.textContent = allOut ? "Close 'em all!" : "Show 'em all!";
    }
  }

  function dealNext() {
    const from = dealt;
    dealt += 1;
    // a single card left in the deck comes out right after (no extra tap needed)
    if (total - dealt === 1) dealt = total;
    fanned = false;
    render(DEAL_ORDER.slice(from)); // dealt cards move in order, the deck slides on
  }

  function dealAll() {
    const moving = DEAL_ORDER.slice(dealt);
    dealt = total;
    fanned = false;
    render(moving);
  }

  function gather() {
    dealt = 0;
    fanned = false;
    render(DEAL_ORDER.slice().reverse()); // last dealt goes back first
  }

  stack.addEventListener('click', () => (dealt < total ? dealNext() : gather()));
  toggle && toggle.addEventListener('click', () => (dealt < total ? dealAll() : gather()));

  // hover hint (mouse only): the closed deck fans slightly
  const canHover = window.matchMedia('(hover: hover)');
  stack.addEventListener('mouseenter', () => { if (canHover.matches && dealt === 0) { fanned = true; render(); } });
  stack.addEventListener('mouseleave', () => { if (fanned) { fanned = false; render(); } });

  // re-measure when the layout changes (resize, rotation, fonts loading)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => render(), 120);
  }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render());

  // first paint: place the deck without animating
  cards.forEach((c) => (c.style.transition = 'none'));
  stack.style.transition = 'none';
  render();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    cards.forEach((c) => (c.style.transition = ''));
    stack.style.transition = '';
  }));
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

