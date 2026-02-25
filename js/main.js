// Cache-busting helper: keep a versioned URL so mobile browsers don't stick to stale cached HTML
(function ensureVersionedUrl() {
  const BUILD_VERSION = '20260225h';
  try {
    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') return;

    const url = new URL(window.location.href);
    if (url.searchParams.get('v') === BUILD_VERSION) return;

    const alreadyForced = window.sessionStorage.getItem('forcedBuildVersion');
    if (alreadyForced === BUILD_VERSION) return;

    url.searchParams.set('v', BUILD_VERSION);
    window.sessionStorage.setItem('forcedBuildVersion', BUILD_VERSION);
    window.location.replace(url.toString());
  } catch {
    // ignore
  }
})();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 10px 30px -10px rgba(0, 0, 0, 0.7)';
    } else {
        header.style.boxShadow = 'none';
    }
    
    if (currentScroll > lastScroll && currentScroll > 500) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});

// Fade-in animation on scroll
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  // If the page has a cache-busting version in the URL, propagate it to internal links
  try {
    const currentUrl = new URL(window.location.href);
    const v = currentUrl.searchParams.get('v');
    if (v) {
      document.querySelectorAll('a[href]').forEach((a) => {
        const rawHref = a.getAttribute('href');
        if (!rawHref) return;
        if (rawHref.startsWith('#')) return;
        if (rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return;
        if (rawHref.startsWith('http://') || rawHref.startsWith('https://')) return;

        let linkUrl;
        try {
          linkUrl = new URL(rawHref, window.location.href);
        } catch {
          return;
        }

        if (linkUrl.origin !== currentUrl.origin) return;
        if (!linkUrl.pathname.endsWith('.html')) return;

        linkUrl.searchParams.set('v', v);
        a.setAttribute('href', linkUrl.toString());
      });
    }
  } catch {
    // ignore
  }

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        // Skip animation for detail pages
        if (section.classList.contains('project-detail') || 
            section.classList.contains('competitions-detail')) {
            return;
        }
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// Mobile sidebar navigation
document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.mobile-sidebar');
  const overlay = document.querySelector('[data-mobile-sidebar-overlay]');
  const closeButton = document.querySelector('.mobile-sidebar-close');

  if (!menuButton || !sidebar || !overlay || !closeButton) return;

  const setExpanded = (isExpanded) => {
    menuButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    sidebar.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
  };

  const openSidebar = () => {
    document.body.classList.add('sidebar-open');
    setExpanded(true);
  };

  const closeSidebar = () => {
    document.body.classList.remove('sidebar-open');
    setExpanded(false);
  };

  const toggleSidebar = () => {
    if (document.body.classList.contains('sidebar-open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  menuButton.addEventListener('click', toggleSidebar);
  closeButton.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  sidebar.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.closest('a')) {
      closeSidebar();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeSidebar();
  });

  setExpanded(false);
});

// Add CSS class for fade-in effect
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Custom cursor with canvas
function followingDotCursor(options) {
  let hasWrapperEl = options && options.element;
  let element = hasWrapperEl || document.body;

  let width = window.innerWidth;
  let height = window.innerHeight;
  let cursor = { x: width / 2, y: width / 2 };
  let dot = new Dot(width / 2, height / 2, 10, 5);
  let canvas, context, animationFrame;
  let color = options?.color || "#323232a6";
  let isHoveringLink = false;
  let isHoveringText = false;
  let currentTextHeight = 30;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // Re-initialise or destroy the cursor when the prefers-reduced-motion setting changes
  prefersReducedMotion.onchange = () => {
    if (prefersReducedMotion.matches) {
      destroy();
    } else {
      init();
    }
  };

  function init() {
    // Don't show the cursor trail if the user has prefers-reduced-motion enabled
    if (prefersReducedMotion.matches) {
      console.log(
        "This browser has prefers reduced motion turned on, so the cursor did not init"
      );
      return false;
    }

    canvas = document.createElement("canvas");
    context = canvas.getContext("2d");
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = options?.zIndex || "9999999999";

    if (hasWrapperEl) {
      canvas.style.position = "absolute";
      element.appendChild(canvas);
      canvas.width = element.clientWidth;
      canvas.height = element.clientHeight;
    } else {
      canvas.style.position = "fixed";
      document.body.appendChild(canvas);
      canvas.width = width;
      canvas.height = height;
    }

    bindEvents();
    setupHoverDetection();
    loop();
  }

  // Bind events that are needed
  function bindEvents() {
    element.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onWindowResize);
  }

  function setupHoverDetection() {
    // Wait for DOM to be ready
    const setupEvents = () => {
      // Detect links and buttons
      const linkElements = document.querySelectorAll('a, button, .nav-link, .btn-outline');
      linkElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
          isHoveringLink = true;
          isHoveringText = false;
          el.style.cursor = 'none';
        });
        
        el.addEventListener('mouseleave', () => {
          isHoveringLink = false;
        });
      });

      // Detect text elements
      const textElements = document.querySelectorAll('h1, h2, h3, p, li, span');
      textElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
          if (!el.closest('a') && !el.closest('button')) {
            isHoveringText = true;
            isHoveringLink = false;
            
            // Calculate dynamic height based on element
            const computedStyle = window.getComputedStyle(el);
            const fontSize = parseInt(computedStyle.fontSize);
            currentTextHeight = Math.max(fontSize * 0.8, 20); // Minimum 20px
          }
        });
        
        el.addEventListener('mouseleave', (e) => {
          // Check if we're not moving to another text element
          const relatedTarget = e.relatedTarget;
          if (!relatedTarget || (!relatedTarget.matches('h1, h2, h3, p, li, span') && !relatedTarget.closest('h1, h2, h3, p, li, span'))) {
            isHoveringText = false;
          }
        });
      });

      // Special handling for hero section elements
      const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .intro-text');
      heroElements.forEach(el => {
        el.style.pointerEvents = 'auto';
        el.addEventListener('mouseenter', () => {
          isHoveringText = true;
          isHoveringLink = false;
          
          const computedStyle = window.getComputedStyle(el);
          const fontSize = parseInt(computedStyle.fontSize);
          currentTextHeight = Math.max(fontSize * 0.8, 20);
        });
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupEvents);
    } else {
      setTimeout(setupEvents, 100);
    }
  }

  function onWindowResize(e) {
    width = window.innerWidth;
    height = window.innerHeight;

    if (hasWrapperEl) {
      canvas.width = element.clientWidth;
      canvas.height = element.clientHeight;
    } else {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function onMouseMove(e) {
    if (hasWrapperEl) {
      const boundingRect = element.getBoundingClientRect();
      cursor.x = e.clientX - boundingRect.left;
      cursor.y = e.clientY - boundingRect.top;
    } else {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    }
  }

  function updateDot() {
    context.clearRect(0, 0, width, height);

    dot.moveTowards(cursor.x, cursor.y, context, isHoveringLink, isHoveringText);
  }

  function loop() {
    updateDot();
    animationFrame = requestAnimationFrame(loop);
  }

  function destroy() {
    if (canvas) canvas.remove();
    if (animationFrame) cancelAnimationFrame(animationFrame);
    element.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("resize", onWindowResize);
  }

  function Dot(x, y, width, lag) {
    this.position = { x: x, y: y };
    this.width = width;
    this.lag = lag;

    this.moveTowards = function (x, y, context, isHoveringLink, isHoveringText) {
      this.position.x += (x - this.position.x) / this.lag;
      this.position.y += (y - this.position.y) / this.lag;

      context.fillStyle = color;
      
      if (isHoveringText) {
        // Dynamic vertical line for text based on font size
        const lineHeight = currentTextHeight;
        context.fillRect(this.position.x - 1, this.position.y - lineHeight/2, 2, lineHeight);
      } else if (isHoveringLink) {
        // Larger circle for links
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.width * 2, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
      } else {
        // Normal circle
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.width, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
      }
    };
  }

  init();

  return {
    destroy: destroy
  };
}

// Initialize cursor (desktop only)
let customCursorController = null;

function removeCursorCanvases() {
  const canvases = document.querySelectorAll('body > canvas');
  canvases.forEach((canvas) => {
    const style = canvas.style;
    const z = Number.parseInt(style.zIndex || '0', 10);
    if (style.pointerEvents === 'none' && style.position === 'fixed' && z >= 9999) {
      canvas.remove();
    }
  });
}

function shouldUseCustomCursor() {
  const isTouchDevice =
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
    ('ontouchstart' in window) ||
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(any-pointer: coarse)').matches;

  if (isTouchDevice) return false;

  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function enableCustomCursor() {
  if (customCursorController) return;
  customCursorController = followingDotCursor({
    color: "rgba(255, 255, 255, 0.5)",
    zIndex: 9999
  });
}

function disableCustomCursor() {
  if (!customCursorController) return;
  customCursorController.destroy();
  customCursorController = null;
}

if (shouldUseCustomCursor()) {
  enableCustomCursor();
} else {
  removeCursorCanvases();
}

window.addEventListener('resize', () => {
  if (shouldUseCustomCursor()) {
    enableCustomCursor();
  } else {
    disableCustomCursor();
    removeCursorCanvases();
  }
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
  // Setup smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Initialize Project Slideshows
  initializeSlideshows();
});

// Project Slideshow Functionality
function initializeSlideshows() {
  const slideshows = document.querySelectorAll('.project-slideshow');
  
  slideshows.forEach(slideshow => {
    const images = slideshow.querySelectorAll('.slideshow-image');
    const dots = slideshow.querySelectorAll('.dot');
    const prevBtn = slideshow.querySelector('.slideshow-prev');
    const nextBtn = slideshow.querySelector('.slideshow-next');
    let currentSlide = 0;
    let autoplayInterval;

    function showSlide(index) {
      images.forEach(img => img.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      if (index >= images.length) {
        currentSlide = 0;
      } else if (index < 0) {
        currentSlide = images.length - 1;
      } else {
        currentSlide = index;
      }
      
      images[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    function prevSlide() {
      showSlide(currentSlide - 1);
    }

    function startAutoplay() {
      autoplayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }

    // Event listeners for navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoplay();
        startAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoplay();
        startAutoplay();
      });
    }

    // Event listeners for dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        stopAutoplay();
        startAutoplay();
      });
    });

    // Pause autoplay on hover
    slideshow.addEventListener('mouseenter', stopAutoplay);
    slideshow.addEventListener('mouseleave', startAutoplay);

    // Start autoplay
    startAutoplay();
  });
}

// Detail Page Slideshow
const detailSlideshows = document.querySelectorAll('.detail-slideshow');
if (detailSlideshows.length > 0) {
  detailSlideshows.forEach(slideshow => {
    const slides = slideshow.querySelectorAll('.detail-slide');
    const prevBtn = slideshow.querySelector('.detail-prev');
    const nextBtn = slideshow.querySelector('.detail-next');
    const dots = slideshow.querySelectorAll('.detail-dot');
    
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
      // Remove active class from all slides and dots
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));

      // Add active class to current slide and dot
      slides[index].classList.add('active');
      dots[index].classList.add('active');
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    }

    function startAutoplay() {
      slideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
      clearInterval(slideInterval);
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', () => {
      prevSlide();
      stopAutoplay();
      startAutoplay();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
      nextSlide();
      stopAutoplay();
      startAutoplay();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
        stopAutoplay();
        startAutoplay();
      });
    });

    // Pause autoplay on hover
    slideshow.addEventListener('mouseenter', stopAutoplay);
    slideshow.addEventListener('mouseleave', startAutoplay);

    // Start autoplay
    startAutoplay();
  });
}

console.log('Portfolio loaded successfully!');
