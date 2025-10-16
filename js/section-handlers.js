// Medieval Character Sheet - Section-Specific Handlers
// Location: /home/hullivan/Hugues.W.B.dePingon/js/section-handlers.js

// Portfolio Category Filtering - Function for reinitialization
export function initializePortfolioNavigation() {
    const portNavBtns = document.querySelectorAll('.port-nav-btn');
    const portfolioCategories = document.querySelectorAll('.portfolio-category');
    let pdfsLoaded = new Set(); // Track which categories have loaded PDFs

    // Initialize PDF iframes lazily to reduce initial error spam
    function loadPDFIframes(category, staggerDelay = 0) {
        const categoryName = category.getAttribute('data-category');

        // Only load once per category
        if (pdfsLoaded.has(categoryName)) {
            return;
        }

        const pdfContainers = category.querySelectorAll('[data-pdf-container][data-pdf-src]');

        // Load PDFs with staggered timing to prevent multiple simultaneous errors
        pdfContainers.forEach((container, index) => {
            const pdfSrc = container.getAttribute('data-pdf-src');

            // Only load if we have a data-pdf-src attribute (meaning it hasn't been loaded yet)
            if (pdfSrc) {
                const delay = staggerDelay + (index * 800); // 800ms between each PDF

                setTimeout(() => {
                    // Create iframe dynamically to avoid CSP errors on page load
                    const iframe = document.createElement('iframe');
                    iframe.className = 'pdf-preview-small';
                    iframe.src = pdfSrc;
                    iframe.frameBorder = '0';

                    // Clear container and add iframe
                    container.innerHTML = '';
                    container.appendChild(iframe);
                    container.removeAttribute('data-pdf-src');
                }, delay);
            }
        });

        pdfsLoaded.add(categoryName);
    }

    portNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');

            // Update active button
            portNavBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Show/hide categories with proper animation preparation
            portfolioCategories.forEach(cat => {
                if (cat.getAttribute('data-category') === category) {
                    // First, ensure we're hidden
                    cat.style.opacity = '0';
                    cat.style.display = 'block';

                    // Force reflow to ensure display change is applied
                    cat.offsetHeight;

                    // Remove any existing animation
                    cat.style.animation = 'none';

                    // Force another reflow
                    cat.offsetHeight;

                    // Now apply the animation (this ensures it triggers even on repeated views)
                    requestAnimationFrame(() => {
                        cat.style.opacity = '';
                        cat.style.animation = 'fadeIn 0.5s ease-in-out';
                    });

                    // Load PDF iframes for this category after animation starts
                    setTimeout(() => loadPDFIframes(cat), 800);
                } else {
                    cat.style.display = 'none';
                    cat.style.animation = '';
                    cat.style.opacity = '';
                }
            });
        });
    });

    // Load PDFs for featured category only after user interaction or gentle delay
    // This prevents errors on initial portfolio tab load
    let featuredPDFsScheduled = false;

    function scheduleFeaturedPDFLoad() {
        if (featuredPDFsScheduled) {
            return;
        }
        featuredPDFsScheduled = true;

        const initialCategory = document.querySelector('.portfolio-category[data-category="featured"]');
        if (initialCategory && initialCategory.style.display !== 'none') {
            // Load with much longer delay and staggering to prevent errors
            // The staggerDelay of 4000ms gives the PDF viewer extension plenty of time to initialize
            setTimeout(() => {
                loadPDFIframes(initialCategory, 4000);
            }, 1000);
        }
    }

    // Listen for any user interaction on the portfolio section
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioSection) {
        // Load on scroll
        portfolioSection.addEventListener('scroll', scheduleFeaturedPDFLoad, { once: true, passive: true });

        // Load on mouse move
        portfolioSection.addEventListener('mousemove', scheduleFeaturedPDFLoad, { once: true, passive: true });

        // Load on click anywhere in portfolio
        portfolioSection.addEventListener('click', scheduleFeaturedPDFLoad, { once: true, passive: true });

        // Also schedule load after a gentle delay if no interaction
        // Increased to 4 seconds to give more time for extension initialization
        setTimeout(scheduleFeaturedPDFLoad, 4000);
    }
}

// Skills Category Filtering - Function for reinitialization
export function initializeSkillsNavigation() {
    const skillNavBtns = document.querySelectorAll('.skill-nav-btn');
    const skillSections = document.querySelectorAll('.skill-section');

    skillNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-skill-category');

            // Update active button
            skillNavBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Show/hide skill sections with animation
            skillSections.forEach(section => {
                if (section.getAttribute('data-skill-category') === category) {
                    section.style.display = 'block';
                    section.style.animation = 'fadeIn 0.5s ease-in-out';

                    // Animate skill bars when section becomes visible
                    setTimeout(() => {
                        const skillFills = section.querySelectorAll('.skill-fill');
                        skillFills.forEach(fill => {
                            const width = fill.getAttribute('data-width');
                            fill.style.width = width + '%';
                        });
                    }, 100);
                } else {
                    section.style.display = 'none';
                }
            });
        });
    });
}

// Skill bar animation
export function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
        bar.classList.add('animate');
    });
}

