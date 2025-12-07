/**
 * Artur Morin Portfolio - Interactions
 * ====================================
 * Parallax, reveal animations, and smooth interactions
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
// Unified for all pages (same as photography-index.html)
function initParallaxSections() {
  parallaxSections = document.querySelectorAll('.parallax');
  // Initialize lastScrollTop to 0 - will be set properly in first updateParallax call
  // Defer reading window.scrollY to avoid forced reflow
  lastScrollTop = 0;
  parallaxVelocity = 0;
  
  // Disable transitions on all parallax elements for immediate response (unified)
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
  
  // Batch all reads first to avoid forced reflows
  const scrollTop = window.scrollY;
  const viewportHeight = window.innerHeight;
  const delta = scrollTop - lastScrollTop;
  
  // Calculate scroll velocity for dynamic effects
  parallaxVelocity = delta * 0.1 + parallaxVelocity * 0.9;
  
  // Batch all getBoundingClientRect() calls first (read phase)
  const sectionData = Array.from(parallaxSections).map((section) => {
    const rect = section.getBoundingClientRect();
    const speed = Number(section.dataset.speed || 0.1);
    return {
      section,
      speed,
      rect,
      sectionTop: rect.top + scrollTop,
      sectionHeight: rect.height
    };
  });
  
  // Now perform all writes (write phase) - this avoids forced reflows
  sectionData.forEach(({ section, speed, sectionTop, sectionHeight }) => {
    const sectionCenter = sectionTop + sectionHeight / 2;
    
    // Calculate distance from viewport center
    const distanceFromCenter = scrollTop + viewportHeight / 2 - sectionCenter;
    const normalizedDistance = distanceFromCenter / viewportHeight;
    
    // Apply easing for smoother motion
    const eased = easeOutCubic(Math.abs(normalizedDistance)) * Math.sign(normalizedDistance);
    
    // Calculate offset with velocity influence
    const baseOffset = eased * speed * 100;
    const velocityOffset = parallaxVelocity * speed * 0.5;
    const totalOffset = baseOffset + velocityOffset;
    
    // Clamp to prevent extreme movement
    const clamped = Math.max(-80, Math.min(80, totalOffset));
    
    // Apply with smooth transform - no transition for immediate response (unified for all pages)
    section.style.setProperty('--parallax-offset', `${clamped}px`);
    section.style.transform = `translateY(${clamped}px)`;
    section.style.transition = 'none'; // Always use immediate updates for smooth scrolling
  });
  
  lastScrollTop = scrollTop;
}

// Scroll handler - update parallax immediately for smooth scrolling
// Unified for all pages - no throttling for immediate response
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

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation delays for sequential reveals
        const delay = entry.target.dataset.delay || (index % 3 * 100);
        setTimeout(() => {
          entry.target.classList.add('visible');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { 
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  }
);

revealElements.forEach((el, index) => {
  // Skip service cards - they have their own slide-in animation
  if (el.classList.contains('service-card')) {
    return;
  }
  
  // Add stagger delay to work cards
  if (el.closest('.work-grid') || el.closest('.services-grid')) {
    el.dataset.delay = index * 100;
  }
  revealObserver.observe(el);
});

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
// Hero Image Tilt Effect - Applied to all carousel slides
// Slower and smoother mouse-following 3D tilt effect
// =============================================================================
function initImageTiltEffect() {
  // Apply to all carousel slide image frames
  const carouselImageFrames = document.querySelectorAll('.carousel-slide .image-frame');
  
  carouselImageFrames.forEach((imageFrame) => {
    imageFrame.addEventListener('mousemove', (e) => {
      const rect = imageFrame.getBoundingClientRect();
      // Reduced multiplier from 8 to 4 for slower, less sharp movement
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 4;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 4;
      // Add smooth transition for less sharp movement
      imageFrame.style.transition = 'transform 0.3s ease-out';
      imageFrame.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
    });

    imageFrame.addEventListener('mouseleave', () => {
      imageFrame.style.transition = 'transform 0.4s ease-out';
      imageFrame.style.transform = '';
    });
  });
  
  // Also apply to regular hero image frame if it exists (non-carousel)
  const heroImage = document.querySelector('.hero-image .image-frame:not(.carousel-slide .image-frame)');
  if (heroImage) {
    heroImage.addEventListener('mousemove', (e) => {
      const rect = heroImage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 4;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 4;
      heroImage.style.transition = 'transform 0.3s ease-out';
      heroImage.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
    });

    heroImage.addEventListener('mouseleave', () => {
      heroImage.style.transition = 'transform 0.4s ease-out';
      heroImage.style.transform = '';
    });
  }
}

// Initialize tilt effect when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for carousel to initialize
    setTimeout(initImageTiltEffect, 100);
  });
} else {
  setTimeout(initImageTiltEffect, 100);
}

// =============================================================================
// Work Card Hover Effects
// =============================================================================
const workCards = document.querySelectorAll('.work-card');

workCards.forEach((card) => {
  card.addEventListener('mouseenter', () => {
    // Add subtle tilt based on position in grid
    const rect = card.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const cardCenterX = rect.left + rect.width / 2;
    const tilt = ((cardCenterX - centerX) / centerX) * 2;
    card.style.transform = `translateY(-4px) rotate(${tilt * 0.5}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// =============================================================================
// Service Card Glow Effect
// =============================================================================
const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    card.style.background = `
      radial-gradient(
        600px circle at ${x}px ${y}px,
        rgba(201, 166, 107, 0.06),
        transparent 40%
      ),
      rgba(255, 255, 255, 0.03)
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.background = 'rgba(255, 255, 255, 0.03)';
  });
});

// =============================================================================
// Smooth Scroll for Anchor Links
// =============================================================================
// Smooth Scroll for Anchor Links
// Uses CSS scroll-behavior: smooth with scroll-padding-top offset
// Only adds JavaScript offset for sticky header
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
// Contact Form Handler - Removed duplicate, see Form Validation section below
// =============================================================================

// =============================================================================
// Footer Year
// =============================================================================
const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// =============================================================================
// Handle scroll restoration - unified for all pages
// =============================================================================
// Use auto scroll restoration for all pages (same as photography-index.html)
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
// Cursor Trail Effect (Subtle)
// Only on desktop with mouse (not touch devices)
// =============================================================================
if (window.matchMedia('(pointer: fine)').matches) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor-glow';
  cursor.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201, 166, 107, 0.03) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    opacity: 0;
    left: -9999px;
    top: -9999px;
  `;
  document.body.appendChild(cursor);

  let cursorVisible = false;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    if (!cursorVisible) {
      cursorVisible = true;
      cursor.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', () => {
    cursorVisible = false;
    cursor.style.opacity = '0';
    cursor.style.left = '-9999px';
    cursor.style.top = '-9999px';
  });
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
    document.body.style.overflow = '';
    
    // Clear grid overlay when menu closes
    const navGridOverlay = document.querySelector('.nav-grid-overlay');
    if (navGridOverlay) {
      // Clear the grid immediately
      const existingLines = navGridOverlay.querySelectorAll('line, path');
      existingLines.forEach(line => line.remove());
      navGridOverlay.classList.remove('active');
      navGridOverlay.style.opacity = '0';
    }
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
  // Mobile/tablet: handled in grid effect code (don't interfere)
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Only close immediately on desktop
      if (window.innerWidth > 1024) {
        closeMenu();
      }
      // Mobile/tablet: let grid effect handle it (don't close here to avoid conflicts)
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
      // Remove focus BEFORE setting aria-hidden (accessibility fix)
      removeNavFocus();
      primaryNav.setAttribute('aria-hidden', 'true');
      if (navOverlay) navOverlay.setAttribute('aria-hidden', 'true');
    }
  });
}

// =============================================================================
// CAPTCHA Challenge Generator
// Creates a simple human verification question (math or word typing).
// =============================================================================
const challengeText = document.getElementById("challenge-text");
const challengeInput = document.getElementById("challenge-input");
const challengeHint = document.getElementById("challenge-hint");
let challengeAnswer = "";

function generateChallenge() {
  if (!challengeText || !challengeInput) return;

  // 50/50 chance of math question vs word typing
  if (Math.random() > 0.5) {
    // Math question: variety of operations
    const operation = Math.random();
    if (operation < 0.5) {
      // Addition
      const a = Math.floor(Math.random() * 10) + 3; // 3-12
      const b = Math.floor(Math.random() * 10) + 2; // 2-11
      challengeAnswer = String(a + b);
      challengeText.textContent = `${a} + ${b} = ?`;
    } else if (operation < 0.75) {
      // Subtraction (result must be positive)
      const a = Math.floor(Math.random() * 8) + 8; // 8-15
      const b = Math.floor(Math.random() * 5) + 2; // 2-6
      challengeAnswer = String(a - b);
      challengeText.textContent = `${a} - ${b} = ?`;
    } else {
      // Simple multiplication
      const a = Math.floor(Math.random() * 5) + 2; // 2-6
      const b = Math.floor(Math.random() * 5) + 2; // 2-6
      challengeAnswer = String(a * b);
      challengeText.textContent = `${a} × ${b} = ?`;
    }
  } else {
    // Word typing challenge - expanded options
    const prompts = [
      { text: 'Type the word "Artur"', answer: "Artur" },
      { text: 'Type the word "Morin"', answer: "Morin" },
      { text: 'Type the word "Photography"', answer: "Photography" },
      { text: 'Type the word "Camera"', answer: "Camera" },
      { text: 'Type the word "Lens"', answer: "Lens" },
      { text: 'Type the word "Shutter"', answer: "Shutter" },
      { text: 'Type the word "Aperture"', answer: "Aperture" },
      { text: 'Type the word "Frame"', answer: "Frame" },
      { text: 'Type the word "Light"', answer: "Light" },
      { text: 'Type the word "Portrait"', answer: "Portrait" },
      { text: 'Type the word "Editorial"', answer: "Editorial" },
      { text: 'Type the word "Tallinn"', answer: "Tallinn" },
      { text: 'Type the number "2024"', answer: "2024" },
      { text: 'Type the number "2025"', answer: "2025" },
      { text: 'Type the number "100"', answer: "100" },
      { text: 'Type the number "50"', answer: "50" },
      { text: 'Type the number "24"', answer: "24" },
      { text: 'Type the number "35"', answer: "35" },
      { text: 'Type the word "Studio"', answer: "Studio" },
      { text: 'Type the word "Creative"', answer: "Creative" },
      { text: 'Type the word "Visual"', answer: "Visual" },
      { text: 'Type the word "Story"', answer: "Story" },
      { text: 'Type the word "Image"', answer: "Image" },
      { text: 'Type the word "Photo"', answer: "Photo" },
      { text: 'Type the word "Capture"', answer: "Capture" },
    ];
    const picked = prompts[Math.floor(Math.random() * prompts.length)];
    challengeAnswer = picked.answer;
    challengeText.textContent = picked.text;
  }

  // Reset input state
  challengeInput.value = "";
  if (challengeHint) {
    challengeHint.textContent = "Enter the answer exactly as shown.";
    challengeHint.classList.remove("error");
  }
  challengeInput.classList.remove("error");
}

// =============================================================================
// Form Validation with Accessibility
// =============================================================================
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');
  const formStatus = document.querySelector('.form-status');

  function validateName() {
    const value = nameInput.value.trim();
    if (!value) {
      nameInput.setAttribute('aria-invalid', 'true');
      nameError.textContent = 'This field is required';
      // Trigger jiggle animation
      nameInput.classList.remove('text-jiggle');
      setTimeout(() => {
        nameInput.classList.add('text-jiggle');
      }, 10);
      return false;
    } else if (value.length < 6) {
      nameInput.setAttribute('aria-invalid', 'true');
      nameError.textContent = 'Name must be at least 6 characters';
      nameInput.classList.remove('text-jiggle');
      setTimeout(() => {
        nameInput.classList.add('text-jiggle');
      }, 10);
      return false;
    } else {
      nameInput.setAttribute('aria-invalid', 'false');
      nameError.textContent = '';
      nameInput.classList.remove('text-jiggle');
      return true;
    }
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    
    // Basic required check
    if (!value) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.textContent = 'This field is required';
      emailInput.classList.remove('text-jiggle');
      setTimeout(() => {
        emailInput.classList.add('text-jiggle');
      }, 10);
      return false;
    }
    
    // Length validation (RFC 5321: max 254 chars total, min 5 for basic email)
    if (value.length < 5) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.textContent = 'Email address is too short';
      emailInput.classList.remove('text-jiggle');
      setTimeout(() => {
        emailInput.classList.add('text-jiggle');
      }, 10);
      return false;
    }
    
    if (value.length > 254) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.textContent = 'Email address is too long';
      emailInput.classList.remove('text-jiggle');
      setTimeout(() => {
        emailInput.classList.add('text-jiggle');
      }, 10);
      return false;
    }
    
    // Stricter email format validation
    // Rejects: consecutive dots, leading/trailing dots, invalid characters
    const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    
    // Check for common invalid patterns
    if (value.includes('..') || value.startsWith('.') || value.endsWith('.') || 
        value.startsWith('@') || value.endsWith('@') || !value.includes('@')) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.textContent = 'Please enter a valid email address (e.g., name@example.com)';
      emailInput.classList.remove('text-jiggle');
      setTimeout(() => {
        emailInput.classList.add('text-jiggle');
      }, 10);
      return false;
    }
    
    if (!emailRegex.test(value)) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.textContent = 'Please enter a valid email address (e.g., name@example.com)';
      emailInput.classList.remove('text-jiggle');
      setTimeout(() => {
        emailInput.classList.add('text-jiggle');
      }, 10);
      return false;
    }
    
    // Extract domain for validation
    const emailParts = value.split('@');
    if (emailParts.length !== 2) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.textContent = 'Please enter a valid email address';
      emailInput.classList.remove('text-jiggle');
      setTimeout(() => {
        emailInput.classList.add('text-jiggle');
      }, 10);
      return false;
    }
    
    const domain = emailParts[1].toLowerCase();
    
    // Block disposable/temporary email domains
    const disposableDomains = [
      'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'guerrillamailblock.com',
      'mailinator.com', 'throwaway.email', 'temp-mail.org', 'yopmail.com',
      'getnada.com', 'mohmal.com', 'maildrop.cc', 'trashmail.com', 'tempail.com',
      'fakeinbox.com', 'mintemail.com', 'sharklasers.com', 'grr.la', 'guerrillamail.info',
      'dispostable.com', 'emailondeck.com', 'meltmail.com', 'melt.li', '33mail.com',
      'mailcatch.com', 'spamgourmet.com', 'spamhole.com', 'spam.la', 'spamevader.com',
      'spamfree24.org', 'spamfree24.de', 'spamfree24.eu',
      'tempr.email', 'tmpmail.org', 'tmpmail.net', 'tmpmail.io', 'tmpmail.com',
      'throwawaymail.com', 'throwawaymail.net', 'throwawaymail.org', 'throwawaymail.io',
      'emailtemp.org', 'emailtemp.net', 'emailtemp.com', 'emailtemp.io',
      'mytemp.email', 'mailnesia.com', 'mintemail.net', 'mintemail.org',
      'inboxkitten.com', 'getairmail.com', 'airmail.cc', 'airmail.co',
      'test.com', 'example.com', 'invalid.com', 'test.test'
    ];
    
    if (disposableDomains.includes(domain)) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.textContent = 'Please use a permanent email address';
      emailInput.classList.remove('text-jiggle');
      setTimeout(() => {
        emailInput.classList.add('text-jiggle');
      }, 10);
      return false;
    }
    
    // Detect suspicious patterns common in spam
    const suspiciousPatterns = [
      /^test\d+@/i,           // test123@
      /^user\d+@/i,           // user456@
      /^email\d+@/i,          // email789@
      /^spam/i,               // starts with "spam"
      /spam@/i,               // contains "spam@"
      /\d{10,}@/,             // 10+ consecutive digits before @
      /^[a-z]\d{5,}@/i,       // single letter + 5+ digits
      /^[a-z]{1,2}\d{6,}@/i   // 1-2 letters + 6+ digits
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(value))) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.textContent = 'Please use a valid email address';
      emailInput.classList.remove('text-jiggle');
      setTimeout(() => {
        emailInput.classList.add('text-jiggle');
      }, 10);
      return false;
    }
    
    // All checks passed
    emailInput.setAttribute('aria-invalid', 'false');
    emailError.textContent = '';
    emailInput.classList.remove('text-jiggle');
    return true;
  }

  function validateMessage() {
    const value = messageInput.value.trim();
    if (!value) {
      messageInput.setAttribute('aria-invalid', 'true');
      messageError.textContent = 'This field is required';
      messageInput.classList.remove('text-jiggle');
      setTimeout(() => {
        messageInput.classList.add('text-jiggle');
      }, 10);
      return false;
    } else if (value.length < 3) {
      messageInput.setAttribute('aria-invalid', 'true');
      messageError.textContent = 'Message must be at least 3 characters';
      messageInput.classList.remove('text-jiggle');
      setTimeout(() => {
        messageInput.classList.add('text-jiggle');
      }, 10);
      return false;
    } else {
      messageInput.setAttribute('aria-invalid', 'false');
      messageError.textContent = '';
      messageInput.classList.remove('text-jiggle');
      return true;
    }
  }

  nameInput.addEventListener('blur', validateName);
  emailInput.addEventListener('blur', validateEmail);
  messageInput.addEventListener('blur', validateMessage);

  // Time-based bot detection - track when form was first interacted with
  let formStartTime = null;
  const trackFormStart = () => {
    if (!formStartTime) {
      formStartTime = Date.now();
    }
  };
  
  // Track first interaction with any form field
  [nameInput, emailInput, messageInput].forEach(field => {
    if (field) {
      field.addEventListener('focus', trackFormStart, { once: true });
      field.addEventListener('input', trackFormStart, { once: true });
    }
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Honeypot check - if filled, silently reject (likely a bot)
    const honeypotField = document.getElementById('website');
    if (honeypotField && honeypotField.value.trim() !== '') {
      // Silently reject - don't show any error, just prevent submission
      return;
    }
    
    // Time-based validation - reject if form submitted too quickly (less than 3 seconds)
    // Bots typically submit forms instantly, humans need at least a few seconds
    if (formStartTime) {
      const timeSpent = (Date.now() - formStartTime) / 1000; // in seconds
      if (timeSpent < 3) {
        // Silently reject - form filled too quickly (likely a bot)
        return;
      }
    }
    
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();
    
    // Verify CAPTCHA answer
    let isChallengeValid = true;
    if (challengeInput && challengeAnswer) {
      const inputValue = challengeInput.value.trim();
      if (inputValue !== challengeAnswer) {
        challengeInput.classList.add("error");
        if (challengeHint) {
          challengeHint.textContent = "That answer didn't match. Try again.";
          challengeHint.classList.add("error");
        }
        challengeInput.focus();
        isChallengeValid = false;
      } else {
        challengeInput.classList.remove("error");
        if (challengeHint) {
          challengeHint.classList.remove("error");
        }
      }
    }
    
    if (isNameValid && isEmailValid && isMessageValid && isChallengeValid) {
      // Get reCAPTCHA token with timeout
      let recaptchaToken = '';
      try {
        // Check if grecaptcha is loaded
        if (typeof grecaptcha !== 'undefined' && grecaptcha.execute) {
          // Add timeout to prevent hanging
          const recaptchaPromise = grecaptcha.execute('6LdzCR8sAAAAAByR9D7ud0qxxJkBLlA4aOb-uYFK', { action: 'submit' });
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('reCAPTCHA timeout')), 5000)
          );
          recaptchaToken = await Promise.race([recaptchaPromise, timeoutPromise]);
        }
      } catch (error) {
        // Silently handle timeout/errors - form can still submit
        if (error.message !== 'reCAPTCHA timeout') {
          // Suppress 401/Unauthorized errors (domain not authorized in reCAPTCHA console)
          const errorMsg = error.message || error.toString() || '';
          const isUnauthorized = errorMsg.includes('401') || 
                                 errorMsg.includes('Unauthorized') || 
                                 errorMsg.includes('pat?k=') ||
                                 error.status === 401;
          
          if (!isUnauthorized) {
            console.warn('reCAPTCHA error (form will still submit):', errorMsg || 'Domain not authorized. Please add ' + window.location.hostname + ' to reCAPTCHA console.');
          }
          // Silently ignore 401 errors - domain needs to be added to reCAPTCHA console
        }
        // Continue with form submission even if reCAPTCHA fails (graceful degradation)
      }

      // Form is valid - prepare form submission
      const formData = new FormData(contactForm);
      const name = formData.get('name') || 'Client';
      const email = formData.get('email');
      const project = formData.get('project');
      const message = formData.get('message');

      // Add FormSubmit configuration fields
      const subject = `Portfolio Inquiry - ${project || 'General'}`;
      
      // Create hidden input for subject
      let subjectInput = contactForm.querySelector('input[name="_subject"]');
      if (!subjectInput) {
        subjectInput = document.createElement('input');
        subjectInput.type = 'hidden';
        subjectInput.name = '_subject';
        contactForm.appendChild(subjectInput);
      }
      subjectInput.value = subject;
      
      // Add redirect URL (thank you page)
      let nextInput = contactForm.querySelector('input[name="_next"]');
      if (!nextInput) {
        nextInput = document.createElement('input');
        nextInput.type = 'hidden';
        nextInput.name = '_next';
        contactForm.appendChild(nextInput);
      }
      nextInput.value = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'thank-you.html';
      
      // Disable FormSubmit's built-in captcha (we have our own)
      let captchaInput = contactForm.querySelector('input[name="_captcha"]');
      if (!captchaInput) {
        captchaInput = document.createElement('input');
        captchaInput.type = 'hidden';
        captchaInput.name = '_captcha';
        contactForm.appendChild(captchaInput);
      }
      captchaInput.value = 'false';
      
      // Add template for better email formatting
      let templateInput = contactForm.querySelector('input[name="_template"]');
      if (!templateInput) {
        templateInput = document.createElement('input');
        templateInput.type = 'hidden';
        templateInput.name = '_template';
        contactForm.appendChild(templateInput);
      }
      templateInput.value = 'table';
      
      // Add FormSubmit blacklist to filter common spam keywords
      let blacklistInput = contactForm.querySelector('input[name="_blacklist"]');
      if (!blacklistInput) {
        blacklistInput = document.createElement('input');
        blacklistInput.type = 'hidden';
        blacklistInput.name = '_blacklist';
        contactForm.appendChild(blacklistInput);
      }
      // Common spam keywords/phrases - FormSubmit will reject submissions containing these
      blacklistInput.value = 'viagra,cialis,pharmacy,loan,debt,credit,investment,bitcoin,crypto,casino,gambling,poker,lottery,winner,prize,free money,get rich,work from home,make money fast,click here,limited time offer,act now,urgent,guaranteed,no risk,risk free,weight loss,diet pill,miracle,sexy,adult,xxx,porn,escort,dating,meet singles,enlarge,penis,breast,hot girls,sexy girls';

      // Send event to Google Tag Manager
      if (window.dataLayer) {
        window.dataLayer.push({
          'event': 'form_submit',
          'form_name': 'contact_form_portfolio',
          'project_type': project || 'general',
          'recaptcha_verified': recaptchaToken ? true : false
        });
      }

      // Show success message
      formStatus.textContent = 'Sending...';
      formStatus.className = 'form-status success';
      
      // Submit the form to FormSubmit (this will send the email automatically)
      contactForm.submit();
    } else {
      // Form has errors
      formStatus.textContent = 'Please fix the errors above and try again.';
      formStatus.className = 'form-status error';
      
      // Focus first invalid field
      if (!isNameValid) {
        nameInput.focus();
      } else if (!isEmailValid) {
        emailInput.focus();
      } else if (!isMessageValid) {
        messageInput.focus();
      }
    }
  });
  
  // Generate initial challenge
  generateChallenge();
}

// =============================================================================
// Loading State Announcement for Screen Readers
// =============================================================================
const pageLoader = document.getElementById("page-loader");
if (pageLoader) {
  const loaderText = pageLoader.querySelector('.loader-text');
  if (loaderText) {
    loaderText.setAttribute('role', 'status');
    loaderText.setAttribute('aria-live', 'polite');
  }
}

// =============================================================================
// Letter Bounce Effect - Wrap letters in spans for individual animation
// Creates that fun kids' TV show logo effect where letters bounce on hover
// =============================================================================
function wrapLettersInLabels() {
  const labels = document.querySelectorAll('.form-group label');
  labels.forEach(label => {
    // Skip if already processed
    if (label.querySelector('.letter')) return;
    
    // Get all child nodes
    const nodes = Array.from(label.childNodes);
    const newContent = document.createDocumentFragment();
    
    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Wrap each character in a span
        const text = node.textContent;
        text.split('').forEach(char => {
          const span = document.createElement('span');
          span.className = 'letter';
          span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
          newContent.appendChild(span);
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Keep element nodes (like required asterisk) as-is
        newContent.appendChild(node.cloneNode(true));
      }
    });
    
    // Replace content
    label.innerHTML = '';
    label.appendChild(newContent);
  });
}

// =============================================================================
// Growing Grid Lines Animation
// Creates fine grid lines that spread like vines across the page
// =============================================================================
(function() {
  'use strict';
  
  const gridContainer = document.querySelector('.grid-lines-container');
  if (!gridContainer) return;
  
  // Grid configuration
  const gridSize = 80; // Size of each grid cell in pixels
  const crosshairSize = 8; // Size of crosshairs at intersections
  const animationDelay = 50; // Delay between each line animation (ms)
  const staggerDelay = 20; // Additional delay for staggered effect
  
  // Calculate grid dimensions
  const cols = Math.ceil(window.innerWidth / gridSize) + 1;
  const rows = Math.ceil(window.innerHeight / gridSize) + 1;
  
  // Create horizontal lines
  for (let i = 0; i <= rows; i++) {
    const line = document.createElement('div');
    line.className = 'grid-line grid-line-horizontal';
    line.style.top = `${i * gridSize}px`;
    line.style.left = '0';
    line.style.animationDelay = `${i * staggerDelay}ms`;
    gridContainer.appendChild(line);
  }
  
  // Create vertical lines
  for (let i = 0; i <= cols; i++) {
    const line = document.createElement('div');
    line.className = 'grid-line grid-line-vertical';
    line.style.left = `${i * gridSize}px`;
    line.style.top = '0';
    line.style.animationDelay = `${i * staggerDelay + animationDelay}ms`;
    gridContainer.appendChild(line);
  }
  
  // Create crosshairs at intersections
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const crosshair = document.createElement('div');
      crosshair.className = 'grid-crosshair';
      crosshair.style.left = `${col * gridSize - crosshairSize / 2}px`;
      crosshair.style.top = `${row * gridSize - crosshairSize / 2}px`;
      crosshair.style.animationDelay = `${(row + col) * staggerDelay + animationDelay * 2}ms`;
      gridContainer.appendChild(crosshair);
    }
  }
  
  // Update grid on resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Clear existing grid
      gridContainer.innerHTML = '';
      
      // Recalculate and recreate grid
      const newCols = Math.ceil(window.innerWidth / gridSize) + 1;
      const newRows = Math.ceil(window.innerHeight / gridSize) + 1;
      
      // Recreate horizontal lines
      for (let i = 0; i <= newRows; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line grid-line-horizontal';
        line.style.top = `${i * gridSize}px`;
        line.style.left = '0';
        line.style.animationDelay = `${i * staggerDelay}ms`;
        gridContainer.appendChild(line);
      }
      
      // Recreate vertical lines
      for (let i = 0; i <= newCols; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line grid-line-vertical';
        line.style.left = `${i * gridSize}px`;
        line.style.top = '0';
        line.style.animationDelay = `${i * staggerDelay + animationDelay}ms`;
        gridContainer.appendChild(line);
      }
      
      // Recreate crosshairs
      for (let row = 0; row <= newRows; row++) {
        for (let col = 0; col <= newCols; col++) {
          const crosshair = document.createElement('div');
          crosshair.className = 'grid-crosshair';
          crosshair.style.left = `${col * gridSize - crosshairSize / 2}px`;
          crosshair.style.top = `${row * gridSize - crosshairSize / 2}px`;
          crosshair.style.animationDelay = `${(row + col) * staggerDelay + animationDelay * 2}ms`;
          gridContainer.appendChild(crosshair);
        }
      }
    }, 250);
  }, { passive: true });
})();

// =============================================================================
// Initialize - unified for all pages (same as photography-index.html)
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
    // Use double RAF to ensure layout is complete before reading layout properties
    requestAnimationFrame(() => {
      requestAnimationFrame(initializePage);
    });
  });
} else {
  // DOM already ready, but use double requestAnimationFrame to ensure rendering is complete
  // This defers layout reads until after the browser has completed layout calculations
  requestAnimationFrame(() => {
    requestAnimationFrame(initializePage);
  });
}

// Wrap letters after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wrapLettersInLabels);
} else {
  wrapLettersInLabels();
}

// =============================================================================
// Magnetic Mouse Effect for Form Labels
// Letters react to mouse position - pushed away by invisible circle around cursor
// Similar to techyscouts.com effect, only active within form area
// =============================================================================
(function() {
  'use strict';
  
  const contactForm = document.querySelector('.contact-form');
  if (!contactForm) return;
  
  // Wait for letters to be wrapped
  function initMagneticEffect() {
    const letters = contactForm.querySelectorAll('.form-group label .letter');
    if (letters.length === 0) {
      // Retry after a short delay if letters aren't ready yet
      setTimeout(initMagneticEffect, 100);
      return;
    }
    
    let mouseX = 0;
    let mouseY = 0;
    let isInFormArea = false;
    let animationFrameId = null;
    
    // Store initial positions and create letter data
    const letterData = Array.from(letters).map(letter => {
      const rect = letter.getBoundingClientRect();
      return {
        element: letter,
        baseX: rect.left + rect.width / 2,
        baseY: rect.top + rect.height / 2,
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0
      };
    });
    
    // Get form bounds for mouse detection
    let formRect = contactForm.getBoundingClientRect();
    
    // Update form bounds helper
    function updateFormBounds() {
      formRect = contactForm.getBoundingClientRect();
    }
    
    // Mouse move handler - only track position
    function handleMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Check if mouse is within form area (with some padding)
      const padding = 100; // Extend detection area slightly beyond form
      isInFormArea = 
        mouseX >= formRect.left - padding &&
        mouseX <= formRect.right + padding &&
        mouseY >= formRect.top - padding &&
        mouseY <= formRect.bottom + padding;
      
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updateLetters);
      }
    }
    
    // Update letter positions based on mouse proximity
    function updateLetters() {
      updateFormBounds(); // Update bounds in case of scroll/resize
      
      if (!isInFormArea) {
        // Reset all letters to base position when mouse leaves
        letterData.forEach(data => {
          data.targetX = 0;
          data.targetY = 0;
        });
      } else {
        // Calculate effect for each letter
        const influenceRadius = 120; // Radius of invisible circle around mouse
        const maxDisplacement = 25; // Maximum distance letters can move
        
        letterData.forEach(data => {
          // Get current letter position (accounting for scroll)
          const rect = data.element.getBoundingClientRect();
          const letterX = rect.left + rect.width / 2;
          const letterY = rect.top + rect.height / 2;
          
          // Calculate distance from mouse to letter
          const dx = letterX - mouseX;
          const dy = letterY - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < influenceRadius && distance > 0) {
            // Calculate push force (stronger when closer)
            const force = 1 - (distance / influenceRadius);
            const pushStrength = force * maxDisplacement;
            
            // Normalize direction vector
            const angle = Math.atan2(dy, dx);
            
            // Push letter away from mouse
            data.targetX = Math.cos(angle) * pushStrength;
            data.targetY = Math.sin(angle) * pushStrength;
          } else {
            // No effect outside radius
            data.targetX = 0;
            data.targetY = 0;
          }
        });
      }
      
      // Smooth interpolation for natural motion
      letterData.forEach(data => {
        // Ease towards target (damping for smooth motion)
        data.currentX += (data.targetX - data.currentX) * 0.15;
        data.currentY += (data.targetY - data.currentY) * 0.15;
        
        // Apply transform
        data.element.style.transform = `translate(${data.currentX}px, ${data.currentY}px)`;
      });
      
      // Continue animation if mouse is in area or letters are still moving
      const isMoving = letterData.some(data => 
        Math.abs(data.currentX - data.targetX) > 0.1 || 
        Math.abs(data.currentY - data.targetY) > 0.1
      );
      
      if (isInFormArea || isMoving) {
        animationFrameId = requestAnimationFrame(updateLetters);
      } else {
        animationFrameId = null;
      }
    }
    
    // Add mouse move listener to form area
    contactForm.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Reset on mouse leave
    contactForm.addEventListener('mouseleave', () => {
      isInFormArea = false;
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updateLetters);
      }
    }, { passive: true });
    
    // Update form bounds on scroll/resize
    window.addEventListener('scroll', updateFormBounds, { passive: true });
    window.addEventListener('resize', updateFormBounds, { passive: true });
    
    // Initial bounds update
    updateFormBounds();
  }
  
  // Initialize after letters are wrapped
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initMagneticEffect, 200);
    });
  } else {
    setTimeout(initMagneticEffect, 200);
  }
})();

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
// When hovering over nav links, a photography grid spreads symmetrically
// from the link position to corners, creating a compelling visual effect.
// =============================================================================
(function() {
  'use strict';
  
  const navLinks = document.querySelectorAll('.nav ul a:not(.nav-cta-mobile)');
  const navGridOverlay = document.querySelector('.nav-grid-overlay');
  const navUl = document.querySelector('.nav ul');
  
  if (!navLinks.length || !navGridOverlay || !navUl) return;
  
  let currentAnimationFrame = null;
  let activeLink = null;
  const gridDistance = 25; // Distance from link for # pattern (reduced - should form around text box)
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
    
    // Reset overlay state but don't remove active class immediately (let CSS handle it)
    // This ensures the overlay can be reused for next animation
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
    
    // Calculate corners of the grid area (30px from link center)
    // These are absolute viewport coordinates
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
  
  // Animate grid for mobile menu (viewport coordinates) - warp out then warp back in like notification
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
        // Call callback when animation completes - MUST be called
        if (callback && typeof callback === 'function') {
          // Execute callback immediately - no delays
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
  
  // Handle link click/touch (mobile/tablet only - desktop grid animation removed)
  // Validate navigation URL to prevent open redirect attacks
  function isValidNavigationUrl(url) {
    if (!url) return false;
    
    // Allow relative paths (including simple filenames like portfolio.html)
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../') || 
        (!url.includes(':') && !url.startsWith('#'))) {
      // Simple relative path like "portfolio.html" or "about.html"
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
  
  navLinks.forEach(link => {
    // Mobile/Tablet: simple navigation without animation
    link.addEventListener('click', (e) => {
      // Only trigger on mobile/tablet when menu is open
      if (isMobileOrTablet()) {
        const primaryNav = document.querySelector('#primary-nav');
        if (primaryNav && primaryNav.getAttribute('aria-hidden') === 'false') {
          // Store href for navigation
          const href = link.getAttribute('href');
          
          // Prevent default to handle navigation manually
          e.preventDefault();
          e.stopPropagation();
          
          // Close menu immediately
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
          document.body.style.overflow = '';
          
          // Navigate immediately
          if (href) {
            if (href.startsWith('#')) {
              const targetId = href.substring(1);
              const targetElement = document.getElementById(targetId);
              if (targetElement) {
                // Small delay to let menu close, then scroll with proper header offset
                setTimeout(() => {
                  const headerOffset = 80;
                  const elementPosition = targetElement.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - headerOffset;
                  
                  window.scrollTo({
                    top: Math.max(0, offsetPosition),
                    behavior: 'smooth'
                  });
                }, 100);
              } else {
                // Fallback: use hash navigation
                setTimeout(() => {
                  window.location.hash = targetId;
                }, 100);
              }
            } else {
              // External link - validate to prevent open redirect
              if (href && isValidNavigationUrl(href)) {
                window.location.href = href;
              } else {
                // Invalid URL - default to home
                window.location.href = 'photography-index.html';
              }
            }
          }
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

// Simple scroll handler - no custom smooth scroll, just parallax updates
window.addEventListener('scroll', () => {
  onScroll();
  updateNavBackground();
}, { passive: true });

// Preloader fade out (if needed)
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
      
      // Unified click handler for all devices
      // Check if we're on a subpage (about.html, privacy-policy.html, or portfolio.html)
      function isSubpage() {
        const pathname = window.location.pathname;
        const href = window.location.href;
        return pathname.includes('about.html') || 
               pathname.includes('privacy-policy.html') ||
               pathname.includes('portfolio.html') ||
               href.includes('about.html') ||
               href.includes('privacy-policy.html') ||
               href.includes('portfolio.html');
      }
      
      function handleLogoClick(e) {
        e.preventDefault();
        
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollThreshold = 100; // Consider "at top" if scrolled less than 100px
        const isAtTop = scrollY <= scrollThreshold;
        const isOnSubpage = isSubpage();
        
        if (isMobileTablet()) {
          // Mobile/Tablet behavior
          if (isOnSubpage) {
            // On subpage - always navigate to home (portfolio, about, privacy-policy)
            window.location.href = 'photography-index.html';
          } else if (isTextVisible) {
            // Text is visible and scrolled down - scroll to top and collapse text
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
            toggleLogoText();
          } else {
            // Text is hidden - toggle to show text (for interaction)
            toggleLogoText();
          }
        } else {
          // Desktop behavior
          if (isOnSubpage) {
            // On subpage - always navigate to home (portfolio, about, privacy-policy)
            window.location.href = 'photography-index.html';
          } else {
            // On main page - scroll to top
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
      
      // Listen for scroll events
      let scrollTimeout;
      let isScrolling = false;
      
      window.addEventListener('scroll', function() {
        if (isMobileTablet() && isTextVisible) {
          isScrolling = true;
          clearTimeout(scrollTimeout);
          // Debounce to avoid too many checks
          scrollTimeout = setTimeout(function() {
            isScrolling = false;
            checkScrollPosition();
          }, 150);
        }
      }, { passive: true });
      
      // Check after scroll ends (for smooth scroll completion)
      if ('onscrollend' in window) {
        window.addEventListener('scrollend', function() {
          if (isMobileTablet() && isTextVisible) {
            checkScrollPosition();
          }
        }, { passive: true });
      }
      
      // Fallback: check after a delay when hash changes (for anchor navigation)
      window.addEventListener('hashchange', function() {
        if (window.location.hash === '#home' || window.location.hash === '') {
          // Wait for smooth scroll to complete
          setTimeout(function() {
            if (isMobileTablet() && isTextVisible) {
              checkScrollPosition();
            }
          }, 800);
        }
      });
    }
  }
})();

// =============================================================================
// Stats Counter Animation
// Counts up from 0 to target number when stats section comes into view
// =============================================================================
(function() {
  'use strict';
  
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (statNumbers.length === 0) return;
  
  let hasAnimated = false;
  
  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    const startValue = 0;
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOut);
      
      element.textContent = currentValue;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Ensure final value is set
        element.textContent = target;
      }
    }
    
    requestAnimationFrame(update);
  }
  
  // Function to trigger service cards slide-in animation
  function triggerServiceCardsSlideIn() {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('slide-in');
      }, index * 1000); // Stagger delay: 1000ms (1 second) between each card
    });
  }
  
  // Use IntersectionObserver to trigger animation when stats come into view
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          statNumbers.forEach(stat => {
            animateCounter(stat);
          });
          statsObserver.disconnect();
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    }
  );
  
  // Observe the hero-stats container
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    statsObserver.observe(heroStats);
  }
  
  // Service cards animation - only triggers when services section comes into view
  let serviceCardsTriggered = false;
  const servicesSection = document.querySelector('.services');
  if (servicesSection) {
    const servicesObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !serviceCardsTriggered) {
            serviceCardsTriggered = true;
            triggerServiceCardsSlideIn();
            servicesObserver.disconnect();
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      }
    );
    servicesObserver.observe(servicesSection);
  }
})();

// =============================================================================
// Hero Carousel - Simple working version
// =============================================================================
(function() {
  'use strict';
  
  const heroImage = document.querySelector('.hero-image');
  if (!heroImage) return;
  
  const heroCarousel = heroImage.querySelector('.hero-carousel');
  const track = heroImage.querySelector('.carousel-track');
  const windowEl = heroImage.querySelector('.carousel-window');
  const prevBtn = heroImage.querySelector('.carousel-btn.prev');
  const nextBtn = heroImage.querySelector('.carousel-btn.next');
  const dotsContainer = heroImage.querySelector('.carousel-dots');
  
  if (!track || !windowEl || !heroCarousel) return;
  
  const originalSlides = Array.from(track.querySelectorAll('.carousel-slide'));
  const dots = Array.from(dotsContainer ? dotsContainer.querySelectorAll('button') : []);
  
  if (originalSlides.length === 0) return;
  
  let currentIndex = 0;
  let isTransitioning = false;
  const imageData = new Map();
  
  // Clone first and last slides for infinite loop
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
  firstClone.setAttribute('aria-hidden', 'true');
  lastClone.setAttribute('aria-hidden', 'true');
  track.appendChild(firstClone);
  track.insertBefore(lastClone, originalSlides[0]);
  
  const slides = originalSlides;
  
  function measureImage(slide) {
    const img = slide.querySelector('img');
    if (!img || imageData.has(img.src)) return Promise.resolve(null);
    
    return new Promise((resolve) => {
      if (img.complete && img.naturalWidth) {
        const aspect = img.naturalWidth / img.naturalHeight;
        imageData.set(img.src, { width: img.naturalWidth, height: img.naturalHeight, aspect });
        resolve({ aspect });
      } else {
        img.onload = () => {
          const aspect = img.naturalWidth / img.naturalHeight;
          imageData.set(img.src, { width: img.naturalWidth, height: img.naturalHeight, aspect });
          resolve({ aspect });
        };
        img.onerror = () => resolve(null);
      }
    });
  }
  
  function resizeWindowForSlide(slideIndex) {
    const slide = slides[slideIndex];
    if (!slide || !windowEl) return;
    
    const img = slide.querySelector('img');
    if (!img) return;
    
    const data = imageData.get(img.src);
    if (!data) return;
    
    const maxWidth = Math.min(760, window.innerWidth * 0.9);
    const maxHeight = window.innerHeight * 0.8;
    let targetWidth, targetHeight;
    
    if (data.aspect > 1) {
      targetWidth = Math.min(maxWidth, maxHeight * data.aspect);
      targetHeight = targetWidth / data.aspect;
    } else if (data.aspect < 1) {
      targetHeight = Math.min(maxHeight, maxWidth / data.aspect);
      targetWidth = targetHeight * data.aspect;
    } else {
      const size = Math.min(maxWidth, maxHeight);
      targetWidth = size;
      targetHeight = size;
    }
    
    windowEl.style.width = `${targetWidth + 24}px`;
    windowEl.style.height = `${targetHeight + 24}px`;
  }
  
  function updateDots() {
    slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', index === currentIndex ? 'false' : 'true');
    });
    dots.forEach((dot, index) => {
      dot.setAttribute('aria-selected', index === currentIndex ? 'true' : 'false');
    });
  }
  
  function goNext() {
    if (isTransitioning) return;
    const totalSlides = slides.length;
    const nextPos = currentIndex + 2;
    
    isTransitioning = true;
    track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.15, 0.15, 1)';
    track.style.transform = `translateX(-${nextPos * 100}%)`;
    
    currentIndex = (currentIndex + 1) % totalSlides;
    updateDots();
    resizeWindowForSlide(currentIndex);
  }
  
  function goPrev() {
    if (isTransitioning) return;
    const totalSlides = slides.length;
    const prevPos = currentIndex;
    
    isTransitioning = true;
    track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.15, 0.15, 1)';
    track.style.transform = `translateX(-${prevPos * 100}%)`;
    
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateDots();
    resizeWindowForSlide(currentIndex);
  }
  
  function goToSlide(index) {
    if (isTransitioning || index === currentIndex) return;
    
    isTransitioning = true;
    track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.15, 0.15, 1)';
    track.style.transform = `translateX(-${(index + 1) * 100}%)`;
    
    currentIndex = index;
    updateDots();
    resizeWindowForSlide(currentIndex);
  }
  
  // Handle seamless loop after transition
  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    const totalSlides = slides.length;
    const currentTransform = track.style.transform;
    const match = currentTransform.match(/translateX\(-?(\d+)%\)/);
    
    if (match) {
      const visualPos = parseInt(match[1]) / 100;
      
      if (visualPos === totalSlides + 1) {
        track.style.transition = 'none';
        track.style.transform = 'translateX(-100%)';
      }
      if (visualPos === 0) {
        track.style.transition = 'none';
        track.style.transform = `translateX(-${totalSlides}%)`;
      }
    }
  });
  
  prevBtn?.addEventListener('click', goPrev);
  nextBtn?.addEventListener('click', goNext);
  dots.forEach((dot, index) => dot.addEventListener('click', () => goToSlide(index)));
  
  let carouselTimer = setInterval(goNext, 6000);
  heroCarousel?.addEventListener('mouseenter', () => clearInterval(carouselTimer));
  heroCarousel?.addEventListener('mouseleave', () => {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(goNext, 6000);
  });
  
  // Initialize carousel
  Promise.all(slides.map((slide) => measureImage(slide))).then(() => {
    if (track) {
      track.style.transition = 'none';
      track.style.transform = 'translateX(-100%)';
    }
    resizeWindowForSlide(0);
    updateDots();
    
    setTimeout(() => {
      if (track) {
        track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.15, 0.15, 1)';
      }
    }, 50);
  });
})();

// =============================================================================
// Picture of the Week - Floating Letters Animation
// Follows the rounded rectangle border of the badge
// =============================================================================
(function() {
  'use strict';
  
  const badgeWrapper = document.querySelector('.potw-badge-wrapper');
  const badge = document.querySelector('.potw-badge');
  const lettersContainer = document.querySelector('.potw-letters');
  const letters = document.querySelectorAll('.letter-float');
  
  if (!badgeWrapper || !badge || !lettersContainer || letters.length === 0) return;
  
  const WORD_LETTERS = 8; // D, e, c, e, m, b, e, r
  const WORD_COUNT = 2; // Two "december" words
  const LETTER_COUNT = WORD_LETTERS * WORD_COUNT; // 16 total letters
  const PADDING = 20; // Space between badge border and letters (in pixels)
  const BORDER_RADIUS = 16; // Match CSS border-radius (var(--radius-md))
  const WORD_SPACING = 0.05; // Spacing between words (5% of path) - equal gap after each word
  // Spacing between letters within a word - evenly distribute letters accounting for 2 equal gaps
  // Total: 16 letters × LETTER_SPACING + 2 gaps × WORD_SPACING = 1.0
  const LETTER_SPACING = (1 - (WORD_SPACING * 2)) / (WORD_LETTERS * WORD_COUNT);
  
  let badgeWidth = 0;
  let badgeHeight = 0;
  let pathLength = 0; // Total length of the rounded rectangle path
  let animationFrameId = null;
  let offset = 0; // Current offset along the path (0 to 1)
  const ANIMATION_SPEED = 0.0008; // Speed of movement along path (0-1 per frame)
  
  // Get computed style for border radius
  function getBorderRadius() {
    const computed = window.getComputedStyle(badge);
    return parseFloat(computed.borderRadius) || BORDER_RADIUS;
  }
  
  // Calculate distance-based position to ensure constant speed
  // Uses actual path length, not percentage, for smooth corners
  function getPointOnPathByDistance(distance, width, height, radius, padding) {
    const w = width;
    const h = height;
    const r = radius + padding;
    
    // Calculate actual path segment lengths
    const straightTop = Math.max(0, w - (radius * 2));
    const straightRight = Math.max(0, h - (radius * 2));
    const straightBottom = Math.max(0, w - (radius * 2));
    const straightLeft = Math.max(0, h - (radius * 2));
    const cornerArc = (Math.PI * r) / 2; // Quarter circle arc length
    
    const totalLength = straightTop + straightRight + straightBottom + straightLeft + (cornerArc * 4);
    
    // Normalize distance to loop
    let normalizedDist = distance % totalLength;
    if (normalizedDist < 0) normalizedDist += totalLength;
    
    let x, y, angle;
    let currentDist = 0;
    
    // Top edge (left to right)
    if (normalizedDist < straightTop) {
      const progress = normalizedDist / straightTop;
      x = -w/2 + radius + (progress * straightTop);
      y = -h/2 - padding;
      angle = 0;
    }
    // Top-right corner
    else if (normalizedDist <= straightTop + cornerArc) {
      currentDist = normalizedDist - straightTop;
      const arcProgress = Math.min(1, currentDist / cornerArc); // Clamp to prevent overflow
      // Corner goes from angle -PI/2 (top edge end) to 0 (right edge start)
      const cornerAngle = (-Math.PI / 2) + (arcProgress * (Math.PI / 2));
      const cornerCenterX = w/2 - radius;
      const cornerCenterY = -h/2 + radius;
      // Arc position - at end (arcProgress=1, angle=0): x = w/2 + padding, y = -h/2 + radius
      x = cornerCenterX + Math.cos(cornerAngle) * r;
      y = cornerCenterY + Math.sin(cornerAngle) * r;
      // Angle smoothly transitions: at start (-90°) → 0°, at end (0°) → 90° for smooth transition
      angle = (cornerAngle + Math.PI / 2) * (180 / Math.PI);
    }
    // Right edge (top to bottom) - starts exactly where corner ends
    else if (normalizedDist < straightTop + cornerArc + straightRight) {
      currentDist = normalizedDist - straightTop - cornerArc;
      const progress = currentDist / straightRight;
      // Position matches corner end exactly: x = w/2 + padding, y = -h/2 + radius (when progress=0)
      x = w/2 + padding;
      y = -h/2 + radius + (progress * straightRight);
      // Angle is 90 degrees (vertical down) - smooth continuation from corner
      angle = 90;
    }
    // Bottom-right corner
    else if (normalizedDist <= straightTop + cornerArc + straightRight + cornerArc) {
      currentDist = normalizedDist - straightTop - cornerArc - straightRight;
      const arcProgress = Math.min(1, currentDist / cornerArc);
      // Corner goes from angle 0 (right edge end) to PI/2 (bottom edge start)
      const cornerAngle = 0 + (arcProgress * (Math.PI / 2));
      const cornerCenterX = w/2 - radius;
      const cornerCenterY = h/2 - radius;
      // Arc position - at end (arcProgress=1, angle=PI/2): x = w/2 - radius, y = h/2 + padding
      x = cornerCenterX + Math.cos(cornerAngle) * r;
      y = cornerCenterY + Math.sin(cornerAngle) * r;
      // Angle smoothly transitions from 90 to 180 degrees
      angle = (90 + arcProgress * 90);
    }
    // Bottom edge (right to left) - starts exactly where corner ends
    else if (normalizedDist < straightTop + cornerArc + straightRight + cornerArc + straightBottom) {
      currentDist = normalizedDist - straightTop - cornerArc - straightRight - cornerArc;
      const progress = currentDist / straightBottom;
      // Position matches corner end exactly: x = w/2 - radius (when progress=0), y = h/2 + padding
      x = w/2 - radius - (progress * straightBottom);
      y = h/2 + padding;
      // Angle is 180 degrees (horizontal left) - smooth continuation from corner
      angle = 180;
    }
    // Bottom-left corner - exact mirror of bottom-right corner
    else if (normalizedDist <= straightTop + cornerArc + straightRight + cornerArc + straightBottom + cornerArc) {
      currentDist = normalizedDist - straightTop - cornerArc - straightRight - cornerArc - straightBottom;
      const arcProgress = Math.min(1, currentDist / cornerArc);
      // Mirror of bottom-right: bottom-right uses angle 0 to PI/2
      // Bottom-left: center (-w/2 + radius, h/2 - radius), angle PI to 3*PI/2
      // Start: bottom edge end (-w/2 + radius, h/2 + padding) at angle PI/2 (relative to center)
      // End: left edge start (-w/2 - padding, h/2 - radius) at angle PI (relative to center)
      // Actually, let's work backwards: we need to go from bottom edge end to left edge start
      // Bottom edge end: (-w/2 + radius, h/2 + padding)
      // Left edge start: (-w/2 - padding, h/2 - radius)
      // With center at (-w/2 + radius, h/2 - radius) and radius r:
      // To get (-w/2 + radius, h/2 + padding): need angle PI/2 (pointing up from center)
      // To get (-w/2 - padding, h/2 - radius): need angle PI (pointing left from center)
      // So angle range: PI/2 to PI (going counter-clockwise)
      const cornerCenterX = -w/2 + radius;
      const cornerCenterY = h/2 - radius;
      const cornerAngle = (Math.PI / 2) + (arcProgress * (Math.PI / 2));
      // Calculate position
      x = cornerCenterX + Math.cos(cornerAngle) * r;
      y = cornerCenterY + Math.sin(cornerAngle) * r;
      // Angle smoothly transitions from 180 to 270 degrees (mirror of 90 to 180)
      angle = (180 + arcProgress * 90);
    }
    // Left edge (bottom to top) - starts exactly where corner ends
    // Mirrored from right edge (top to bottom) - same pattern, just reversed direction
    else if (normalizedDist < straightTop + cornerArc + straightRight + cornerArc + straightBottom + cornerArc + straightLeft) {
      currentDist = normalizedDist - straightTop - cornerArc - straightRight - cornerArc - straightBottom - cornerArc;
      const progress = currentDist / straightLeft;
      // Position matches corner end exactly: x = -w/2 - padding, y = h/2 - radius (when progress=0)
      // Exact mirror of right edge: right edge: y = -h/2 + radius + (progress * straightRight)
      // Left edge: y = h/2 - radius - (progress * straightLeft) - goes from bottom to top
      x = -w/2 - padding;
      y = h/2 - radius - (progress * straightLeft);
      // Angle is 270 degrees (vertical up) - smooth continuation from corner
      angle = 270;
    }
    // Top-left corner - exact mirror of top-right corner
    else {
      currentDist = normalizedDist - straightTop - cornerArc - straightRight - cornerArc - straightBottom - cornerArc - straightLeft;
      const arcProgress = Math.min(1, currentDist / cornerArc);
      // Mirror of top-right: top-right uses angle -PI/2 to 0
      // Top-left: center (-w/2 + radius, -h/2 + radius), angle 3*PI/2 to 2*PI/0
      // Start: left edge end (-w/2 - padding, -h/2 + radius)
      // End: top edge start (-w/2 + radius, -h/2 - padding)
      // With center at (-w/2 + radius, -h/2 + radius) and radius r:
      // To get (-w/2 - padding, -h/2 + radius): need angle PI (pointing left from center)
      // To get (-w/2 + radius, -h/2 - padding): need angle -PI/2 or 3*PI/2 (pointing up from center)
      // So angle range: PI to 3*PI/2 (going counter-clockwise)
      const cornerCenterX = -w/2 + radius;
      const cornerCenterY = -h/2 + radius;
      const cornerAngle = Math.PI + (arcProgress * (Math.PI / 2));
      // Calculate position
      x = cornerCenterX + Math.cos(cornerAngle) * r;
      y = cornerCenterY + Math.sin(cornerAngle) * r;
      // Angle smoothly transitions from 270 to 360/0 degrees (mirror of 0 to 90)
      angle = (cornerAngle + Math.PI / 2) * (180 / Math.PI);
      // Ensure angle wraps correctly (0-360 range)
      if (angle >= 360) angle = angle - 360;
      if (angle < 0) angle = angle + 360;
    }
    
    return { x, y, angle };
  }
  
  
  function calculatePathLength(width, height, radius, padding) {
    const w = width;
    const h = height;
    const r = radius + padding;
    
    const straightTop = Math.max(0, w - (radius * 2));
    const straightRight = Math.max(0, h - (radius * 2));
    const straightBottom = Math.max(0, w - (radius * 2));
    const straightLeft = Math.max(0, h - (radius * 2));
    const cornerArc = (Math.PI * r) / 2;
    
    return straightTop + straightRight + straightBottom + straightLeft + (cornerArc * 4);
  }
  
  function updateBadgeDimensions() {
    const badgeRect = badge.getBoundingClientRect();
    badgeWidth = badgeRect.width;
    badgeHeight = badgeRect.height;
    
    const radius = getBorderRadius();
    pathLength = calculatePathLength(badgeWidth, badgeHeight, radius, PADDING);
    
    // Set container size to accommodate the path
    const containerSize = Math.max(badgeWidth, badgeHeight) + (PADDING * 4);
    lettersContainer.style.width = `${containerSize}px`;
    lettersContainer.style.height = `${containerSize}px`;
  }
  
  function positionLetters() {
    const radius = getBorderRadius();
    
    letters.forEach((letter, index) => {
      // Calculate position: each letter follows the previous one in order
      // Letters should be positioned ahead of the lead letter (currentDistance)
      let letterDistance = currentDistance;
      
      if (index < WORD_LETTERS) {
        // First word: letters 0-7 (D, e, c, e, m, b, e, r)
        // Each letter follows the previous one, so add spacing
        letterDistance += index * (pathLength * LETTER_SPACING);
      } else {
        // Second word: letters 8-15, add word spacing gap after first word
        const firstWordLength = WORD_LETTERS * (pathLength * LETTER_SPACING);
        const gap = pathLength * WORD_SPACING;
        const secondWordIndex = index - WORD_LETTERS;
        letterDistance += firstWordLength + gap + (secondWordIndex * (pathLength * LETTER_SPACING));
      }
      
      // Wrap around if exceeds path length
      while (letterDistance >= pathLength) {
        letterDistance -= pathLength;
      }
      while (letterDistance < 0) {
        letterDistance += pathLength;
      }
      
      const point = getPointOnPathByDistance(letterDistance, badgeWidth, badgeHeight, radius, PADDING);
      
      // Position letter and rotate to follow the path direction
      letter.style.transform = `translate(calc(-50% + ${point.x}px), calc(-50% + ${point.y}px)) rotate(${point.angle}deg)`;
    });
  }
  
  let currentDistance = 0; // Distance along path in pixels
  const DISTANCE_PER_FRAME = 0.5; // Pixels to move per frame (constant speed)
  
  function animate() {
    // Move forward by constant distance (ensures constant speed on curves too)
    currentDistance += DISTANCE_PER_FRAME;
    
    // Wrap around when completing full loop
    if (currentDistance >= pathLength) {
      currentDistance = currentDistance - pathLength;
    }
    
    positionLetters();
    animationFrameId = requestAnimationFrame(animate);
  }
  
  function init() {
    updateBadgeDimensions();
    
    // Ensure pathLength is calculated before starting animation
    if (pathLength > 0) {
      positionLetters();
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animate();
    } else {
      // Retry if dimensions not ready
      setTimeout(init, 50);
    }
  }
  
  // Initialize on load
  function startInit() {
    setTimeout(() => {
      init();
    }, 100);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInit);
  } else {
    startInit();
  }
  
  // Update on resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateBadgeDimensions();
      // Recalculate pathLength after resize
      const radius = getBorderRadius();
      pathLength = calculatePathLength(badgeWidth, badgeHeight, radius, PADDING);
      positionLetters();
    }, 150);
  });
})();

// =============================================================================
// Picture of the Week - Image Orientation Detection
// Automatically detects landscape vs portrait and applies appropriate styling
// =============================================================================
(function() {
  'use strict';
  
  function detectPotwImageOrientation() {
    const potwImageFrame = document.querySelector('.potw-image .image-frame');
    if (!potwImageFrame) return;
    
    // Find img element (could be inside picture element or direct)
    const potwImage = potwImageFrame.querySelector('picture img') || potwImageFrame.querySelector('img');
    
    if (!potwImage) return;
    
    // Remove existing orientation classes
    potwImageFrame.classList.remove('potw-landscape', 'potw-portrait');
    
    // Wait for image to load to get actual dimensions
    if (potwImage.complete && potwImage.naturalWidth > 0) {
      applyOrientationClass(potwImage, potwImageFrame);
    } else {
      // Image not loaded yet, wait for load event
      potwImage.addEventListener('load', function() {
        applyOrientationClass(potwImage, potwImageFrame);
      }, { once: true });
      
      // Also handle error case (fallback to default)
      potwImage.addEventListener('error', function() {
        potwImageFrame.classList.add('potw-landscape'); // Default to landscape
      }, { once: true });
    }
  }
  
  function applyOrientationClass(img, frame) {
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    
    // Landscape: width > height (aspect ratio > 1)
    // Apply 16:9 aspect ratio container
    if (aspectRatio > 1) {
      frame.classList.add('potw-landscape');
    } 
    // Portrait: height > width (aspect ratio < 1)
    // Maintain natural aspect ratio, don't force square
    else {
      frame.classList.add('potw-portrait');
    }
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectPotwImageOrientation);
  } else {
    detectPotwImageOrientation();
  }
  
  // Re-check on window resize (in case image changes)
  window.addEventListener('resize', detectPotwImageOrientation);
})();

// =============================================================================
// Dev Tools Easter Egg - ASCII Art "Artur Morin"
// The ASCII art is now in the HTML comment at the top of the page
// This will be visible in the Elements tab when inspecting the HTML
// =============================================================================

