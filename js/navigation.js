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
            console.log(`🟣 [Navigation] Starting puff-out animation`);
            console.log(`🟣 [Navigation] Final rotation from state: ${finalRotation}°`);
            
            // Check for leftover Web Animations
            const activeAnimations = workshopSealBtn.getAnimations();
            console.log(`🟣 [Navigation] Active animations on button:`, activeAnimations.length);
            if (activeAnimations.length > 0) {
                console.log(`🟣 [Navigation] Cancelling ${activeAnimations.length} active animations`);
                activeAnimations.forEach(anim => anim.cancel());
            }
            
            // Clear any conflicting styles except rotation (keep button at rotated position)
            workshopSealBtn.style.transition = 'none';
            workshopSealBtn.style.filter = '';
            workshopSealBtn.style.opacity = '';
            workshopSealBtn.style.animation = ''; // Clear any CSS animations
            
            // Check current transform before modifying
            console.log(`🟣 [Navigation] Button transform BEFORE:`, workshopSealBtn.style.transform);
            console.log(`🟣 [Navigation] Button CSS variable BEFORE:`, getComputedStyle(workshopSealBtn).getPropertyValue('--button-rotation'));
            console.log(`🟣 [Navigation] Computed transform BEFORE:`, getComputedStyle(workshopSealBtn).transform);

            // Set/update rotation CSS variable (may already be set from workshop-seal.js)
            workshopSealBtn.style.setProperty('--button-rotation', `${finalRotation}deg`);

            // CRITICAL: Set transform to actual value, not CSS variable reference
            // Web Animations API needs a concrete starting point
            workshopSealBtn.style.transform = `scale(1) rotate(${finalRotation}deg)`;

            console.log(`🟣 [Navigation] Button transform AFTER:`, workshopSealBtn.style.transform);
            console.log(`🟣 [Navigation] Button CSS variable AFTER:`, getComputedStyle(workshopSealBtn).getPropertyValue('--button-rotation'));
            console.log(`🟣 [Navigation] Computed transform:`, getComputedStyle(workshopSealBtn).transform);

            // Force a reflow to ensure styles are applied
            workshopSealBtn.offsetHeight;

            workshopSealBtn.classList.add('on-workshop-tab');

            // Use Web Animations API to animate while preserving rotation
            requestAnimationFrame(() => {
                console.log(`🟣 [Navigation] Applying puff-out animation with Web Animations API`);
                console.log(`🟣 [Navigation] Animation FROM: scale(1) rotate(${finalRotation}deg)`);
                console.log(`🟣 [Navigation] Animation TO: scale(2) rotate(${finalRotation}deg)`);

                // Check computed style right before animation
                const computedBefore = getComputedStyle(workshopSealBtn);
                console.log(`🟣 [Navigation] Computed transform at animation start:`, computedBefore.transform);
                console.log(`🟣 [Navigation] Computed filter:`, computedBefore.filter);
                console.log(`🟣 [Navigation] Computed opacity:`, computedBefore.opacity);

                // Use Web Animations API instead of CSS animation (CSS variables don't work in @keyframes)
                const puffOutAnimation = workshopSealBtn.animate([
                    {
                        transform: `scale(1) rotate(${finalRotation}deg)`,
                        filter: 'blur(0px)',
                        opacity: 1
                    },
                    {
                        transform: `scale(2) rotate(${finalRotation}deg)`,
                        filter: 'blur(4px)',
                        opacity: 0
                    }
                ], {
                    duration: 1000,
                    easing: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                    fill: 'both'
                });

                console.log(`🟣 [Navigation] Animation object created:`, puffOutAnimation);
                console.log(`🟣 [Navigation] Animation playState:`, puffOutAnimation.playState);

                // After animation completes, lock in the final state
                puffOutAnimation.onfinish = () => {
                    console.log(`🟣 [Navigation] Puff-out animation complete, locking final state`);
                    console.log(`🟣 [Navigation] Final locked rotation: ${finalRotation}°`);
                    
                    // Cancel the animation to free up resources
                    puffOutAnimation.cancel();
                    
                    // Lock the final state explicitly with rotation preserved
                    workshopSealBtn.style.transform = `scale(2) rotate(${finalRotation}deg)`;
                    workshopSealBtn.style.filter = 'blur(4px)';
                    workshopSealBtn.style.opacity = '0';
                    
                    console.log(`🟣 [Navigation] Locked transform:`, workshopSealBtn.style.transform);
                };
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
            console.log(`🟣 [Navigation] Starting puff-in (reverse) animation`);

            // The button is currently at scale(2) rotate(finalRotation) blur(4px) opacity(0)
            // Animate back to normal state, rotating back to 0
            const currentRotation = finalRotation; // Store current rotation

            // Use Web Animations API for reverse animation
            const puffInAnimation = workshopSealBtn.animate([
                {
                    transform: `scale(2) rotate(${currentRotation}deg)`,
                    filter: 'blur(4px)',
                    opacity: 0
                },
                {
                    transform: 'scale(1) rotate(0deg)',
                    filter: 'blur(0px)',
                    opacity: 1
                }
            ], {
                duration: 1000,
                easing: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                fill: 'both'
            });

            // After reverse animation completes, restore normal state
            puffInAnimation.onfinish = () => {
                console.log(`🟣 [Navigation] Puff-in animation complete, restoring normal state`);
                
                // Cancel the animation explicitly to free up state
                puffInAnimation.cancel();
                
                // Remove class and clear ALL inline styles
                workshopSealBtn.classList.remove('on-workshop-tab');
                workshopSealBtn.style.transform = '';
                workshopSealBtn.style.filter = '';
                workshopSealBtn.style.opacity = '';
                workshopSealBtn.style.transition = '';
                workshopSealBtn.style.animation = '';
                workshopSealBtn.style.willChange = '';
                workshopSealBtn.style.removeProperty('--button-rotation');
                
                finalRotation = 0; // Reset rotation for next time
                
                console.log(`🟣 [Navigation] Button fully reset, inline transform:`, workshopSealBtn.style.transform);
                console.log(`🟣 [Navigation] Computed transform after reset:`, getComputedStyle(workshopSealBtn).transform);
            };
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

