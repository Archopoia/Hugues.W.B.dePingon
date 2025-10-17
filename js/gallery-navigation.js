// Gallery Navigation System
// Handles scroll navigation and mobile touch interactions for the media gallery

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

        this.init();
    }

    init() {
        // Set up media gallery
        if (this.mediaGrid && this.mediaItems.length > 0) {
            if (this.isMobile) {
                this.setupMobileBehavior(this.mediaGrid, this.mediaItems);
            }
            this.setupScrollNavigation(this.mediaGrid);
            this.setupTouchGestures(this.mediaGrid);
        }

        // Set up portfolio galleries
        this.portfolioGalleries.forEach((gallery, index) => {
            const items = gallery.querySelectorAll('.portfolio-gallery-item');

            if (items.length > 0) {
                if (this.isMobile) {
                    this.setupMobileBehavior(gallery, items);
                }
                this.setupScrollNavigation(gallery);
                this.setupTouchGestures(gallery);
                this.setupPortfolioClickHandlers(gallery, items);
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
                if (this.mediaGrid) this.cleanupMobileBehavior(this.mediaGrid, this.mediaItems);
                this.portfolioGalleries.forEach(gallery => {
                    const items = gallery.querySelectorAll('.portfolio-gallery-item');
                    this.cleanupMobileBehavior(gallery, items);
                });
            }
        });
    }

    setupMobileBehavior(gallery, items) {
        // Add mobile-active class to show fanned out layout
        gallery.classList.add('mobile-active');

        // Add click handlers to prevent immediate navigation
        items.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectItem(gallery, items, index);
            });

            // Add double-tap to navigate
            let tapCount = 0;
            item.addEventListener('touchend', (e) => {
                tapCount++;
                if (tapCount === 1) {
                    setTimeout(() => {
                        if (tapCount === 1) {
                            // Single tap - select item
                            this.selectItem(gallery, items, index);
                        } else {
                            // Double tap - navigate to URL
                            const href = item.getAttribute('href');
                            if (href && href !== '#') {
                                window.open(href, '_blank', 'noopener,noreferrer');
                            }
                        }
                        tapCount = 0;
                    }, 300);
                }
            });
        });
    }

    cleanupMobileBehavior(gallery, items) {
        gallery.classList.remove('mobile-active');
        items.forEach(item => {
            item.classList.remove('selected');
        });
    }

    selectItem(gallery, items, index) {
        // Remove previous selection
        items.forEach(item => item.classList.remove('selected'));

        // Select new item
        items[index].classList.add('selected');
        this.currentIndex = index;
    }

    setupScrollNavigation(gallery) {
        let scrollAccumulator = 0;
        const scrollThreshold = 50; // Pixels to scroll before changing item

        gallery.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (this.isScrolling) return;

            scrollAccumulator += e.deltaY;

            if (Math.abs(scrollAccumulator) >= scrollThreshold) {
                this.isScrolling = true;

                if (scrollAccumulator > 0) {
                    // Scroll down - next item
                    this.nextItem(gallery);
                } else {
                    // Scroll up - previous item
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
            document.body.style.overflow = 'hidden';
        });

        gallery.addEventListener('mouseleave', () => {
            document.body.style.overflow = '';
        });
    }

    setupTouchGestures(gallery) {
        gallery.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        gallery.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.touchEndY = e.changedTouches[0].clientY;

            this.handleSwipe(gallery);
        });
    }

    handleSwipe(gallery) {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const minSwipeDistance = 50;

        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right - previous item
                this.previousItem(gallery);
            } else {
                // Swipe left - next item
                this.nextItem(gallery);
            }
        }
    }

    nextItem(gallery) {
        const items = gallery.querySelectorAll('.portfolio-gallery-item, .media-item');
        this.currentIndex = (this.currentIndex + 1) % items.length;
        this.updateGalleryState(gallery);
    }

    previousItem(gallery) {
        const items = gallery.querySelectorAll('.portfolio-gallery-item, .media-item');
        this.currentIndex = (this.currentIndex - 1 + items.length) % items.length;
        this.updateGalleryState(gallery);
    }

    updateGalleryState(gallery) {
        // Add scroll-active class to trigger CSS animations
        gallery.classList.add('scroll-active');

        // Remove the class after animation completes
        setTimeout(() => {
            gallery.classList.remove('scroll-active');
        }, 500);

        // Update mobile selection if on mobile
        if (this.isMobile) {
            const items = gallery.querySelectorAll('.portfolio-gallery-item, .media-item');
            this.selectItem(gallery, items, this.currentIndex);
        }
    }

    setupPortfolioClickHandlers(gallery, items) {
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
    new GalleryNavigation();
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
