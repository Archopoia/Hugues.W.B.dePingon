// Medieval Character Sheet - Animations & Effects
// Location: /home/hullivan/Hugues.W.B.dePingon/js/animations.js

import { getElementFromTarget } from './utils.js';

// Initialize flip sound effects for cards with debouncing
let lastFlipSoundTime = 0;
const FLIP_SOUND_DELAY = 200; // 200ms minimum between sounds

// Performance: Store card states in WeakMap for better memory management
const cardStates = new WeakMap();

// Touch state management for mobile card flipping
let touchStartTime = 0;
let touchStartCard = null;
const TOUCH_DELAY = 150; // 150ms minimum touch duration to trigger flip

export function initializeFlipSounds() {
    // Performance: Use event delegation on document instead of individual listeners
    // Remove old listeners if they exist
    document.removeEventListener('mouseenter', handleCardMouseEnter, true);
    document.removeEventListener('mouseleave', handleCardMouseLeave, true);
    document.removeEventListener('touchstart', handleCardTouchStart, { passive: true });
    document.removeEventListener('touchend', handleCardTouchEnd, { passive: true });
    document.removeEventListener('touchcancel', handleCardTouchCancel, { passive: true });

    // Add delegated event listeners (capture phase for better performance)
    document.addEventListener('mouseenter', handleCardMouseEnter, true);
    document.addEventListener('mouseleave', handleCardMouseLeave, true);

    // Add touch event listeners for mobile card flipping
    document.addEventListener('touchstart', handleCardTouchStart, { passive: true });
    document.addEventListener('touchend', handleCardTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleCardTouchCancel, { passive: true });
}

function handleCardMouseEnter(e) {
    const element = getElementFromTarget(e.target);
    if (!element) return;

    const card = element.closest('.expertise-card, .academic-stat, .format-card, .game-element');
    if (!card) return;

    // Use unified flip function
    flipCard(card);
}

function handleCardMouseLeave(e) {
    const element = getElementFromTarget(e.target);
    if (!element) return;

    const card = element.closest('.expertise-card, .academic-stat, .format-card, .game-element');
    if (!card) return;

    const state = cardStates.get(card);
    if (!state) return;

    // Wait 2 seconds before unflipping
    state.unflipTimeout = setTimeout(() => {
        if (!card.matches(':hover')) {
            card.classList.remove('flipped');
            state.isFlipping = false;
            if (state.flipTimeout) clearTimeout(state.flipTimeout);
        }
    }, 2000); // 2 second delay
}

function playFlipSoundOnHover() {
    if (window.soundManager && window.soundManager.audioReady) {
        window.soundManager.playRandomFlipSound();
    }
}

// Touch event handlers for mobile card flipping
function handleCardTouchStart(e) {
    const element = getElementFromTarget(e.target);
    if (!element) return;

    const card = element.closest('.expertise-card, .academic-stat, .format-card, .game-element');
    if (!card) return;

    // Store touch start info
    touchStartTime = Date.now();
    touchStartCard = card;
}

function handleCardTouchEnd(e) {
    if (!touchStartCard) return;

    const touchDuration = Date.now() - touchStartTime;

    // Only flip if touch was long enough (prevents accidental flips during scrolling)
    if (touchDuration >= TOUCH_DELAY) {
        flipCard(touchStartCard);
    }

    // Reset touch state
    touchStartTime = 0;
    touchStartCard = null;
}

function handleCardTouchCancel(e) {
    // Reset touch state on cancel
    touchStartTime = 0;
    touchStartCard = null;
}

// Unified card flipping function
function flipCard(card) {
    // Get or create card state
    let state = cardStates.get(card);
    if (!state) {
        state = { isFlipping: false, flipTimeout: null, unflipTimeout: null };
        cardStates.set(card, state);
    }

    // Clear any pending unflip timeout
    if (state.unflipTimeout) {
        clearTimeout(state.unflipTimeout);
        state.unflipTimeout = null;
    }

    if (!state.isFlipping && !card.classList.contains('flipped')) {
        state.isFlipping = true;
        card.classList.add('flipped');

        // Play flip sound with debouncing
        const now = Date.now();
        if (now - lastFlipSoundTime >= FLIP_SOUND_DELAY) {
            playFlipSoundOnHover();
            lastFlipSoundTime = now;
        }

        // Lock the flip for the duration of the animation (600ms)
        state.flipTimeout = setTimeout(() => {
            state.isFlipping = false;
        }, 600);

        // Auto-unflip delay (2 seconds for desktop, 3 seconds for mobile)
        const unflipDelay = window.innerWidth <= 768 ? 3000 : 2000;
        state.unflipTimeout = setTimeout(() => {
            if (!card.matches(':hover')) {
                card.classList.remove('flipped');
                state.isFlipping = false;
                if (state.flipTimeout) clearTimeout(state.flipTimeout);
            }
        }, unflipDelay);
    }
}

// Random card flip for workshop game elements
let randomFlipInterval = null;
let currentAutoFlippedCard = null;
let userInteracting = false;
let interactionTimeout = null;

export function initializeRandomCardFlip() {
    const gameElements = document.querySelectorAll('.game-element');

    if (gameElements.length === 0) return;

    // Track which cards are visible on screen
    let visibleCards = new Set();

    // Set up Intersection Observer to track card visibility
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // Card must be at least 50% visible
    };

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleCards.add(entry.target);
            } else {
                visibleCards.delete(entry.target);
            }
        });
    }, observerOptions);

    // Observe all game element cards
    gameElements.forEach(card => cardObserver.observe(card));

    // Function to flip a random card (only if visible)
    function flipRandomCard() {
        // Don't auto-flip if user is interacting
        if (userInteracting) return;

        // Don't flip if no cards are visible
        if (visibleCards.size === 0) return;

        // Flip back the current auto-flipped card
        if (currentAutoFlippedCard) {
            currentAutoFlippedCard.classList.remove('flipped', 'auto-flipped');
        }

        // Pick a random card from only the visible cards
        const visibleCardsArray = Array.from(visibleCards);
        const randomIndex = Math.floor(Math.random() * visibleCardsArray.length);
        currentAutoFlippedCard = visibleCardsArray[randomIndex];

        // Mark it as auto-flipped and flip it
        currentAutoFlippedCard.classList.add('flipped', 'auto-flipped');

        // Play flip sound
        if (window.soundManager) {
            window.soundManager.playRandomFlipSound();
        }
    }

    // Start the random flip cycle
    flipRandomCard(); // Flip one immediately (if visible)
    randomFlipInterval = setInterval(flipRandomCard, 2000); // Then every 2 seconds

    // Add hover listeners to all game elements
    gameElements.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Set user interaction flag
            userInteracting = true;

            // Clear any existing timeout
            if (interactionTimeout) {
                clearTimeout(interactionTimeout);
            }

            // If there's an auto-flipped card, flip it back
            if (currentAutoFlippedCard && currentAutoFlippedCard.classList.contains('auto-flipped')) {
                currentAutoFlippedCard.classList.remove('flipped', 'auto-flipped');
                currentAutoFlippedCard = null;
            }
        });

        card.addEventListener('mouseleave', function() {
            // Set timeout to resume auto-flip after 2 seconds of no interaction
            interactionTimeout = setTimeout(() => {
                userInteracting = false;
            }, 2000);
        });
    });

    // Clean up interval and observers when leaving workshop tab
    const workshopTab = document.getElementById('workshop');
    if (workshopTab) {
        const tabObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (!workshopTab.classList.contains('active')) {
                        if (randomFlipInterval) {
                            clearInterval(randomFlipInterval);
                            randomFlipInterval = null;
                        }
                        if (interactionTimeout) {
                            clearTimeout(interactionTimeout);
                            interactionTimeout = null;
                        }
                        if (currentAutoFlippedCard) {
                            currentAutoFlippedCard.classList.remove('flipped', 'auto-flipped');
                            currentAutoFlippedCard = null;
                        }
                        userInteracting = false;

                        // Clean up card visibility observer
                        if (cardObserver) {
                            cardObserver.disconnect();
                        }
                        visibleCards.clear();
                    }
                }
            });
        });
        tabObserver.observe(workshopTab, { attributes: true });
    }
}

// Particle effects
export function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'gold-particle';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDelay = Math.random() * 2 + 's';
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 3000);
}

export function createRainbowParticle() {
    const particle = document.createElement('div');
    particle.className = 'rainbow-particle';
    // Medieval color palette: burgundy, gold, bronze, amber, copper
    const colors = ['#8B1A1A', '#DAA520', '#B8860B', '#CD7F32', '#D4AF37', '#C9A961'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDelay = Math.random() * 2 + 's';
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 3000);
}

// Add particle effect background
export function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    `;

    document.body.appendChild(particleContainer);

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: var(--gold);
            border-radius: 50%;
            opacity: 0.3;
            animation: float ${3 + Math.random() * 4}s infinite ease-in-out;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        particleContainer.appendChild(particle);
    }
}

// Add ripple effect to buttons
export function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

