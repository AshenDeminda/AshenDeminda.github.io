// Competition Image Auto-Loader
// Automatically loads images from competition folders (1.jpg, 2.jpg, 3.jpg, etc.)

document.addEventListener('DOMContentLoaded', function() {
    const competitions = [
        {
            id: 'code-night',
            folder: 'Code Night 2025',
            name: 'Code Night 2025',
            maxImages: 10 // Maximum number of images to try loading
        },
        {
            id: 'ieee-xtreme',
            folder: 'IEEE Xtreme 18.0',
            name: 'IEEE Xtreme 18.0',
            maxImages: 10
        },
        {
            id: 'algoxplore',
            folder: 'Algoxplore 1.0',
            name: 'Algoxplore 1.0',
            maxImages: 10
        },
        {
            id: 'codex',
            folder: 'Codex 2025',
            name: 'Codex 2025',
            maxImages: 10
        },
        {
            id: 'codequest',
            folder: 'CodeQuest',
            name: 'CodeQuest',
            maxImages: 10
        },
        {
            id: 'red-cypher',
            folder: 'Red Cypher 2.0',
            name: 'Red Cypher 2.0',
            maxImages: 10
        },
        {
            id: 'eminence',
            folder: 'Eminence 5.0',
            name: 'Eminence 5.0',
            maxImages: 10
        }
    ];

    // Load images for detail page (competitions.html)
    competitions.forEach(competition => {
        loadCompetitionImages(competition);
    });

    // Load images for main page (index.html)
    loadMainPageCompetitionImages(competitions);
});

async function loadCompetitionImages(competition) {
    const competitionElement = document.getElementById(competition.id);
    if (!competitionElement) return;

    const slideshow = competitionElement.querySelector('.detail-slideshow');
    if (!slideshow) return;

    const basePath = `assets/images/Competitions/${competition.folder}/`;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const loadedImages = [];

    // Try to load images 1.jpg, 2.jpg, 3.jpg, etc.
    for (let i = 1; i <= competition.maxImages; i++) {
        let imageLoaded = false;
        
        // Try different extensions
        for (const ext of imageExtensions) {
            const imagePath = `${basePath}${i}.${ext}`;
            
            if (await imageExists(imagePath)) {
                loadedImages.push({
                    path: imagePath,
                    alt: `${competition.name} - ${i}`
                });
                imageLoaded = true;
                break; // Found the image, stop trying other extensions
            }
        }
        
        // If no image found with this number, assume no more images exist
        if (!imageLoaded && i > 1) {
            break;
        }
    }

    // If images were loaded, update the slideshow
    if (loadedImages.length > 0) {
        updateSlideshow(slideshow, loadedImages);
    }
}

function imageExists(imagePath) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imagePath;
    });
}

function updateSlideshow(slideshow, images) {
    // Clear existing slides and dots
    const existingSlides = slideshow.querySelectorAll('.detail-slide');
    const existingDots = slideshow.querySelector('.detail-dots');
    
    existingSlides.forEach(slide => slide.remove());
    if (existingDots) {
        existingDots.innerHTML = '';
    }

    // Get navigation buttons
    const prevBtn = slideshow.querySelector('.detail-prev');
    const nextBtn = slideshow.querySelector('.detail-next');

    // Add new slides
    images.forEach((image, index) => {
        const img = document.createElement('img');
        img.src = image.path;
        img.alt = image.alt;
        img.className = 'detail-slide';
        if (index === 0) {
            img.classList.add('active');
        }
        
        // Insert before navigation buttons
        if (prevBtn) {
            slideshow.insertBefore(img, prevBtn);
        } else {
            slideshow.appendChild(img);
        }
    });

    // Add new dots
    if (existingDots) {
        images.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'detail-dot';
            dot.dataset.slide = index;
            if (index === 0) {
                dot.classList.add('active');
            }
            existingDots.appendChild(dot);
        });
    }

    // Initialize slideshow functionality
    initializeDetailSlideshow(slideshow);
}

function initializeDetailSlideshow(slideshow) {
    const slides = slideshow.querySelectorAll('.detail-slide');
    const prevBtn = slideshow.querySelector('.detail-prev');
    const nextBtn = slideshow.querySelector('.detail-next');
    const dots = slideshow.querySelectorAll('.detail-dot');
    
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[index].classList.add('active');
        if (dots[index]) {
            dots[index].classList.add('active');
        }
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
        if (slides.length > 1) {
            slideInterval = setInterval(nextSlide, 5000);
        }
    }

    function stopAutoplay() {
        clearInterval(slideInterval);
    }

    // Remove old event listeners by cloning and replacing
    if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        newPrevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoplay();
            startAutoplay();
        });
    }

    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        newNextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoplay();
            startAutoplay();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
            stopAutoplay();
            startAutoplay();
        });
    });

    slideshow.addEventListener('mouseenter', stopAutoplay);
    slideshow.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
}

// Load images for main page competition cards
async function loadMainPageCompetitionImages(competitions) {
    const competitionCards = document.querySelectorAll('.competition-card');
    
    for (const card of competitionCards) {
        const href = card.getAttribute('href');
        if (!href) continue;
        
        // Extract competition ID from href (e.g., "competitions.html#code-night" -> "code-night")
        const competitionId = href.split('#')[1];
        const competition = competitions.find(c => c.id === competitionId);
        
        if (!competition) continue;
        
        const basePath = `assets/images/Competitions/${competition.folder}/`;
        const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        
        // Try to load the first image
        let imageLoaded = false;
        for (const ext of imageExtensions) {
            const imagePath = `${basePath}1.${ext}`;
            
            if (await imageExists(imagePath)) {
                const img = card.querySelector('.competition-card-image img');
                if (img) {
                    img.src = imagePath;
                    img.alt = competition.name;
                }
                imageLoaded = true;
                break;
            }
        }
    }
}
