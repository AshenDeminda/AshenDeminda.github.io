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
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
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
        }
      });
      
      el.addEventListener('mouseleave', () => {
        isHoveringText = false;
      });
    });
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
    canvas.remove();
    cancelAnimationFrame(loop);
    element.removeEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onWindowResize);
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
        // Vertical line for text
        context.fillRect(this.position.x - 1, this.position.y - 15, 2, 30);
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

// Initialize cursor
followingDotCursor({
  color: "rgba(255, 255, 255, 0.5)",
  zIndex: 9999
});

console.log('Portfolio loaded successfully!');
