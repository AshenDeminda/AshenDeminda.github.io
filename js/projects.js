// Projects page specific JavaScript

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
    const projectItems = document.querySelectorAll('.project-item');
    
    projectItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 * index);
    });
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
