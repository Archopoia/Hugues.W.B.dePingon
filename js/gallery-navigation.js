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
            }
            this.setupScrollNavigation(this.mediaGrid);
            this.setupTouchGestures(this.mediaGrid);
        }

        // Set up portfolio galleries
        this.portfolioGalleries.forEach((gallery, index) => {
            const items = gallery.querySelectorAll('.portfolio-gallery-item');
            console.log('🎨 Setting up portfolio gallery', index, 'with', items.length, 'items');

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
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            console.log('📏 Window resized - was mobile:', wasMobile, 'now mobile:', this.isMobile, 'width:', window.innerWidth);

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
        console.log('🔧 Mobile behavior setup for gallery with', items.length, 'items');

        // Add touch-and-hold scrolling behavior
        items.forEach((item, index) => {
            let touchStartTime = 0;
            let touchStartX = 0;
            let touchStartY = 0;
            let isHolding = false;
            let holdTimer = null;

            // Prevent default click behavior on mobile
            item.addEventListener('click', (e) => {
                console.log('📱 Click event on item', index);
                e.preventDefault();
                e.stopPropagation();
                // Only select item, don't open image
                this.selectItem(gallery, items, index);
            });

            // Touch start - begin hold detection
            item.addEventListener('touchstart', (e) => {
                console.log('👆 Touch start on item', index);
                touchStartTime = Date.now();
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                isHolding = false;

                // Start hold timer
                holdTimer = setTimeout(() => {
                    console.log('⏰ Hold threshold reached for item', index);
                    isHolding = true;
                    item.classList.add('touch-holding');
                    // Enable scrolling through gallery
                    this.enableGalleryScrolling(gallery, items, index);
                }, 500); // 500ms hold threshold
            });

            // Touch move - cancel hold if moved too much
            item.addEventListener('touchmove', (e) => {
                if (holdTimer) {
                    const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
                    const deltaY = Math.abs(e.touches[0].clientY - touchStartY);

                    // If moved more than 10px, cancel hold
                    if (deltaX > 10 || deltaY > 10) {
                        console.log('🚫 Touch moved too much, canceling hold');
                        clearTimeout(holdTimer);
                        holdTimer = null;
                        item.classList.remove('touch-holding');
                    }
                }
            });

            // Touch end - handle tap vs hold
            item.addEventListener('touchend', (e) => {
                const touchDuration = Date.now() - touchStartTime;
                console.log('👆 Touch end on item', index, 'duration:', touchDuration + 'ms', 'wasHolding:', isHolding);

                if (holdTimer) {
                    clearTimeout(holdTimer);
                    holdTimer = null;
                }

                if (isHolding) {
                    // Was holding - disable scrolling
                    console.log('🛑 Disabling gallery scrolling');
                    this.disableGalleryScrolling(gallery);
                    item.classList.remove('touch-holding');
                } else if (touchDuration < 500) {
                    // Quick tap - select item
                    console.log('⚡ Quick tap detected, selecting item', index);
                    this.selectItem(gallery, items, index);
                }

                isHolding = false;
            });

            // Touch cancel - cleanup
            item.addEventListener('touchcancel', () => {
                console.log('❌ Touch canceled on item', index);
                if (holdTimer) {
                    clearTimeout(holdTimer);
                    holdTimer = null;
                }
                item.classList.remove('touch-holding');
                isHolding = false;
            });

            // Add mouse events for desktop testing (simulate touch)
            let mouseDownTime = 0;
            let mouseHoldTimer = null;
            let isMouseHolding = false;

            item.addEventListener('mousedown', (e) => {
                console.log('🖱️ Mouse down on item', index);
                mouseDownTime = Date.now();
                isMouseHolding = false;

                // Start hold timer for mouse
                mouseHoldTimer = setTimeout(() => {
                    console.log('⏰ Mouse hold threshold reached for item', index);
                    isMouseHolding = true;
                    item.classList.add('touch-holding');
                    this.enableGalleryScrolling(gallery, items, index);
                }, 500);
            });

            item.addEventListener('mouseup', (e) => {
                const mouseDuration = Date.now() - mouseDownTime;
                console.log('🖱️ Mouse up on item', index, 'duration:', mouseDuration + 'ms', 'wasHolding:', isMouseHolding);

                if (mouseHoldTimer) {
                    clearTimeout(mouseHoldTimer);
                    mouseHoldTimer = null;
                }

                if (isMouseHolding) {
                    console.log('🛑 Disabling gallery scrolling (mouse)');
                    this.disableGalleryScrolling(gallery);
                    item.classList.remove('touch-holding');
                } else if (mouseDuration < 500) {
                    console.log('⚡ Quick mouse click detected, selecting item', index);
                    this.selectItem(gallery, items, index);
                }

                isMouseHolding = false;
            });

            item.addEventListener('mouseleave', () => {
                if (mouseHoldTimer) {
                    clearTimeout(mouseHoldTimer);
                    mouseHoldTimer = null;
                }
                item.classList.remove('touch-holding');
                isMouseHolding = false;
            });
        });
    }

    cleanupMobileBehavior(gallery, items) {
        gallery.classList.remove('mobile-active');
        gallery.classList.remove('scroll-enabled');
        items.forEach(item => {
            item.classList.remove('selected');
            item.classList.remove('touch-holding');
        });

        // Clean up any active scrolling handlers
        this.disableGalleryScrolling(gallery);
    }

    enableGalleryScrolling(gallery, items, startIndex) {
        console.log('🎯 Enabling gallery scrolling for gallery with', items.length, 'items, starting at index', startIndex);

        // Add visual feedback that scrolling is enabled
        gallery.classList.add('scroll-enabled');

        // Set up touch scrolling for the gallery
        let scrollStartX = 0;
        let scrollStartY = 0;

        const handleScrollStart = (e) => {
            scrollStartX = e.touches[0].clientX;
            scrollStartY = e.touches[0].clientY;
            console.log('🎯 Scroll start at:', scrollStartX, scrollStartY);
        };

        const handleScrollMove = (e) => {
            const deltaX = e.touches[0].clientX - scrollStartX;
            const deltaY = e.touches[0].clientY - scrollStartY;

            console.log('🎯 Scroll move - deltaX:', deltaX, 'deltaY:', deltaY);

            // Check if horizontal swipe (gallery navigation)
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
                console.log('🎯 Horizontal swipe detected, deltaX:', deltaX);
                if (deltaX > 0) {
                    // Swipe right - previous item
                    console.log('🎯 Swiping right - going to previous item');
                    this.previousItem(gallery);
                } else {
                    // Swipe left - next item
                    console.log('🎯 Swiping left - going to next item');
                    this.nextItem(gallery);
                }
                scrollStartX = e.touches[0].clientX;
            }
        };

        // Store handlers for cleanup
        gallery._scrollHandlers = {
            start: handleScrollStart,
            move: handleScrollMove
        };

        gallery.addEventListener('touchstart', handleScrollStart, { passive: true });
        gallery.addEventListener('touchmove', handleScrollMove, { passive: true });

        // Add mouse events for desktop testing
        const handleMouseScrollStart = (e) => {
            scrollStartX = e.clientX;
            scrollStartY = e.clientY;
            console.log('🖱️ Mouse scroll start at:', scrollStartX, scrollStartY);
        };

        const handleMouseScrollMove = (e) => {
            const deltaX = e.clientX - scrollStartX;
            const deltaY = e.clientY - scrollStartY;

            console.log('🖱️ Mouse scroll move - deltaX:', deltaX, 'deltaY:', deltaY);

            // Check if horizontal drag (gallery navigation)
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
                console.log('🖱️ Horizontal drag detected, deltaX:', deltaX);
                if (deltaX > 0) {
                    console.log('🖱️ Dragging right - going to previous item');
                    this.previousItem(gallery);
                } else {
                    console.log('🖱️ Dragging left - going to next item');
                    this.nextItem(gallery);
                }
                scrollStartX = e.clientX;
            }
        };

        gallery._mouseScrollHandlers = {
            start: handleMouseScrollStart,
            move: handleMouseScrollMove
        };

        gallery.addEventListener('mousedown', handleMouseScrollStart);
        gallery.addEventListener('mousemove', handleMouseScrollMove);
    }

    disableGalleryScrolling(gallery) {
        console.log('🛑 Disabling gallery scrolling');

        // Remove visual feedback
        gallery.classList.remove('scroll-enabled');

        // Remove touch event listeners
        if (gallery._scrollHandlers) {
            gallery.removeEventListener('touchstart', gallery._scrollHandlers.start);
            gallery.removeEventListener('touchmove', gallery._scrollHandlers.move);
            delete gallery._scrollHandlers;
        }

        // Remove mouse event listeners
        if (gallery._mouseScrollHandlers) {
            gallery.removeEventListener('mousedown', gallery._mouseScrollHandlers.start);
            gallery.removeEventListener('mousemove', gallery._mouseScrollHandlers.move);
            delete gallery._mouseScrollHandlers;
        }
    }

    selectItem(gallery, items, index) {
        console.log('🎯 Selecting item', index, 'from', items.length, 'items');

        // Remove previous selection
        items.forEach(item => item.classList.remove('selected'));

        // Select new item
        items[index].classList.add('selected');
        this.currentIndex = index;

        console.log('✅ Item', index, 'selected, currentIndex set to:', this.currentIndex);
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
        console.log('➡️ Next item - current index:', this.currentIndex, 'total items:', items.length);
        this.updateGalleryState(gallery);
    }

    previousItem(gallery) {
        const items = gallery.querySelectorAll('.portfolio-gallery-item, .media-item');
        this.currentIndex = (this.currentIndex - 1 + items.length) % items.length;
        console.log('⬅️ Previous item - current index:', this.currentIndex, 'total items:', items.length);
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
            const items = gallery.querySelectorAll('.portfolio-gallery-item, .media-item');
            console.log('📱 Mobile mode - selecting item', this.currentIndex, 'from', items.length, 'items');
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
