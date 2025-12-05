/**
 * 404 Error Page - Specific JavaScript
 * =====================================
 */

(function() {
  'use strict';
  
  // Add subtle parallax to viewfinder on mouse move
  document.addEventListener('mousemove', (e) => {
    const viewfinder = document.querySelector('.viewfinder');
    if (viewfinder) {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      viewfinder.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
    }
  });

  // Random film strip frame highlight
  const frames = document.querySelectorAll('.frame:not(.current)');
  if (frames.length > 0) {
    setInterval(() => {
      frames.forEach(f => f.style.opacity = '0.5');
      const random = frames[Math.floor(Math.random() * frames.length)];
      if (random) random.style.opacity = '0.8';
    }, 2000);
  }
})();

