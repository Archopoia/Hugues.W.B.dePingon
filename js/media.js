// Medieval Character Sheet - Media Interactions
// Location: /home/hullivan/Hugues.W.B.dePingon/js/media.js

import { getElementFromTarget } from './utils.js';

export function initializeEducationNavigation() {
    const eduNavBtns = document.querySelectorAll('.edu-nav-btn');
    const educationSections = document.querySelectorAll('.education-section');

    eduNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');

            // Remove active class from all buttons and sections
            eduNavBtns.forEach(b => b.classList.remove('active'));
            educationSections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Show target section
            const targetElement = document.getElementById(targetSection + '-studies') ||
                                 document.getElementById(targetSection + '-training');
            if (targetElement) {
                targetElement.classList.add('active');
            }
        });
    });
}

// Performance: Use event delegation for video hover play
export function initializeVideoHoverPlay() {
    // Remove old listeners if they exist
    document.removeEventListener('mouseenter', handleVideoCardEnter, true);
    document.removeEventListener('mouseleave', handleVideoCardLeave, true);

    // Use event delegation for better performance
    document.addEventListener('mouseenter', handleVideoCardEnter, true);
    document.addEventListener('mouseleave', handleVideoCardLeave, true);
}

function handleVideoCardEnter(e) {
    const element = getElementFromTarget(e.target);
    if (!element) return;

    const card = element.closest('.project-card, .alpine-card');
    if (!card) return;

    const video = card.querySelector('video');
    if (video && video.paused) {
        // Start with volume at 0
        video.volume = 0;

        video.play().catch(() => {
            // Handle autoplay restrictions gracefully
        });

        // Fade in audio over 300ms
        let currentVolume = 0;
        const fadeInterval = setInterval(() => {
            if (currentVolume < 1) {
                currentVolume = Math.min(1, currentVolume + 0.1);
                video.volume = currentVolume;
            } else {
                clearInterval(fadeInterval);
            }
        }, 30); // 30ms intervals = ~300ms total fade

        // Store interval for cleanup
        video.dataset.fadeInterval = fadeInterval;
    }
}

function handleVideoCardLeave(e) {
    const element = getElementFromTarget(e.target);
    if (!element) return;

    const card = element.closest('.project-card, .alpine-card');
    if (!card) return;

    const video = card.querySelector('video');
    if (video && !video.paused) {
        // Clear any ongoing fade-in
        if (video.dataset.fadeInterval) {
            clearInterval(parseInt(video.dataset.fadeInterval));
            delete video.dataset.fadeInterval;
        }

        // Fade out audio over 200ms before pausing
        let currentVolume = video.volume;
        const fadeInterval = setInterval(() => {
            if (currentVolume > 0) {
                currentVolume = Math.max(0, currentVolume - 0.1);
                video.volume = currentVolume;
            } else {
                clearInterval(fadeInterval);
                video.pause();
            }
        }, 20); // 20ms intervals = ~200ms total fade
    }
}

// Alpine Education Card Video Hover Functionality
// Performance: Now handled by unified video hover play event delegation
export function initializeAlpineEducationVideo() {
    // This functionality is now handled by the unified video hover event delegation
    // No need for separate initialization - keeps code DRY and performant
}

