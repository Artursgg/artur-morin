/**
 * SpotlightButton - Interactive WW2 Projector Spotlight Button Component
 * 
 * Creates a button with a dynamic spotlight effect that follows the mouse cursor,
 * simulating a vintage film projector beam. The spotlight activates when the mouse
 * is near the button (not just inside it) and uses a circular beam pattern.
 */

const { useState, useRef, useEffect } = React;

function SpotlightButton({ href, children, className = '' }) {
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 50, y: 50 });
  const [spotlightOpacity, setSpotlightOpacity] = useState(0);
  const buttonRef = useRef(null);
  const animationFrameRef = useRef(null);
  const opacityRef = useRef(0); // Track current opacity for fade-out animation
  const proximityRadius = 200; // Pixels - how close mouse needs to be to activate

  /**
   * Calculate distance from mouse to button center
   */
  const getDistanceToButton = (mouseX, mouseY) => {
    if (!buttonRef.current) return Infinity;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;
    
    const dx = mouseX - buttonCenterX;
    const dy = mouseY - buttonCenterY;
    
    return Math.sqrt(dx * dx + dy * dy);
  };

  /**
   * Global mouse move handler - tracks mouse position relative to button
   * Activates spotlight when mouse is within proximity radius
   */
  const handleGlobalMouseMove = (e) => {
    if (!buttonRef.current) return;

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const rect = buttonRef.current.getBoundingClientRect();
      const distance = getDistanceToButton(e.clientX, e.clientY);
      
      // Calculate position relative to button (can be outside button bounds)
      // Match CSS extension: 300px total (150px on each side)
      const extension = 150;
      const extendedLeft = rect.left - extension;
      const extendedTop = rect.top - extension;
      const extendedWidth = rect.width + (extension * 2);
      const extendedHeight = rect.height + (extension * 2);
      
      // Calculate position relative to extended area
      const relativeX = e.clientX - extendedLeft;
      const relativeY = e.clientY - extendedTop;
      
      // Convert to percentage (clamp to ensure valid range)
      const x = Math.max(0, Math.min(100, (relativeX / extendedWidth) * 100));
      const y = Math.max(0, Math.min(100, (relativeY / extendedHeight) * 100));

      setSpotlightPosition({ x, y });

      // Activate spotlight if mouse is within proximity radius
      if (distance <= proximityRadius) {
        // Calculate opacity based on distance (closer = brighter)
        const proximityRatio = 1 - (distance / proximityRadius);
        const opacity = Math.max(0, Math.min(1, proximityRatio * 1.2)); // Slight boost for visibility
        setSpotlightOpacity(opacity);
        opacityRef.current = opacity;
      } else {
        // Fade out when mouse moves away
        setSpotlightOpacity(0);
        opacityRef.current = 0;
      }
    });
  };

  /**
   * Handle mouse enter - ensure spotlight is active
   */
  const handleMouseEnter = () => {
    setSpotlightOpacity(1);
    opacityRef.current = 1;
  };

  /**
   * Handle mouse leave - fade out spotlight smoothly
   */
  const handleMouseLeave = () => {
    // Smooth fade out using ref to get current value
    const startOpacity = opacityRef.current;
    const duration = 300; // ms
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newOpacity = startOpacity * (1 - easeOut);
      setSpotlightOpacity(newOpacity);
      opacityRef.current = newOpacity;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Set up global mouse tracking
  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Empty dependency array - listener is set up once

  return (
    <a
      href={href}
      ref={buttonRef}
      className={`signup-btn ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        '--spotlight-x': `${spotlightPosition.x}%`,
        '--spotlight-y': `${spotlightPosition.y}%`,
        '--spotlight-opacity': spotlightOpacity,
      }}
    >
      <span>{children}</span>
    </a>
  );
}

