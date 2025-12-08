/**
 * Privacy Policy Page - Specific JavaScript
 * ==========================================
 */

// Set current date in privacy policy
(function() {
  'use strict';
  
  const currentDateElement = document.getElementById('current-date');
  if (currentDateElement) {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    currentDateElement.textContent = formattedDate;
  }
})();

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
      
      // Check if we're on a subpage (about, privacy-policy, portfolio)
      function isSubpage() {
        const pathname = window.location.pathname;
        return pathname.includes('/about/') || 
               pathname.includes('/privacy-policy/') ||
               pathname.includes('/portfolio/') ||
               pathname.includes('/terms-of-use/') ||
               pathname.includes('/thank-you/');
      }
      
      function handleLogoClick(e) {
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollThreshold = 100; // Consider "at top" if scrolled less than 100px
        const isAtTop = scrollY <= scrollThreshold;
        const isOnSubpage = isSubpage();
        
        // On subpage at top - let the link navigate naturally to home (don't prevent default)
        if (isOnSubpage && isAtTop) {
          // Don't prevent default - let the href="/" work naturally
          return true;
        }
        
        // Otherwise, prevent default and handle the toggle/scroll behavior
        e.preventDefault();
        
        if (isMobileTablet()) {
          // Mobile/Tablet behavior
          if (isTextVisible) {
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
          // Desktop behavior - scroll to top
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
            const scrollY = window.scrollY || window.pageYOffset;
            const scrollThreshold = 100;
            const isAtTop = scrollY <= scrollThreshold;
            const isOnSubpage = isSubpage();
            
            // If on subpage at top, let the link navigate naturally (don't toggle)
            if (isOnSubpage && isAtTop) {
              // Don't prevent default - let the href="/" work naturally
              return true;
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
// Page Loaded Class
// =============================================================================
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

// =============================================================================
// Back/Forward Cache (bfcache) Support
// Handle page restoration from bfcache to ensure everything works correctly
// =============================================================================
window.addEventListener('pageshow', (event) => {
  // Check if page was restored from bfcache
  if (event.persisted) {
    // Re-initialize logo state if needed
    const logo = document.querySelector('.logo');
    if (logo) {
      const logoMark = logo.querySelector('.logo-mark');
      const logoNameFirst = logo.querySelector('.logo-name-first');
      const logoNameLast = logo.querySelector('.logo-name-last');
      
      if (logoMark && logoNameFirst && logoNameLast) {
        // Re-check if we're on mobile/tablet
        function isMobileTablet() {
          return window.innerWidth <= 1024;
        }
        
        if (isMobileTablet()) {
          const scrollY = window.scrollY || window.pageYOffset;
          if (scrollY < 100) {
            // At top, ensure text is hidden
            logo.classList.remove('logo-text-expanded');
            logo.classList.add('logo-text-hidden');
          }
        }
      }
    }
  }
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

