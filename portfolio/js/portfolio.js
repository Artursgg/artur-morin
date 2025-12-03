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
  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(hideLoader, 500);
  });

  // Strategy 4: Aggressive fallback - force hide after 1 second
  setTimeout(hideLoader, 1000);
  
  // Strategy 5: Final fallback - force hide after 2 seconds
  setTimeout(hideLoader, 2000);
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
let ticking = false;

// Initialize parallax sections - re-query on page load to ensure DOM is ready
// Unified for all pages (same as photography-index.html)
function initParallaxSections() {
  parallaxSections = document.querySelectorAll('.parallax');
  // Initialize lastScrollTop to current scroll position to prevent jumps
  lastScrollTop = window.scrollY || 0;
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
  
  // Update current scroll position for momentum (if variables exist)
  if (typeof currentScroll !== 'undefined') {
    currentScroll = window.scrollY;
  }
  if (typeof scrollTarget !== 'undefined') {
    scrollTarget = window.scrollY;
  }
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
// Hero Image Tilt Effect
// =============================================================================
const heroImage = document.querySelector('.image-frame');

if (heroImage) {
  heroImage.addEventListener('mousemove', (e) => {
    const rect = heroImage.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    heroImage.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
  });

  heroImage.addEventListener('mouseleave', () => {
    heroImage.style.transform = '';
  });
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
    // Math question: two random numbers to add
    const a = Math.floor(Math.random() * 5) + 4; // 4-8
    const b = Math.floor(Math.random() * 4) + 2; // 2-5
    challengeAnswer = String(a + b);
    challengeText.textContent = `${a} + ${b} = ?`;
  } else {
    // Word typing challenge
    const prompts = [
      { text: 'Type the word "Artur"', answer: "Artur" },
      { text: 'Type the word "Morin"', answer: "Morin" },
      { text: 'Type the number "2024"', answer: "2024" },
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.textContent = 'This field is required';
      emailInput.classList.remove('text-jiggle');
      setTimeout(() => {
        emailInput.classList.add('text-jiggle');
      }, 10);
      return false;
    } else if (!emailRegex.test(value)) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.textContent = 'Please enter a valid email address (e.g., test@test.ee)';
      emailInput.classList.remove('text-jiggle');
      setTimeout(() => {
        emailInput.classList.add('text-jiggle');
      }, 10);
      return false;
    } else {
      emailInput.setAttribute('aria-invalid', 'false');
      emailError.textContent = '';
      emailInput.classList.remove('text-jiggle');
      return true;
    }
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

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
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
      // Get reCAPTCHA token
      let recaptchaToken = '';
      try {
        recaptchaToken = await grecaptcha.execute('6LdzCR8sAAAAAByR9D7ud0qxxJkBLlA4aOb-uYFK', { action: 'submit' });
      } catch (error) {
        console.error('reCAPTCHA error:', error);
        // Continue with form submission even if reCAPTCHA fails (graceful degradation)
      }

      // Form is valid - prepare mailto link
      const formData = new FormData(contactForm);
      const name = formData.get('name') || 'Client';
      const email = formData.get('email');
      const project = formData.get('project');
      const message = formData.get('message');

      const subject = encodeURIComponent(`Portfolio Inquiry - ${project || 'General'}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nProject Type: ${project || 'Not specified'}\n\nMessage:\n${message}`
      );

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
      formStatus.textContent = 'Thank you! Your message has been sent.';
      formStatus.className = 'form-status success';
      
      // Open mailto link
      window.location.href = `mailto:hello@arturmorin.com?subject=${subject}&body=${body}`;
      
      // Reset form after a delay
      setTimeout(() => {
        contactForm.reset();
        // Clear errors
        nameInput.setAttribute('aria-invalid', 'false');
        emailInput.setAttribute('aria-invalid', 'false');
        messageInput.setAttribute('aria-invalid', 'false');
        nameError.textContent = '';
        emailError.textContent = '';
        messageError.textContent = '';
        formStatus.textContent = '';
        formStatus.className = '';
        // Generate new challenge
        generateChallenge();
      }, 2000);
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
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  // DOM already ready, but use requestAnimationFrame to ensure rendering is complete
  requestAnimationFrame(initializePage);
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
  
  // Calculate corner positions relative to link center
  function getCornerPositions(linkRect, ulRect) {
    const linkCenterX = linkRect.left + linkRect.width / 2 - ulRect.left;
    const linkCenterY = linkRect.top + linkRect.height / 2 - ulRect.top;
    
    // Get UL dimensions
    const ulWidth = ulRect.width;
    const ulHeight = ulRect.height;
    
    // Calculate corners of the grid area (30px from link center)
    const corners = [
      // Top-left corner
      {
        x: Math.max(0, linkCenterX - gridDistance),
        y: Math.max(0, linkCenterY - gridDistance)
      },
      // Top-right corner
      {
        x: Math.min(ulWidth, linkCenterX + gridDistance),
        y: Math.max(0, linkCenterY - gridDistance)
      },
      // Bottom-left corner
      {
        x: Math.max(0, linkCenterX - gridDistance),
        y: Math.min(ulHeight, linkCenterY + gridDistance)
      },
      // Bottom-right corner
      {
        x: Math.min(ulWidth, linkCenterX + gridDistance),
        y: Math.min(ulHeight, linkCenterY + gridDistance)
      }
    ];
    
    return {
      center: { x: linkCenterX, y: linkCenterY },
      corners: corners,
      bounds: {
        minX: Math.min(...corners.map(c => c.x)),
        maxX: Math.max(...corners.map(c => c.x)),
        minY: Math.min(...corners.map(c => c.y)),
        maxY: Math.max(...corners.map(c => c.y))
      }
    };
  }
  
  // Create # (hash) pattern around the text box for desktop hover
  function createGridLines(positions, progress = 1) {
    const { center } = positions;
    
    // Clear previous lines
    const existingLines = navGridOverlay.querySelectorAll('line, path');
    existingLines.forEach(line => line.remove());
    
    // Get link dimensions to form # around the text box
    const boxWidth = 80; // Approximate width of nav link text
    const boxHeight = 30; // Approximate height of nav link text
    const spread = gridDistance * progress; // How far the # extends from the box
    
    // Create # pattern: two horizontal lines and two vertical lines forming a grid
    // Top horizontal line
    const topLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    topLine.setAttribute('x1', center.x - boxWidth/2 - spread);
    topLine.setAttribute('y1', center.y - boxHeight/2 - spread);
    topLine.setAttribute('x2', center.x + boxWidth/2 + spread);
    topLine.setAttribute('y2', center.y - boxHeight/2 - spread);
    topLine.setAttribute('stroke', 'rgba(255, 255, 255, 1)');
    topLine.setAttribute('stroke-width', '2');
    topLine.setAttribute('stroke-linecap', 'round');
    topLine.style.opacity = progress;
    topLine.style.filter = 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))';
    navGridOverlay.appendChild(topLine);
    
    // Bottom horizontal line
    const bottomLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    bottomLine.setAttribute('x1', center.x - boxWidth/2 - spread);
    bottomLine.setAttribute('y1', center.y + boxHeight/2 + spread);
    bottomLine.setAttribute('x2', center.x + boxWidth/2 + spread);
    bottomLine.setAttribute('y2', center.y + boxHeight/2 + spread);
    bottomLine.setAttribute('stroke', 'rgba(255, 255, 255, 1)');
    bottomLine.setAttribute('stroke-width', '2');
    bottomLine.setAttribute('stroke-linecap', 'round');
    bottomLine.style.opacity = progress;
    bottomLine.style.filter = 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))';
    navGridOverlay.appendChild(bottomLine);
    
    // Left vertical line
    const leftLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leftLine.setAttribute('x1', center.x - boxWidth/2 - spread);
    leftLine.setAttribute('y1', center.y - boxHeight/2 - spread);
    leftLine.setAttribute('x2', center.x - boxWidth/2 - spread);
    leftLine.setAttribute('y2', center.y + boxHeight/2 + spread);
    leftLine.setAttribute('stroke', 'rgba(255, 255, 255, 1)');
    leftLine.setAttribute('stroke-width', '2');
    leftLine.setAttribute('stroke-linecap', 'round');
    leftLine.style.opacity = progress;
    leftLine.style.filter = 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))';
    navGridOverlay.appendChild(leftLine);
    
    // Right vertical line
    const rightLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rightLine.setAttribute('x1', center.x + boxWidth/2 + spread);
    rightLine.setAttribute('y1', center.y - boxHeight/2 - spread);
    rightLine.setAttribute('x2', center.x + boxWidth/2 + spread);
    rightLine.setAttribute('y2', center.y + boxHeight/2 + spread);
    rightLine.setAttribute('stroke', 'rgba(255, 255, 255, 1)');
    rightLine.setAttribute('stroke-width', '2');
    rightLine.setAttribute('stroke-linecap', 'round');
    rightLine.style.opacity = progress;
    rightLine.style.filter = 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))';
    navGridOverlay.appendChild(rightLine);
    
    // Middle horizontal line (crossing through center)
    const middleHLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    middleHLine.setAttribute('x1', center.x - boxWidth/2 - spread);
    middleHLine.setAttribute('y1', center.y);
    middleHLine.setAttribute('x2', center.x + boxWidth/2 + spread);
    middleHLine.setAttribute('y2', center.y);
    middleHLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.8)');
    middleHLine.setAttribute('stroke-width', '1.5');
    middleHLine.setAttribute('stroke-linecap', 'round');
    middleHLine.style.opacity = progress * 0.8;
    middleHLine.style.filter = 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))';
    navGridOverlay.appendChild(middleHLine);
    
    // Middle vertical line (crossing through center)
    const middleVLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    middleVLine.setAttribute('x1', center.x);
    middleVLine.setAttribute('y1', center.y - boxHeight/2 - spread);
    middleVLine.setAttribute('x2', center.x);
    middleVLine.setAttribute('y2', center.y + boxHeight/2 + spread);
    middleVLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.8)');
    middleVLine.setAttribute('stroke-width', '1.5');
    middleVLine.setAttribute('stroke-linecap', 'round');
    middleVLine.style.opacity = progress * 0.8;
    middleVLine.style.filter = 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))';
    navGridOverlay.appendChild(middleVLine);
  }
  
  // Animate grid spreading
  function animateGrid(link) {
    if (currentAnimationFrame) {
      cancelAnimationFrame(currentAnimationFrame);
    }
    
    activeLink = link;
    const linkRect = link.getBoundingClientRect();
    const ulRect = navUl.getBoundingClientRect();
    const positions = getCornerPositions(linkRect, ulRect);
    
    navGridOverlay.classList.add('active');
    
    const startTime = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easedProgress = easingFunction(progress);
      
      createGridLines(positions, easedProgress);
      
      if (progress < 1) {
        currentAnimationFrame = requestAnimationFrame(animate);
      } else {
        currentAnimationFrame = null;
      }
    }
    
    currentAnimationFrame = requestAnimationFrame(animate);
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
              // External link
              window.location.href = href;
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
  // Call updateBackToTop if it's available (defined later in IIFE)
  if (typeof window.updateBackToTop === 'function') {
    window.updateBackToTop();
  }
}, { passive: true });

// Preloader fade out (if needed)
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

// =============================================================================
// Back to Top Button - Cinema Lens Style
// Shows/hides button based on scroll position and handles smooth scroll to top
// =============================================================================
(function() {
  'use strict';
  
  // Wait for DOM to be ready before looking for button
  function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) {
      // Button not found, try again after a short delay (in case script loads before HTML)
      setTimeout(initBackToTop, 100);
      return;
    }
    
    // Show/hide button based on scroll position
    // For about.html: show after "Ready to create" section (about-cta)
    // For photography-index.html: show after about section
    function updateBackToTop() {
      const scrollY = window.scrollY || window.pageYOffset;
      let showThreshold = 600; // Fallback
      
      // Check if we're on about.html page - check both pathname and if .about-cta exists
      const aboutCtaSection = document.querySelector('.about-cta');
      const isAboutPage = window.location.pathname.includes('about.html') || 
                          window.location.href.includes('about.html') ||
                          (aboutCtaSection !== null);
      
      if (isAboutPage) {
        // On about page, show button after "Ready to create" section
        if (aboutCtaSection) {
          const ctaRect = aboutCtaSection.getBoundingClientRect();
          const ctaTop = ctaRect.top + scrollY;
          // Show button when scrolled to or past the CTA section - use a more generous threshold
          showThreshold = Math.max(400, ctaTop - 400); // Show 400px before reaching the section, but at least 400px from top
        } else {
          // Fallback: show after 400px scroll on about page
          showThreshold = 400;
        }
      } else {
        // On main page, show button after about section
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          const aboutRect = aboutSection.getBoundingClientRect();
          const aboutTop = aboutRect.top + scrollY;
          showThreshold = aboutTop;
        }
      }
      
      // Show button if scrolled past threshold
      if (scrollY > showThreshold) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    }
    
    // Smooth scroll to top when clicked
    backToTopButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    // Initialize on page load - call immediately and also on next frame
    updateBackToTop();
    requestAnimationFrame(() => {
      updateBackToTop();
    });
    
    // Also call on scroll to ensure it updates
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    
    // Export function for use in scroll handler
    window.updateBackToTop = updateBackToTop;
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackToTop);
  } else {
    // DOM already ready, but wait a frame to ensure layout is complete
    requestAnimationFrame(initBackToTop);
  }
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
      
      // Unified click handler for all devices
      function handleLogoClick(e) {
        e.preventDefault();
        
        if (isMobileTablet()) {
          // Mobile/Tablet behavior
          if (isTextVisible) {
            // Text is visible - scroll to top and collapse text
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
            // Collapse text immediately
            toggleLogoText();
          } else {
            // Text is hidden - toggle to show text
            toggleLogoText();
          }
        } else {
          // Desktop behavior - always scroll to top
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
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
            if (isTextVisible) {
              // Text is already visible - allow navigation to home
              // Don't prevent default
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
// Dev Tools Easter Egg - ASCII Art "Artur Morin"
// The ASCII art is now in the HTML comment at the top of the page
// This will be visible in the Elements tab when inspecting the HTML
// =============================================================================

