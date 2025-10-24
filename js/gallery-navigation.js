// Gallery Navigation System
// Handles scroll navigation and mobile touch interactions for the media gallery

console.log('📄 gallery-navigation.js loaded');

class GalleryNavigation {
    constructor() {
        this.mediaGrid = document.querySelector('.media-grid');
        this.mediaItems = document.querySelectorAll('.media-item');
        this.portfolioGalleries = document.querySelectorAll('.portfolio-gallery');
        this.currentIndex = 0;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.isMobile = window.innerWidth <= 768;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;

        console.log('🚀 GalleryNavigation initialized');
        console.log('📱 Is mobile:', this.isMobile, 'window width:', window.innerWidth);
        console.log('🎨 Found', this.portfolioGalleries.length, 'portfolio galleries');
        console.log('🖼️ Found', this.mediaItems.length, 'media items');

        this.init();
    }

    init() {
        console.log('🔧 Initializing gallery navigation...');

        // Set up media gallery
        if (this.mediaGrid && this.mediaItems.length > 0) {
            console.log('📱 Setting up media gallery with', this.mediaItems.length, 'items');
            if (this.isMobile) {
                this.setupMobileBehavior(this.mediaGrid, this.mediaItems);
            } else {
                // Only set up desktop behaviors on desktop
                this.setupScrollNavigation(this.mediaGrid);
                this.setupTouchGestures(this.mediaGrid);
            }
        }

        // Set up portfolio galleries
        this.portfolioGalleries.forEach((gallery, index) => {
            const items = gallery.querySelectorAll('.portfolio-gallery-item');
            console.log('🎨 Setting up portfolio gallery', index, 'with', items.length, 'items');

            if (items.length > 0) {
                if (this.isMobile) {
                    this.setupMobileBehavior(gallery, items);
                } else {
                    // Only set up desktop behaviors on desktop
                    this.setupScrollNavigation(gallery);
                    this.setupTouchGestures(gallery);
                    this.setupPortfolioClickHandlers(gallery, items);
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            if (this.isMobile) {
                if (this.mediaGrid) this.setupMobileBehavior(this.mediaGrid, this.mediaItems);
                this.portfolioGalleries.forEach(gallery => {
                    const items = gallery.querySelectorAll('.portfolio-gallery-item');
                    this.setupMobileBehavior(gallery, items);
                });
            } else {
                if (this.mediaGrid) {
                    this.cleanupMobileBehavior(this.mediaGrid, this.mediaItems);
                    // Re-enable desktop behaviors for media grid
                    this.setupScrollNavigation(this.mediaGrid);
                    this.setupTouchGestures(this.mediaGrid);
                }
                this.portfolioGalleries.forEach(gallery => {
                    const items = gallery.querySelectorAll('.portfolio-gallery-item');
                    this.cleanupMobileBehavior(gallery, items);
                    // Re-enable desktop behaviors
                    this.setupScrollNavigation(gallery);
                    this.setupTouchGestures(gallery);
                    this.setupPortfolioClickHandlers(gallery, items);
                });
            }
        });
    }

    setupMobileBehavior(gallery, items) {
        console.log('🔧 Setting up mobile behavior for gallery:', gallery);
        console.log('📱 Is mobile:', this.isMobile, 'Window width:', window.innerWidth);

        // Add mobile-active class to show fanned out layout
        gallery.classList.add('mobile-active');
        console.log('📱 Added mobile-active class to gallery');

        // Debug: Monitor for any class changes on the gallery
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    console.log('🔍 Gallery class changed:', mutation.target.className);
                }
            });
        });
        observer.observe(gallery, { attributes: true, attributeFilter: ['class'] });

        // Debug: Monitor for any class changes on gallery items
        const itemObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    console.log('🔍 Item class changed:', mutation.target.className, 'on element:', mutation.target);
                }
            });
        });
        items.forEach(item => {
            itemObserver.observe(item, { attributes: true, attributeFilter: ['class'] });
        });

        // Debug: Monitor for any style changes
        const styleObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    console.log('🔍 Style changed on element:', mutation.target, 'new style:', mutation.target.style.cssText);
                }
            });
        });
        items.forEach(item => {
            styleObserver.observe(item, { attributes: true, attributeFilter: ['style'] });
        });

        // Debug: Monitor for any DOM changes
        const domObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    console.log('🔍 DOM structure changed:', mutation);
                }
            });
        });
        domObserver.observe(gallery, { childList: true, subtree: true });

        // On mobile, clicking anywhere on the gallery opens the gallery modal
        gallery.addEventListener('click', (e) => {
            console.log('📱 Gallery clicked on mobile');
            console.log('📱 Event target:', e.target);
            console.log('📱 Event currentTarget:', e.currentTarget);
            console.log('📱 Event type:', e.type);
            console.log('📱 Event bubbles:', e.bubbles);

            // Debug: Check if any classes are being added/removed
            console.log('📱 Gallery classes before:', gallery.className);
            console.log('📱 Gallery items before:', Array.from(gallery.querySelectorAll('.portfolio-gallery-item')).map(item => ({
                element: item,
                classes: item.className,
                transform: getComputedStyle(item).transform
            })));

            e.preventDefault();
            e.stopPropagation();

            // Find the gallery type from data-gallery attribute
            const galleryType = gallery.getAttribute('data-gallery');
            console.log('🎨 Gallery type:', galleryType);
            if (galleryType) {
                // Open the gallery modal directly
                if (window.openImageGallery) {
                    console.log('🚀 Opening gallery modal for:', galleryType);
                    window.openImageGallery(galleryType);
                } else {
                    console.error('❌ window.openImageGallery not found');
                }
            } else {
                console.error('❌ No data-gallery attribute found');
            }

            // Debug: Check if any classes changed after modal opening
            setTimeout(() => {
                console.log('📱 Gallery classes after:', gallery.className);
                console.log('📱 Gallery items after:', Array.from(gallery.querySelectorAll('.portfolio-gallery-item')).map(item => ({
                    element: item,
                    classes: item.className,
                    transform: getComputedStyle(item).transform
                })));
            }, 100);
        }, true); // Use capture phase to ensure it fires first

        // Prevent individual item clicks from opening images
        items.forEach((item, index) => {
            console.log('📱 Setting up click handler for item', index, item);
            item.addEventListener('click', (e) => {
                console.log('📱 Individual item clicked on mobile, preventing');
                console.log('📱 Item event target:', e.target);
                console.log('📱 Item event currentTarget:', e.currentTarget);
                e.preventDefault();
                e.stopPropagation();
                // Don't do anything - let the gallery click handler take over
            });

            // Add touch event listeners to debug
            item.addEventListener('touchstart', (e) => {
                console.log('👆 Touch start on item', index);
            });

            item.addEventListener('touchend', (e) => {
                console.log('👆 Touch end on item', index);
            });
        });
    }

    cleanupMobileBehavior(gallery, items) {
        console.log('🧹 Cleaning up mobile behavior for gallery:', gallery);

        // Remove mobile-active class
        gallery.classList.remove('mobile-active');

        // Clean up item classes
        items.forEach(item => {
            item.classList.remove('selected');
        });
    }

    selectItem(gallery, items, index) {
        console.log('🎯 selectItem called for gallery:', gallery, 'index:', index, 'isMobile:', this.isMobile);
        // Remove previous selection
        items.forEach(item => item.classList.remove('selected'));

        // Select new item
        items[index].classList.add('selected');
        console.log('🎯 Added selected class to item', index);
        this.currentIndex = index;
    }

    setupScrollNavigation(gallery) {
        console.log('🖱️ Setting up scroll navigation for gallery:', gallery, 'isMobile:', this.isMobile);
        let scrollAccumulator = 0;
        const scrollThreshold = 50; // Pixels to scroll before changing item

        gallery.addEventListener('wheel', (e) => {
            console.log('🖱️ Wheel event detected on gallery');
            console.log('🖱️ Wheel event target:', e.target);
            e.preventDefault();
            e.stopPropagation();

            if (this.isScrolling) return;

            scrollAccumulator += e.deltaY;

            if (Math.abs(scrollAccumulator) >= scrollThreshold) {
                console.log('🖱️ Scroll threshold reached, navigating');
                this.isScrolling = true;

                if (scrollAccumulator > 0) {
                    // Scroll down - next item
                    console.log('🖱️ Scrolling down - going to next item');
                    this.nextItem(gallery);
                } else {
                    // Scroll up - previous item
                    console.log('🖱️ Scrolling up - going to previous item');
                    this.previousItem(gallery);
                }

                scrollAccumulator = 0;

                // Reset scrolling flag after animation
                setTimeout(() => {
                    this.isScrolling = false;
                }, 500);
            }
        });

        // Prevent page scrolling when hovering over gallery
        gallery.addEventListener('mouseenter', () => {
            console.log('🖱️ Mouse enter on gallery');
            document.body.style.overflow = 'hidden';
        });

        gallery.addEventListener('mouseleave', () => {
            console.log('🖱️ Mouse leave on gallery');
            document.body.style.overflow = '';
        });
    }

    setupTouchGestures(gallery) {
        console.log('👆 Setting up touch gestures for gallery:', gallery, 'isMobile:', this.isMobile);
        gallery.addEventListener('touchstart', (e) => {
            console.log('👆 Touch start detected on gallery');
            console.log('👆 Touch start target:', e.target);
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        gallery.addEventListener('touchend', (e) => {
            console.log('👆 Touch end detected on gallery');
            console.log('👆 Touch end target:', e.target);
            this.touchEndX = e.changedTouches[0].clientX;
            this.touchEndY = e.changedTouches[0].clientY;

            this.handleSwipe(gallery);
        });
    }

    handleSwipe(gallery) {
        console.log('👆 Handle swipe called - isMobile:', this.isMobile);

        // Don't handle swipes on mobile
        if (this.isMobile) {
            console.log('👆 Mobile detected, ignoring swipe');
            return;
        }

        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const minSwipeDistance = 50;

        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            console.log('👆 Horizontal swipe detected on mobile:', this.isMobile);
            if (deltaX > 0) {
                // Swipe right - previous item
                console.log('👆 Swiping right - going to previous item');
                this.previousItem(gallery);
            } else {
                // Swipe left - next item
                console.log('👆 Swiping left - going to next item');
                this.nextItem(gallery);
            }
        }
    }

    nextItem(gallery) {
        console.log('➡️ nextItem called for gallery:', gallery, 'isMobile:', this.isMobile);
        const items = gallery.querySelectorAll('.portfolio-gallery-item, .media-item');
        this.currentIndex = (this.currentIndex + 1) % items.length;
        console.log('➡️ New currentIndex:', this.currentIndex);
        this.updateGalleryState(gallery);
    }

    previousItem(gallery) {
        console.log('⬅️ previousItem called for gallery:', gallery, 'isMobile:', this.isMobile);
        const items = gallery.querySelectorAll('.portfolio-gallery-item, .media-item');
        this.currentIndex = (this.currentIndex - 1 + items.length) % items.length;
        console.log('⬅️ New currentIndex:', this.currentIndex);
        this.updateGalleryState(gallery);
    }

    updateGalleryState(gallery) {
        console.log('🔄 Updating gallery state - currentIndex:', this.currentIndex, 'isMobile:', this.isMobile);

        // Add scroll-active class to trigger CSS animations
        gallery.classList.add('scroll-active');

        // Remove the class after animation completes
        setTimeout(() => {
            gallery.classList.remove('scroll-active');
        }, 500);

        // Update mobile selection if on mobile
        if (this.isMobile) {
            console.log('📱 Mobile detected, skipping selection');
            return;
        }

        const items = gallery.querySelectorAll('.portfolio-gallery-item, .media-item');
        console.log('📱 Mobile mode - selecting item', this.currentIndex, 'from', items.length, 'items');
        this.selectItem(gallery, items, this.currentIndex);
    }

    setupPortfolioClickHandlers(gallery, items) {
        // Don't set up individual click handlers on mobile - let gallery click handle it
        if (this.isMobile) {
            return;
        }

        items.forEach((item, index) => {
            item.style.pointerEvents = 'auto';

            item.addEventListener('click', (e) => {
                e.stopPropagation();

                const img = item.querySelector('img');
                const video = item.querySelector('video');

                if (img) {
                    window.open(img.src, '_blank', 'noopener,noreferrer');
                } else if (video) {
                    const src = video.querySelector('source').src;
                    window.open(src, '_blank', 'noopener,noreferrer');
                }
            }, true);
        });
    }

    openImageInFullscreen(src, alt) {
        // Create a new window with the full image
        const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');

        if (newWindow) {
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${alt}</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 20px;
                            background: #000;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                        }
                        img {
                            max-width: 100%;
                            max-height: 100vh;
                            object-fit: contain;
                            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
                        }
                    </style>
                </head>
                <body>
                    <img src="${src}" alt="${alt}" />
                </body>
                </html>
            `);
            newWindow.document.close();
        }
    }

    openVideoInFullscreen(src, alt) {
        // Create a new window with the full video
        const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');

        if (newWindow) {
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${alt}</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 20px;
                            background: #000;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                        }
                        video {
                            max-width: 100%;
                            max-height: 100vh;
                            object-fit: contain;
                            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
                        }
                    </style>
                </head>
                <body>
                    <video src="${src}" controls autoplay muted loop>
                        Your browser does not support the video tag.
                    </video>
                </body>
                </html>
            `);
            newWindow.document.close();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.galleryNavigation = new GalleryNavigation();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GalleryNavigation;
}

// Global function for direct image opening (fallback)
window.openPortfolioImage = function(src) {
    if (src) {
        window.open(src, '_blank', 'noopener,noreferrer');
    }
};

// Global function to initialize portfolio gallery click handlers
window.initializePortfolioGalleryClicks = function() {
    // Don't initialize individual click handlers on mobile
    if (window.innerWidth <= 768) {
        return;
    }

    const galleries = document.querySelectorAll('.portfolio-gallery');

    galleries.forEach((gallery, galleryIndex) => {
        const items = gallery.querySelectorAll('.portfolio-gallery-item');

        items.forEach((item, itemIndex) => {
            item.style.pointerEvents = 'auto';
            item.style.cursor = 'pointer';

            item.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();

                const img = this.querySelector('img');
                const video = this.querySelector('video');

                if (img) {
                    window.open(img.src, '_blank', 'noopener,noreferrer');
                } else if (video) {
                    const source = video.querySelector('source');
                    if (source) {
                        window.open(source.src, '_blank', 'noopener,noreferrer');
                    }
                }
            }, true);
        });
    });
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, GalleryNavigation ready');
    // Don't initialize immediately - wait for portfolio section to load
});

// Function to initialize galleries when portfolio section loads
window.initializeGalleryNavigation = function() {
    console.log('🎨 Portfolio section loaded, initializing galleries...');
    if (window.galleryNavigation) {
        // Reinitialize with current DOM
        window.galleryNavigation = new GalleryNavigation();
    } else {
        window.galleryNavigation = new GalleryNavigation();
    }
};

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GalleryNavigation;
}
