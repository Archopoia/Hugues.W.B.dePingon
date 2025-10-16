// Lazy Loading for Images and Videos
// Optimizes initial page load by deferring off-screen media

class LazyLoader {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        // Check for Intersection Observer support
        if ('IntersectionObserver' in window) {
            this.initIntersectionObserver();
        } else {
            // Fallback for older browsers - load all immediately
            this.loadAllMedia();
        }
    }

    initIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px', // Start loading 50px before element enters viewport
            threshold: 0.01
        };

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadMedia(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observe all lazy elements
        this.observeMedia();
    }

    observeMedia() {
        // Observe images with data-src attribute
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.observer.observe(img));

        // Observe videos with data-src attribute
        const lazyVideos = document.querySelectorAll('video[data-src]');
        lazyVideos.forEach(video => this.observer.observe(video));

        // Observe background images
        const lazyBackgrounds = document.querySelectorAll('[data-bg]');
        lazyBackgrounds.forEach(elem => this.observer.observe(elem));
    }

    loadMedia(element) {
        if (element.tagName === 'IMG') {
            // Load image
            if (element.dataset.src) {
                element.src = element.dataset.src;
                element.removeAttribute('data-src');

                // Add loaded class after image loads
                element.addEventListener('load', () => {
                    element.classList.add('lazy-loaded');
                }, { once: true });
            }
        } else if (element.tagName === 'VIDEO') {
            // Load video sources
            const sources = element.querySelectorAll('source[data-src]');
            sources.forEach(source => {
                source.src = source.dataset.src;
                source.removeAttribute('data-src');
            });

            // If video has data-src itself
            if (element.dataset.src) {
                element.src = element.dataset.src;
                element.removeAttribute('data-src');
            }

            element.load();
            element.classList.add('lazy-loaded');
        } else if (element.dataset.bg) {
            // Load background image
            element.style.backgroundImage = `url('${element.dataset.bg}')`;
            element.removeAttribute('data-bg');
            element.classList.add('lazy-loaded');
        }
    }

    loadAllMedia() {
        // Fallback: load all media immediately
        const allLazyImages = document.querySelectorAll('img[data-src]');
        const allLazyVideos = document.querySelectorAll('video[data-src]');
        const allLazyBackgrounds = document.querySelectorAll('[data-bg]');

        allLazyImages.forEach(img => this.loadMedia(img));
        allLazyVideos.forEach(video => this.loadMedia(video));
        allLazyBackgrounds.forEach(elem => this.loadMedia(elem));
    }

    // Method to refresh observer after dynamic content loads
    refresh() {
        if (this.observer) {
            this.observeMedia();
        }
    }
}

// Initialize lazy loader when DOM is ready
let lazyLoader = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        lazyLoader = new LazyLoader();
        window.lazyLoader = lazyLoader;
    });
} else {
    lazyLoader = new LazyLoader();
    window.lazyLoader = lazyLoader;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}

