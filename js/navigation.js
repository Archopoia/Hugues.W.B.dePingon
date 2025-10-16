// Medieval Character Sheet - Navigation & Section Loading
// Location: /home/hullivan/Hugues.W.B.dePingon/js/navigation.js

import { initializePortfolioNavigation, initializeSkillsNavigation, animateSkillBars } from './section-handlers.js';
import { initializeContactMethods } from './forms.js';
import { initializeEducationNavigation, initializeAlpineEducationVideo } from './media.js';
import { initializeRandomCardFlip } from './animations.js';
import { initializeFlipSounds } from './animations.js';

let skipWorkshopAnimation = false;
let finalRotation = 0;

// Dynamic Section Loader - Load HTML sections on demand
export async function loadSection(sectionName) {
    const sectionContainer = document.getElementById(sectionName);

    // If section is already loaded, skip
    if (sectionContainer && sectionContainer.dataset.loaded === 'true') {
        return;
    }

    try {
        const response = await fetch(`sections/${sectionName}.html`);
        if (!response.ok) throw new Error(`Failed to load ${sectionName}`);

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const section = doc.querySelector('section');

        if (section && sectionContainer) {
            // Replace placeholder with actual content
            sectionContainer.outerHTML = section.outerHTML;

            // Mark as loaded
            const loadedSection = document.getElementById(sectionName);
            if (loadedSection) {
                loadedSection.dataset.loaded = 'true';

                // Reapply translations if i18n is available
                if (typeof applyLanguage === 'function' && typeof currentLang !== 'undefined') {
                    applyLanguage(currentLang);
                }

                // Reinitialize any section-specific features with a delay
                setTimeout(() => {
                    if (sectionName === 'portfolio') {
                        initializePortfolioNavigation();
                        window.initializeVideoHoverPlay();
                    }
                    if (sectionName === 'skills') {
                        initializeSkillsNavigation();
                        setTimeout(() => animateSkillBars(), 200);
                    }
                    if (sectionName === 'contact') {
                        initializeContactMethods();
                    }
                    if (sectionName === 'education') {
                        initializeEducationNavigation();
                        initializeAlpineEducationVideo();
                    }
                    if (sectionName === 'workshop') {
                        initializeRandomCardFlip();
                    }

                    // Initialize flip sounds for any flippable cards in this section
                    initializeFlipSounds();

                    // Performance: Refresh lazy loader for new content
                    if (window.lazyLoader) {
                        window.lazyLoader.refresh();
                    }
                }, 150);
            }
        }
    } catch (error) {
        // Section failed to load - silently continue
    }
}

// Preload sections for better UX
export function preloadAllSections() {
    const sections = ['about', 'workshop', 'education', 'experience', 'portfolio', 'skills', 'contact'];
    sections.forEach(section => {
        if (section !== 'about') { // About is loaded by default
            loadSection(section);
        }
    });
}

// Tab switching function (can be called programmatically)
export async function switchTab(targetTab) {
    // Load section dynamically if not loaded
    await loadSection(targetTab);

    // Remove active class from all buttons and contents
    const allTabButtons = document.querySelectorAll('.tab-button, .workshop-seal-button');
    allTabButtons.forEach(btn => btn.classList.remove('active'));
    const allTabContents = document.querySelectorAll('.tab-content');
    allTabContents.forEach(content => content.classList.remove('active'));

    // Clean up workshop tab preview styles if switching away from it
    const workshopTabElement = document.getElementById('workshop');
    if (targetTab !== 'workshop' && workshopTabElement) {
        // Force hide the workshop tab
        workshopTabElement.style.display = 'none';
        workshopTabElement.style.position = '';
        workshopTabElement.style.top = '';
        workshopTabElement.style.left = '';
        workshopTabElement.style.width = '';
        workshopTabElement.style.zIndex = '';
        workshopTabElement.style.transform = '';
        workshopTabElement.style.transformOrigin = '';
        workshopTabElement.style.opacity = '';
        workshopTabElement.style.transformStyle = '';
        workshopTabElement.style.backfaceVisibility = '';
        workshopTabElement.style.minHeight = '';
        workshopTabElement.style.pointerEvents = '';
        // Remove animation override so normal animation works next time
        workshopTabElement.style.removeProperty('animation');
        workshopTabElement.style.transition = '';
    }

    // Add active class to target button and content
    const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
    if (targetButton) targetButton.classList.add('active');
    document.getElementById(targetTab).classList.add('active');

    // Toggle workshop background on sheet-content
    const sheetContent = document.querySelector('.sheet-content');
    const workshopSealBtn = document.querySelector('.workshop-seal-button');
    const characterSheet = document.querySelector('.character-sheet');

    if (targetTab === 'workshop') {
        sheetContent.classList.add('workshop-active');

        // Animate the workshop seal button (puff out) and change colors gradually
        if (workshopSealBtn) {
            // Clear any conflicting styles and set rotation CSS variable
            workshopSealBtn.style.transition = 'none';
            workshopSealBtn.style.transform = '';
            workshopSealBtn.style.filter = '';
            workshopSealBtn.style.opacity = '';
            workshopSealBtn.style.setProperty('--button-rotation', `${finalRotation}deg`);

            // Force a reflow to ensure styles are applied
            workshopSealBtn.offsetHeight;

            workshopSealBtn.classList.add('on-workshop-tab');

            // Use requestAnimationFrame to ensure animation starts
            requestAnimationFrame(() => {
                // Apply animation with rotation via CSS variable
                workshopSealBtn.style.animation = 'puff-out-center 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) both';

                // After animation completes, lock in the final state with rotation
                setTimeout(() => {
                    // Lock the final state explicitly with rotation preserved
                    workshopSealBtn.style.transform = `scale(2) rotate(${finalRotation}deg)`;
                    workshopSealBtn.style.filter = 'blur(4px)';
                    workshopSealBtn.style.opacity = '0';
                    workshopSealBtn.style.animation = '';
                }, 1000);
            });
        }

        // Ensure workshop tab display is reset to normal
        if (workshopTabElement) {
            workshopTabElement.style.display = '';
        }
    } else {
        sheetContent.classList.remove('workshop-active');

        // Animate the workshop seal button back (puff in reverse)
        if (workshopSealBtn && workshopSealBtn.classList.contains('on-workshop-tab')) {
            // Reset rotation to 0 before puff-in animation
            workshopSealBtn.style.setProperty('--button-rotation', '0deg');
            workshopSealBtn.style.transform = 'scale(2) rotate(0deg)'; // Reset rotation but keep scale

            // Force reflow
            workshopSealBtn.offsetHeight;

            // The button is currently at scale(2) rotate(0) blur(4px) opacity(0)
            // Start from the locked final state and animate back
            workshopSealBtn.style.animation = 'puff-out-center 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) reverse both';

            // After reverse animation completes, restore normal state
            setTimeout(() => {
                workshopSealBtn.classList.remove('on-workshop-tab');
                workshopSealBtn.style.animation = '';
                workshopSealBtn.style.transform = '';
                workshopSealBtn.style.filter = '';
                workshopSealBtn.style.opacity = '';
                workshopSealBtn.style.removeProperty('--button-rotation');
                finalRotation = 0; // Reset rotation for next time
            }, 1000);
        } else if (workshopSealBtn) {
            workshopSealBtn.classList.remove('on-workshop-tab');
            workshopSealBtn.style.removeProperty('--button-rotation');
            finalRotation = 0; // Reset rotation
        }

        // Clean up any perspective and height changes from preview
        if (sheetContent) {
            sheetContent.style.perspective = '';
            sheetContent.style.perspectiveOrigin = '';
            sheetContent.style.minHeight = '';
        }
        if (characterSheet) {
            characterSheet.style.minHeight = '';
        }
    }

    // Add page flip animation (skip for workshop if coming from progressive reveal)
    const activeContent = document.getElementById(targetTab);
    if (targetTab === 'workshop' && skipWorkshopAnimation) {
        skipWorkshopAnimation = false; // Reset flag
    } else {
        activeContent.style.animation = 'none';
        setTimeout(() => {
            activeContent.style.animation = 'swing-in-top-fwd 1s cubic-bezier(0.175, 0.885, 0.320, 1.275) both';
        }, 10);
    }

    // Animate skill bars when skills tab is opened
    if (targetTab === 'skills') {
        setTimeout(() => {
            animateSkillBars();
        }, 300);
    }
}

// Export for use in workshop seal button logic
export function setSkipWorkshopAnimation(value) {
    skipWorkshopAnimation = value;
}

export function setFinalRotation(value) {
    finalRotation = value;
}

export function getFinalRotation() {
    return finalRotation;
}

