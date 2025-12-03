/**
 * About Page Interactions
 * =======================
 * Parallax, reveal animations, tabbed content, carousel, and ritual list.
 */

// =============================================================================
// Parallax Scrolling Effect (Synced with main page)
// =============================================================================
const parallaxSections = document.querySelectorAll(".parallax");

function updateParallax() {
  const scrollTop = window.scrollY;
  parallaxSections.forEach((section) => {
    const speed = Number(section.dataset.speed || 0.1);
    const rawOffset = scrollTop * speed * -0.2;
    const clamped = Math.max(-60, Math.min(60, rawOffset));
    section.style.setProperty("--parallax-offset", `${clamped}px`);
  });
}

// =============================================================================
// Scroll-Triggered Reveal Animations (Synced with main page)
// =============================================================================
const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);
revealElements.forEach((el) => revealObserver.observe(el));

// =============================================================================
// Tenet Tabs
const tenetData = {
  materials: {
    title: "Recycled alloys, responsive skin",
    body: "Each plate mixes forged aluminum with recycled composite to keep harmonics low while staying light enough for field kit packing.",
    list: [
      ["Reverberation", "2.5ms dampening"],
      ["Protective skin", "Graphene weave"],
      ["Injection time", "4h thermal cycle"],
    ],
  },
  signal: {
    title: "Signal lattice stays superpositioned",
    body: "Tri-band mesh hops between channels automatically so multiplayer sessions don't drop frames or fidelity.",
    list: [
      ["Latency envelope", "11ms avg"],
      ["Dual antennas", "Ceramic tip"],
      ["Cloud sync", "Encrypted delta"],
    ],
  },
  support: {
    title: "Care layers you never have to chase",
    body: "Diagnostics run at 2 a.m. local time and file a ticket only if we detect drift two nights in a row.",
    list: [
      ["Swap window", "< 72h"],
      ["Loaner pool", "Global hubs"],
      ["Coverage", "24-month rolling"],
    ],
  },
  workflow: {
    title: "Workflow mirrors what your team sketches",
    body: "Preset symmetries reflect motion from left to right, so cross-discipline teams keep shared context instantly.",
    list: [
      ["Preset banks", "12 slots"],
      ["Gesture memory", "Adaptive AI"],
      ["Session share", "QR handshake"],
    ],
  },
};

const tenetButtons = document.querySelectorAll(".tenet-tab");
const tenetTitle = document.getElementById("tenet-title");
const tenetBody = document.getElementById("tenet-body");
const tenetList = document.getElementById("tenet-list");

tenetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tenetButtons.forEach((btn) => btn.setAttribute("aria-selected", "false"));
    button.setAttribute("aria-selected", "true");
    const key = button.dataset.tenet;
    const data = tenetData[key];
    if (!data) return;
    tenetTitle.textContent = data.title;
    tenetBody.textContent = data.body;
    tenetList.innerHTML = data.list
      .map((item) => `<li><strong>${item[0]}</strong><span>${item[1]}</span></li>`)
      .join("");
  });
});

// Carousel
const originalSlides = Array.from(document.querySelectorAll(".carousel-slide"));
const track = document.querySelector(".carousel-track");
const windowEl = document.querySelector(".carousel-window");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");
const dots = Array.from(document.querySelectorAll(".carousel-dots button"));
let currentIndex = 0;
let isTransitioning = false;
const imageData = new Map();

// Clone first and last slides for infinite loop
if (track && originalSlides.length > 0) {
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
  firstClone.setAttribute("aria-hidden", "true");
  lastClone.setAttribute("aria-hidden", "true");
  track.appendChild(firstClone);
  track.insertBefore(lastClone, originalSlides[0]);
}

const slides = originalSlides;

function measureImage(slide) {
  const img = slide.querySelector("img");
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

  const img = slide.querySelector("img");
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
    slide.setAttribute("aria-hidden", index === currentIndex ? "false" : "true");
  });
  dots.forEach((dot, index) => {
    dot.setAttribute("aria-selected", index === currentIndex ? "true" : "false");
  });
}

function goNext() {
  if (isTransitioning) return;
  const totalSlides = slides.length;
  const nextPos = currentIndex + 2;

  isTransitioning = true;
  track.style.transition = "transform 0.6s cubic-bezier(0.4, 0.15, 0.15, 1)";
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
  track.style.transition = "transform 0.6s cubic-bezier(0.4, 0.15, 0.15, 1)";
  track.style.transform = `translateX(-${prevPos * 100}%)`;

  currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  updateDots();
  resizeWindowForSlide(currentIndex);
}

function goToSlide(index) {
  if (isTransitioning || index === currentIndex) return;

  isTransitioning = true;
  track.style.transition = "transform 0.6s cubic-bezier(0.4, 0.15, 0.15, 1)";
  track.style.transform = `translateX(-${(index + 1) * 100}%)`;

  currentIndex = index;
  updateDots();
  resizeWindowForSlide(currentIndex);
}

// Handle seamless loop after transition
track?.addEventListener("transitionend", () => {
  isTransitioning = false;
  const totalSlides = slides.length;
  const currentTransform = track.style.transform;
  const match = currentTransform.match(/translateX\(-?(\d+)%\)/);

  if (match) {
    const visualPos = parseInt(match[1]) / 100;

    if (visualPos === totalSlides + 1) {
      track.style.transition = "none";
      track.style.transform = `translateX(-100%)`;
    }
    if (visualPos === 0) {
      track.style.transition = "none";
      track.style.transform = `translateX(-${totalSlides}%)`;
    }
  }
});

prevBtn?.addEventListener("click", goPrev);
nextBtn?.addEventListener("click", goNext);
dots.forEach((dot, index) => dot.addEventListener("click", () => goToSlide(index)));

let carouselTimer = setInterval(goNext, 6000);
track?.addEventListener("mouseenter", () => clearInterval(carouselTimer));
track?.addEventListener("mouseleave", () => {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(goNext, 6000);
});

// Initialize carousel
Promise.all(slides.map((slide) => measureImage(slide))).then(() => {
  if (track) {
    track.style.transition = "none";
    track.style.transform = "translateX(-100%)";
  }
  resizeWindowForSlide(0);
});

// Interaction List
const ritualButtons = document.querySelectorAll(".interaction-list button");
const progressFill = document.querySelector(".interaction-progress-fill");
const interactionCount = document.getElementById("interaction-count");

function updateInteractionProgress() {
  const completed = document.querySelectorAll(".interaction-list button.done").length;
  const total = ritualButtons.length;
  const percent = Math.round((completed / total) * 100);
  progressFill?.style.setProperty("--progress", `${percent}%`);
  if (interactionCount) {
    interactionCount.textContent = `${completed} of ${total} dialed in`;
  }
}

ritualButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("done");
    updateInteractionProgress();
  });
});

updateInteractionProgress();

// Footer Year
const aboutYear = document.getElementById("about-year");
if (aboutYear) {
  aboutYear.textContent = new Date().getFullYear();
}

// =============================================================================
// Initialization
// =============================================================================
updateParallax();
window.addEventListener("scroll", updateParallax, { passive: true });
