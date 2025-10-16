// Medieval Character Sheet - Main Initialization
// Location: /home/hullivan/Hugues.W.B.dePingon/js/init.js

import { typeWriter, getElementFromTarget } from './utils.js';
import { loadSection, switchTab, preloadAllSections } from './navigation.js';
import { initializeFlipSounds, createParticles, createRipple } from './animations.js';
import { initializeEasterEggs, trackKonamiCode } from './easter-eggs.js';
import { initializeModalListeners } from './modals.js';
import { initializeContactFormSubmit, switchContactMethod, nextQuestion, previousQuestion, resetContactForm } from './forms.js';
import { initializeVideoHoverPlay } from './media.js';
import { initializeWorkshopSeal } from './workshop-seal.js';

document.addEventListener('DOMContentLoaded', function() {
    // Always scroll to top of page on load
    window.scrollTo(0, 0);

    // Ensure About tab is active and visible
    const aboutTab = document.getElementById('about');
    const aboutButton = document.querySelector('.tab-button[data-tab="about"]');

    if (aboutTab && aboutButton) {
        // Make sure About tab is active
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

        aboutTab.classList.add('active');
        aboutButton.classList.add('active');
    }

    // Load About section immediately
    loadSection('about');

    // Initialize Easter Eggs (secret code, Konami, achievements)
    initializeEasterEggs();

    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button, .workshop-seal-button');

    tabButtons.forEach(button => {
        // Skip workshop seal button as it has custom handling
        if (button.classList.contains('workshop-seal-button')) return;

        button.addEventListener('click', async function() {
            const targetTab = this.getAttribute('data-tab');

            // Play random page sound for any tab except workshop
            if (targetTab !== 'workshop' && window.soundManager) {
                window.soundManager.playRandomPageSound();
            }

            // Track for Konami code
            trackKonamiCode(targetTab);

            // Use the switchTab function
            await switchTab(targetTab);
        });
    });

    // Initialize Workshop Seal Button
    initializeWorkshopSeal();

    // Hover effects for cards - using event delegation for better performance
    document.addEventListener('mouseenter', (e) => {
        const element = getElementFromTarget(e.target);
        if (!element) return;

        const card = element.closest('.highlight-card, .project-card, .work-item');
        if (card) {
            card.style.willChange = 'transform';
            card.style.transform = 'translateY(-5px) scale(1.02)';
        }
    }, true);

    document.addEventListener('mouseleave', (e) => {
        const element = getElementFromTarget(e.target);
        if (!element) return;

        const card = element.closest('.highlight-card, .project-card, .work-item');
        if (card) {
            card.style.transform = 'translateY(0) scale(1)';
            // Clean up will-change after animation
            setTimeout(() => {
                if (card) card.style.willChange = 'auto';
            }, 300);
        }
    }, true);

    // Initialize typing effect on load
    const characterName = document.querySelector('.character-name');
    if (characterName) {
        const originalText = characterName.textContent;
        setTimeout(() => {
            typeWriter(characterName, originalText, 80);
        }, 1000);
    }

    // Interactive skill bars with click to reveal
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        item.addEventListener('click', function() {
            const progressBar = this.querySelector('.skill-progress');
            const currentWidth = progressBar.style.width;

            if (!currentWidth || currentWidth === '0%') {
                const targetWidth = progressBar.getAttribute('data-width');
                progressBar.style.width = targetWidth + '%';
                progressBar.classList.add('animate');
            }
        });
    });

    // Smooth scrolling for internal links
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

    // Add ripple effect to tab buttons (exclude workshop seal button)
    tabButtons.forEach(button => {
        if (!button.classList.contains('workshop-seal-button')) {
            button.addEventListener('click', createRipple);
        }
    });

    // Add CSS for ripple effect
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        .tab-button {
            position: relative;
            overflow: hidden;
        }

        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }

        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);

    // Add glow effect on hover for gold elements
    const goldElements = document.querySelectorAll('.character-name, .stat-value, .tab-button.active');
    goldElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 20px var(--gold), 0 0 40px var(--gold)';
        });

        element.addEventListener('mouseleave', function() {
            this.style.textShadow = '';
        });
    });

    // Add floating animation for particles
    const particleStyle = document.createElement('style');
    particleStyle.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translateY(0px) translateX(0px);
                opacity: 0.3;
            }
            25% {
                transform: translateY(-20px) translateX(10px);
                opacity: 0.6;
            }
            50% {
                transform: translateY(-10px) translateX(-10px);
                opacity: 0.8;
            }
            75% {
                transform: translateY(-30px) translateX(5px);
                opacity: 0.4;
            }
        }
    `;
    document.head.appendChild(particleStyle);

    // Initialize particles
    createParticles();

    // Performance: Pause animations and sounds when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause all videos
            document.querySelectorAll('video').forEach(video => {
                if (!video.paused) {
                    video.pause();
                    video.dataset.wasPlaying = 'true';
                }
            });

            // Reduce audio when tab is hidden
            if (window.soundManager && window.soundManager.sounds.chimes) {
                const chimes = window.soundManager.sounds.chimes;
                if (!chimes.paused) {
                    chimes.volume = 0.1; // Reduce volume instead of stopping
                }
            }
        } else {
            // Resume videos that were playing
            document.querySelectorAll('video[data-was-playing="true"]').forEach(video => {
                video.play().catch(() => {});
                delete video.dataset.wasPlaying;
            });

            // Restore audio volume
            if (window.soundManager && window.soundManager.sounds.chimes) {
                const chimes = window.soundManager.sounds.chimes;
                if (!chimes.paused) {
                    chimes.volume = 0.3; // Restore normal volume
                }
            }
        }
    });

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Only handle arrow keys for tab navigation
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

        const activeTab = document.querySelector('.tab-button.active');
        const activeIndex = Array.from(tabButtons).indexOf(activeTab);

        if (e.key === 'ArrowLeft' && activeIndex > 0) {
            e.preventDefault();
            tabButtons[activeIndex - 1].click();
        } else if (e.key === 'ArrowRight' && activeIndex < tabButtons.length - 1) {
            e.preventDefault();
            tabButtons[activeIndex + 1].click();
        }
    });

    // Add tooltip functionality
    function addTooltip(element, text) {
        element.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = text;
            tooltip.style.cssText = `
                position: absolute;
                background: var(--burgundy-dark);
                color: var(--beige-paper);
                padding: 0.5rem;
                border-radius: 4px;
                font-size: 0.9rem;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            document.body.appendChild(tooltip);

            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 10);

            element.addEventListener('mouseleave', function() {
                tooltip.remove();
            });
        });
    }

    // Add tooltips to skill items
    skillItems.forEach(item => {
        const skillName = item.querySelector('.skill-name').textContent;
        addTooltip(item, `Click to reveal ${skillName} level`);
    });

    // Initialize modals
    initializeModalListeners();

    // Initialize contact form
    initializeContactFormSubmit();

    // Initialize video hover play
    initializeVideoHoverPlay();

    // Initialize flip sounds for cards (about section loads immediately)
    setTimeout(() => {
        initializeFlipSounds();
    }, 300);

    // Animate skill bars on initial load
    setTimeout(() => {
        const visibleSkillFills = document.querySelectorAll('.skill-section:not([style*="display: none"]) .skill-fill');
        visibleSkillFills.forEach(fill => {
            const width = fill.getAttribute('data-width');
            fill.style.width = width + '%';
        });
    }, 500);

    // Add shake animation CSS for validation
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(shakeStyle);
});

// Make functions globally available (for HTML onclick handlers)
window.switchTab = switchTab;
window.initializeVideoHoverPlay = initializeVideoHoverPlay;

// Export form functions globally (called from HTML)
window.switchContactMethod = switchContactMethod;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.resetContactForm = resetContactForm;

