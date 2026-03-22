// Projects page specific JavaScript

function initMobileHoverSimulation() {
    const cards = Array.from(document.querySelectorAll('.project-list-card'));
    if (cards.length === 0) return;

    let activeCard = null;

    function setActive(card) {
        if (activeCard === card) return;
        if (activeCard) activeCard.classList.remove('is-active');
        activeCard = card;
        if (activeCard) activeCard.classList.add('is-active');
    }

    // Prefer reduced motion: keep behavior functional but avoid "popping" multiple cards.
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
        // Fallback: mark the first card as active.
        setActive(cards[0]);
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            let best = null;
            let bestRatio = 0;

            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                if (entry.intersectionRatio > bestRatio) {
                    best = entry.target;
                    bestRatio = entry.intersectionRatio;
                }
            }

            // Only activate when a card is clearly in view.
            if (best && bestRatio >= 0.55) {
                setActive(best);
            }
        },
        {
            root: null,
            threshold: [0, 0.25, 0.4, 0.55, 0.7, 0.85, 1],
        }
    );

    cards.forEach((card) => observer.observe(card));

    // Initialize with the first card active until observer fires.
    setActive(cards[0]);
}

// Filter projects by technology (for future enhancement)
function filterProjects(tech) {
    const projectItems = document.querySelectorAll('.project-item');
    
    projectItems.forEach(item => {
        const techTags = item.querySelectorAll('.tech-tag');
        let hasMatch = false;
        
        techTags.forEach(tag => {
            if (tag.textContent.toLowerCase().includes(tech.toLowerCase()) || tech === 'all') {
                hasMatch = true;
            }
        });
        
        if (hasMatch) {
            item.style.display = 'flex';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

// Initialize project animations
document.addEventListener('DOMContentLoaded', () => {
    initMobileHoverSimulation();
});

// Search projects (for future enhancement)
function searchProjects(query) {
    const projectItems = document.querySelectorAll('.project-item');
    
    projectItems.forEach(item => {
        const title = item.querySelector('h2').textContent.toLowerCase();
        const description = item.querySelector('.project-description').textContent.toLowerCase();
        
        if (title.includes(query.toLowerCase()) || description.includes(query.toLowerCase()) || query === '') {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

console.log('Projects page loaded!');
