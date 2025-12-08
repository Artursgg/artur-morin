/**
 * SmileXFD / Artur Morin - Main Page Interactions
 * ================================================
 * This file handles all dynamic behavior for the landing page:
 * - Parallax scrolling effect
 * - Scroll-triggered reveal animations
 * - Interactive tilt effects on cards
 * - Contact form with client-side CAPTCHA
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
// DOM Element References
// Grab all the elements we'll need to interact with upfront.
// =============================================================================
const parallaxSections = document.querySelectorAll(".parallax");
const revealElements = document.querySelectorAll(".reveal");
const noteToggle = document.getElementById("note-toggle");
const noteCard = document.getElementById("note-card");
const footerYear = document.getElementById("year");

// Challenge/CAPTCHA elements for the contact form
const challengeText = document.getElementById("challenge-text");
const challengeInput = document.getElementById("challenge-input");
const challengeHint = document.getElementById("challenge-hint");
let challengeAnswer = ""; // Stores the current correct answer

// =============================================================================
// CAPTCHA Challenge Generator
// Creates a simple human verification question (math or word typing).
// This is NOT a replacement for server-side validation - it's just a
// basic deterrent against simple bots.
// =============================================================================
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
      { text: 'Type the word "Dominant"', answer: "Dominant" },
      { text: 'Type the word "SmileXFD"', answer: "SmileXFD" },
      { text: 'Type the number "507"', answer: "507" },
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
// Enhanced Parallax Scrolling Effect with Smooth Easing
// Moves sections at different speeds as user scrolls to create depth.
// Uses requestAnimationFrame for smooth 60fps animations and easing for natural motion.
// =============================================================================
let lastScrollTop = 0;
let scrollVelocity = 0;
let ticking = false;

// Easing function for smooth parallax motion (ease-out cubic)
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function updateParallax() {
  const scrollTop = window.scrollY;
  const delta = scrollTop - lastScrollTop;
  
  // Calculate scroll velocity for dynamic effects
  scrollVelocity = delta * 0.1 + scrollVelocity * 0.9; // Smooth velocity tracking
  
  // Get document and viewport dimensions to prevent overscroll
  const documentHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  const scrollBottom = scrollTop + viewportHeight;
  const distanceFromBottom = documentHeight - scrollBottom;
  // Reduce parallax effect when near bottom (within 200px) to prevent overscroll
  const bottomProximityFactor = Math.min(1, Math.max(0, distanceFromBottom / 200));
  
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
    
    // Calculate offset with velocity influence for more dynamic feel
    const baseOffset = eased * speed * 100;
    const velocityOffset = scrollVelocity * speed * 0.5;
    const totalOffset = baseOffset + velocityOffset;
    
    // Clamp to prevent extreme movement, and reduce near bottom
    const clamped = Math.max(-80, Math.min(80, totalOffset)) * bottomProximityFactor;
    
    // Apply with smooth transform
    section.style.setProperty("--parallax-offset", `${clamped}px`);
    section.style.transform = `translateY(${clamped}px)`;
    section.style.transition = 'transform 0.1s ease-out';
  });
  
  lastScrollTop = scrollTop;
  ticking = false;
}

// Throttled scroll handler using requestAnimationFrame for performance
function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
}

// =============================================================================
// Enhanced Scroll-Triggered Reveal Animations
// Uses IntersectionObserver with smooth staggered animations.
// Elements fade in and slide up with easing for natural motion.
// =============================================================================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation delays for sequential reveals
        const delay = index % 3 * 100; // 0ms, 100ms, 200ms cycle
        setTimeout(() => {
          entry.target.classList.add("visible");
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { 
    threshold: 0.15, // Trigger when 15% visible for earlier animation
    rootMargin: "0px 0px -50px 0px" // Start animation slightly before element enters
  }
);

// Register all reveal elements with the observer
revealElements.forEach((el) => revealObserver.observe(el));

// =============================================================================
// Note Card Interaction
// Clicking "Show Reminder" smoothly scrolls to the note card and
// triggers a pulse animation to draw attention.
// =============================================================================
if (noteToggle && noteCard) {
  noteToggle.addEventListener("click", () => {
    noteCard.scrollIntoView({ behavior: "smooth", block: "center" });
    noteCard.classList.add("pulse");
    // Remove class after animation completes so it can be triggered again
    setTimeout(() => noteCard.classList.remove("pulse"), 1000);
  });
}

// =============================================================================
// Hero Media 3D Tilt Effect
// Subtle rotation based on mouse position for a "hovering" feel.
// =============================================================================
const heroMedia = document.querySelector(".hero-media");
if (heroMedia) {
  heroMedia.addEventListener("mousemove", (event) => {
    const rect = heroMedia.getBoundingClientRect();
    // Calculate position relative to center (-0.5 to 0.5), then scale to degrees
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
    heroMedia.style.transform = `rotateX(${y}deg) rotateY(${-x}deg)`;
  });

  heroMedia.addEventListener("mouseleave", () => {
    heroMedia.style.transform = ""; // Reset to default
  });
}

// =============================================================================
// Asymmetric Grid Card Tilt Effect
// Cards lean in opposite directions like crooked paintings:
// - Left card tilts left
// - Center card stays straight
// - Right card tilts right
// =============================================================================
const asymCards = document.querySelectorAll(".asym-grid .grid-card");
asymCards.forEach((card) => {
  const grid = card.closest(".grid");
  let direction = 0; // -1 = left, 0 = center, 1 = right

  if (grid && grid.children.length === 3) {
    const cards = Array.from(grid.children);
    const position = cards.indexOf(card);
    if (position === 0) direction = -1;
    else if (position === 1) direction = 0;
    else if (position === 2) direction = 1;
  }

  card.addEventListener("mouseenter", () => {
    // Apply tilt via CSS variable (used in transform)
    card.style.setProperty("--tilt-angle", `${direction * 3}deg`);
  });

  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--tilt-angle", "0deg");
  });
});

// =============================================================================
// Video Frame Tilt Effect
// Same concept as asymmetric cards - creates a dynamic, playful feel.
// =============================================================================
const videoFrames = document.querySelectorAll(".videos .video-frame");
videoFrames.forEach((frame, index) => {
  // Determine tilt direction based on position
  let direction = 0;
  if (index === 0) direction = -1; // Left video tilts left
  else if (index === 1) direction = 0; // Center stays straight
  else if (index === 2) direction = 1; // Right video tilts right

  frame.addEventListener("mouseenter", () => {
    frame.style.setProperty("--tilt-angle", `${direction * 3}deg`);
  });

  frame.addEventListener("mouseleave", () => {
    frame.style.setProperty("--tilt-angle", "0deg");
  });
});

// =============================================================================
// Contact Form Submission Handler
// Validates the CAPTCHA, sanitizes input, and opens the user's email client
// with a pre-filled message using mailto: protocol.
// NOTE: This is client-side only. For production, use a proper backend.
// =============================================================================
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  const nameInput = document.getElementById("main-name");
  const emailInput = document.getElementById("main-email");
  const messageInput = document.getElementById("main-message");
  const nameError = document.getElementById("main-name-error");
  const emailError = document.getElementById("main-email-error");
  const messageError = document.getElementById("main-message-error");

  // Check if all elements exist
  if (!nameInput || !emailInput || !messageInput || !nameError || !emailError || !messageError) {
    console.error("Form elements not found. Some validation may not work.");
  }

  function validateName() {
    if (!nameInput || !nameError) return false;
    const value = nameInput.value.trim();
    if (!value) {
      nameInput.setAttribute('aria-invalid', 'true');
      nameError.textContent = 'This field is required';
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
    if (!emailInput || !emailError) return false;
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
    if (!messageInput || !messageError) return false;
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

  if (nameInput) nameInput.addEventListener('blur', validateName);
  if (emailInput) emailInput.addEventListener('blur', validateEmail);
  if (messageInput) messageInput.addEventListener('blur', validateMessage);

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Don't actually submit the form

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    // Verify CAPTCHA answer (keep your existing challenge for UX)
    let isChallengeValid = true;
    if (challengeInput && challengeAnswer) {
      const inputValue = challengeInput.value.trim();
      if (inputValue !== challengeAnswer) {
        // Show error state
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

    if (!isNameValid || !isEmailValid || !isMessageValid || !isChallengeValid) {
      // Focus first invalid field
      if (!isNameValid) {
        nameInput.focus();
      } else if (!isEmailValid) {
        emailInput.focus();
      } else if (!isMessageValid) {
        messageInput.focus();
      }
      return; // Stop submission
    }

    // Get reCAPTCHA token
    let recaptchaToken = '';
    try {
      recaptchaToken = await grecaptcha.execute('6LdzCR8sAAAAAByR9D7ud0qxxJkBLlA4aOb-uYFK', { action: 'submit' });
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      // Continue with form submission even if reCAPTCHA fails (graceful degradation)
    }

    // Helper function to sanitize user input
    // Removes newlines (prevents header injection) and caps length
    const sanitize = (value, max = 500) =>
      String(value || "")
        .replace(/[\r\n]/g, " ")
        .slice(0, max)
        .trim();

    // Get form data
    const formData = new FormData(contactForm);
    const name = sanitize(formData.get("name"), 80) || "Prospect";
    const email = sanitize(formData.get("email"), 120);
    const message = sanitize(formData.get("message"), 1000);

    // Build mailto link
    const recipient = contactForm.dataset.mailto || "inquirymorin@gmail.com";
    const subject = encodeURIComponent("Dominant S5 II inquiry");
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    // Send event to Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        'event': 'form_submit',
        'form_name': 'contact_form_main',
        'recaptcha_verified': recaptchaToken ? true : false
      });
    }

    // Open email client
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

    // Update button text to indicate action
    const button = contactForm.querySelector("button");
    if (button) {
      const original = button.textContent;
      button.textContent = "Opening mail client...";
      setTimeout(() => (button.textContent = original), 1800);
    }

    // Reset form and generate new challenge
    contactForm.reset();
    generateChallenge();
  });
}

// =============================================================================
// Dynamic Footer Year
// Automatically updates the copyright year so it's never outdated.
// =============================================================================
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// Smooth scrolling is handled by CSS scroll-behavior: smooth
// No custom JavaScript needed for better performance

// =============================================================================
// Initialization
// Set up initial states and register event listeners.
// =============================================================================
updateParallax(); // Set initial parallax positions
window.addEventListener("scroll", () => {
  onScroll();
}, { passive: true });
generateChallenge(); // Generate initial CAPTCHA

// =============================================================================
// Letter Bounce Effect - Wrap letters in spans for individual animation
// Creates that fun kids' TV show logo effect where letters bounce on hover
// =============================================================================
function wrapLettersInLabels() {
  // Only wrap letters in form-field labels, not challenge-label
  const labels = document.querySelectorAll('.contact-form .form-field > label');
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
    const letters = contactForm.querySelectorAll('.form-field > label .letter');
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
        data.element.style.transform = `translate(${data.currentX}px, ${data.targetY}px)`;
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
// Spotlight Effect for Sign Up Button
// Now handled by React component (SpotlightButton.jsx)
// =============================================================================
