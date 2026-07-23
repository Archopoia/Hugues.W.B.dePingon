// Medieval Character Sheet - Workshop Seal Button Handler
// Location: /home/hullivan/Hugues.W.B.dePingon/js/workshop-seal.js

import { loadSection, switchTab, setSkipWorkshopAnimation, setFinalRotation, getFinalRotation } from './navigation.js';

let pressTimer = null;
let pressStartTime = 0;
let rotationInterval = null;
let currentRotation = 0;
let rotationSpeed = 0;
let activeWorkshopTab = null;
let reverseAnimationFrame = null; // Track reverse animation
let wasReverseAnimationCanceled = false; // Track if reverse animation was canceled

// Get the pull sound duration to sync animation
let pullSoundDuration = 2.0; // Default

export function initializeWorkshopSeal() {
    const workshopSealButton = document.querySelector('.workshop-seal-button');

    if (!workshopSealButton) return;

    // Wait for sound manager to get duration
    if (window.soundManager) {
        setTimeout(() => {
            pullSoundDuration = window.soundManager.getPullDuration();
        }, 500);
    }

    // Create and add the pulsating glow element
    const glowElement = document.createElement('div');
    glowElement.className = 'workshop-glow';
    workshopSealButton.appendChild(glowElement);

    // Event listeners
    workshopSealButton.addEventListener('mousedown', startPress);
    workshopSealButton.addEventListener('mouseup', endPress);
    workshopSealButton.addEventListener('mouseleave', cancelPress);
    workshopSealButton.addEventListener('touchstart', startPress);
    workshopSealButton.addEventListener('touchend', endPress);
    workshopSealButton.addEventListener('touchcancel', cancelPress);

    // Prevent click event from firing (we handle it manually)
    workshopSealButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
}

async function startPress(e) {
    e.preventDefault();
    e.stopPropagation();

    const workshopSealButton = document.querySelector('.workshop-seal-button');

    // Don't allow pressing if already on workshop tab
    if (workshopSealButton.classList.contains('on-workshop-tab')) {
        return;
    }

    // Cancel any leftover animations from previous interactions
    const activeAnimations = workshopSealButton.getAnimations();
    if (activeAnimations.length > 0) {
        activeAnimations.forEach(anim => anim.cancel());
    }

    // Cancel any ongoing reverse animation
    if (reverseAnimationFrame) {
        cancelAnimationFrame(reverseAnimationFrame);
        reverseAnimationFrame = null;
        wasReverseAnimationCanceled = true;

        // Don't clean up workshop preview when canceling reverse animation
        // The new press will continue from the current state
    }

    // Use performance.now() for consistency with requestAnimationFrame
    pressStartTime = performance.now();

    // If we're continuing from a canceled reverse animation, don't reset rotation
    if (!wasReverseAnimationCanceled) {
        currentRotation = 0;
        rotationSpeed = 0;
    } else {
        // We're continuing from a canceled reverse animation, keep current rotation
        wasReverseAnimationCanceled = false; // Reset flag
    }

    // Disable transition during rotation and clear any lingering styles
    workshopSealButton.style.transition = 'none';
    workshopSealButton.style.animation = '';
    workshopSealButton.style.transform = `rotate(${currentRotation}deg)`; // Start from current rotation

    // Add pressing class for pulse effect
    workshopSealButton.classList.add('pressing');

    // Play pull sound
    if (window.soundManager) {
        window.soundManager.startPull();
    }

    // Preload workshop content if not loaded
    await loadSection('workshop');

    // Check if on smaller screen for scrolling behavior
    const isMobileView = window.innerWidth <= 968;

    // On mobile, scroll to navigation tabs on press
    if (isMobileView) {
        const sheetTabs = document.querySelector('.sheet-tabs');
        if (sheetTabs) {
            sheetTabs.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Re-get the workshop tab reference after loading (in case DOM was modified)
    activeWorkshopTab = document.getElementById('workshop');

    // Show workshop tab for preview (same logic for all screen sizes)
    if (activeWorkshopTab) {
        const sheetContent = document.querySelector('.sheet-content');
        const characterSheet = document.querySelector('.character-sheet');

        if (sheetContent) {
            sheetContent.style.perspective = '2000px';
            sheetContent.style.perspectiveOrigin = 'center top';
        }

        // Store original height to restore later
        if (sheetContent && !sheetContent.dataset.originalMinHeight) {
            sheetContent.dataset.originalMinHeight = window.getComputedStyle(sheetContent).minHeight;
        }
        if (characterSheet && !characterSheet.dataset.originalMinHeight) {
            characterSheet.dataset.originalMinHeight = window.getComputedStyle(characterSheet).minHeight;
        }

        // Hide all other tabs temporarily
        const allTabs = document.querySelectorAll('.tab-content');
        allTabs.forEach(tab => {
            if (tab !== activeWorkshopTab && tab.classList.contains('active')) {
                tab.style.opacity = '0.3';
                tab.style.pointerEvents = 'none';
            }
        });

        activeWorkshopTab.style.display = 'block';
        activeWorkshopTab.style.pointerEvents = 'none';
        activeWorkshopTab.style.animation = 'none';
        activeWorkshopTab.style.position = 'absolute';
        activeWorkshopTab.style.top = '0';
        activeWorkshopTab.style.left = '0';
        activeWorkshopTab.style.width = '100%';
        activeWorkshopTab.style.zIndex = '10';
        activeWorkshopTab.style.transformStyle = 'preserve-3d';
        activeWorkshopTab.style.minHeight = '500px';

        // Apply workshop burgundy background with ALL layers (1, 2, 3A)
        // LAYER 1: Red dots, horizontal lines, parchment base
        // LAYER 2: Burgundy wash
        // LAYER 3A: Dark burgundy overlay
        activeWorkshopTab.style.background = `
            radial-gradient(circle at 20% 20%, rgba(100, 48, 48, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(100, 48, 48, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, var(--red-theme-alpha) 0%, var(--red-theme) 50%),
            radial-gradient(#6100001f 3px, transparent 4px),
            radial-gradient(#6100001f 3px, transparent 4px),
            linear-gradient(var(--parchment-sublight) 4px, transparent 0),
            linear-gradient(45deg, transparent 74px, transparent 75px, transparent 76px, transparent 109px),
            linear-gradient(-45deg, transparent 75px, transparent 76px, transparent 77px, transparent 109px),
            var(--parchment-sublight)
        `;
        activeWorkshopTab.style.backgroundSize = '100% 100%, 100% 100%, 100% 100%, 109px 109px, 109px 109px, 100% 6px, 109px 109px, 109px 109px, 100% 100%';
        activeWorkshopTab.style.backgroundPosition = '0 0, 0 0, 0 0, 54px 55px, 0px 0px, 0px 0px, 0px 0px, 0px 0px, 0 0';
        activeWorkshopTab.style.boxShadow = 'inset 0 0 0 2px var(--border-tan)';

        // Add the diagonal hatched lines pattern as an overlay (LAYER 3B)
        const workshopOverlay = document.createElement('div');
        workshopOverlay.id = 'workshop-preview-overlay';
        workshopOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 20px,
                rgba(184, 134, 11, 0.1) 20px,
                rgba(184, 134, 11, 0.1) 21px
            );
            pointer-events: none;
            z-index: 0;
        `;
        activeWorkshopTab.insertBefore(workshopOverlay, activeWorkshopTab.firstChild);

        // Add inner gold border frame (LAYER 3C)
        const workshopBorder = document.createElement('div');
        workshopBorder.id = 'workshop-preview-border';
        workshopBorder.style.cssText = `
            position: absolute;
            top: 1rem;
            left: 1rem;
            right: 1rem;
            bottom: 1rem;
            border: 2px solid var(--gold-ink);
            border-radius: 8px;
            pointer-events: none;
            z-index: 0;
        `;
        activeWorkshopTab.insertBefore(workshopBorder, activeWorkshopTab.firstChild);

        // Ensure all content inside has proper z-index
        const contentChildren = activeWorkshopTab.children;
        for (let i = 0; i < contentChildren.length; i++) {
            if (contentChildren[i].id !== 'workshop-preview-overlay' &&
                contentChildren[i].id !== 'workshop-preview-border') {
                contentChildren[i].style.position = 'relative';
                contentChildren[i].style.zIndex = '2';
            }
        }

        // Start with fully hidden state (same 3D rotation for all screen sizes)
        activeWorkshopTab.style.transform = 'rotateX(-70deg)';
        activeWorkshopTab.style.transformOrigin = 'top';
        activeWorkshopTab.style.opacity = '1';
        activeWorkshopTab.style.backfaceVisibility = 'hidden';

        // Expand the parent containers
        const workshopHeight = activeWorkshopTab.offsetHeight;
        if (sheetContent && workshopHeight > 0) {
            sheetContent.style.minHeight = workshopHeight + 'px';
        }
        if (characterSheet && workshopHeight > 0) {
            characterSheet.style.minHeight = (workshopHeight + 64) + 'px';
        }
    }

    // Start rotation animation using requestAnimationFrame (same for all screen sizes)
    let lastTimestamp = performance.now();
    function animate(timestamp) {
        const deltaTime = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;

        const pressDuration = (timestamp - pressStartTime) / 1000;

        // Accelerating rotation
        const baseSpeed = 200;
        const acceleration = Math.pow(pressDuration + 0.5, 2.5) * 300;
        rotationSpeed = Math.min(baseSpeed + acceleration, 3000);

        currentRotation += rotationSpeed * deltaTime;

        workshopSealButton.style.willChange = 'transform';
        workshopSealButton.style.transform = `rotate(${currentRotation}deg)`;

        // Update pulse effect
        const pulseSpeed = Math.max(0.2, 1 - (pressDuration * 0.3));
        const pulseScale = Math.min(1.5 + (pressDuration * 0.5), 3);
        const pulseOpacity = Math.min(0.6 + (pressDuration * 0.1), 0.9);

        workshopSealButton.style.setProperty('--pulse-speed', `${pulseSpeed}s`);
        workshopSealButton.style.setProperty('--pulse-scale', pulseScale);
        workshopSealButton.style.setProperty('--pulse-opacity', pulseOpacity);

        // Progressive reveal (same 3D rotation for all screen sizes)
        if (activeWorkshopTab && activeWorkshopTab.parentElement) {
            const revealProgress = Math.min(pressDuration / pullSoundDuration, 1);
            const rotateX = -70 + (70 * revealProgress);

            activeWorkshopTab.style.willChange = 'transform';
            activeWorkshopTab.style.transform = `rotateX(${rotateX}deg)`;
            activeWorkshopTab.style.transformOrigin = 'top';
        }

        if (pressStartTime > 0) {
            rotationInterval = requestAnimationFrame(animate);
        } else {
            workshopSealButton.style.willChange = 'auto';
            if (activeWorkshopTab) {
                activeWorkshopTab.style.willChange = 'auto';
            }
        }
    }

    rotationInterval = requestAnimationFrame(animate);
}

async function endPress(e) {
    e.preventDefault();
    e.stopPropagation();

    const workshopSealButton = document.querySelector('.workshop-seal-button');

    // Ignore orphan mouseup/touchend (no matching pointer down on this control). Without this,
    // pressStartTime stays 0 and revealProgress becomes ~1, so we fire release + switchTab without
    // pull audio, preview, or hold timing.
    if (!workshopSealButton.classList.contains('pressing')) {
        return;
    }

    // Remove pressing class
    workshopSealButton.classList.remove('pressing');

    // Stop animation loop
    if (rotationInterval) {
        cancelAnimationFrame(rotationInterval);
    }

    const pressDuration = (performance.now() - pressStartTime) / 1000;
    const revealProgress = Math.min(pressDuration / pullSoundDuration, 1);


    // Check if animation is complete enough (at least 80% revealed)
    if (revealProgress < 0.8) {
        // Stop pull sound and play in reverse
        let pullStoppedAt = 0;
        if (window.soundManager) {
            pullStoppedAt = window.soundManager.stopPull(true);
            if (pullStoppedAt > 0) {
                window.soundManager.playPullReverse(pullStoppedAt);
            }
        }

        // Reset button with spring-back
        workshopSealButton.style.transition = 'transform 0.3s ease';
        workshopSealButton.style.transform = 'scale(1) rotate(0deg)';

        // Always clean up workshop preview for quick clicks (regardless of active state)
        if (activeWorkshopTab) {
            startReverseAnimation(workshopSealButton, activeWorkshopTab, currentRotation, revealProgress);
        }

        pressStartTime = 0;
        rotationSpeed = 0;
        currentRotation = 0;
        return;
    }

    // Stop pull sound and play release sound
    if (window.soundManager) {
        window.soundManager.stopPull(true);
        // Play release sound immediately
        window.soundManager.playRelease();
    }

    // Store the final rotation
    const finalRotation = currentRotation % 360;
    setFinalRotation(finalRotation);

    // CRITICAL: Reset press state immediately to prevent cancelPress from interfering
    // during the tab switch (animation loop is already stopped above)
    pressStartTime = 0;
    rotationSpeed = 0;
    rotationInterval = null;

    // Keep the button at its rotated position - navigation.js will handle the puff-out
    // Using CSS variable so the animation can access it
    workshopSealButton.style.setProperty('--button-rotation', `${finalRotation}deg`);
    workshopSealButton.style.transition = 'none';
    workshopSealButton.style.transform = `rotate(var(--button-rotation, 0deg))`;

    // Complete the tab reveal instantly (preview already matches final appearance)
    if (activeWorkshopTab) {
        activeWorkshopTab.style.transition = 'none';
        activeWorkshopTab.style.transform = 'rotateX(0deg)';
        activeWorkshopTab.style.pointerEvents = 'auto';
    }

    // Set flag to skip default animation
    setSkipWorkshopAnimation(true);

    if (activeWorkshopTab) {
        activeWorkshopTab.style.setProperty('animation', 'none', 'important');
    }

    // Switch to workshop tab
    const targetTab = workshopSealButton.getAttribute('data-tab');
    await switchTab(targetTab);

    // Clean up preview styles
    if (activeWorkshopTab) {
        cleanupWorkshopPreview(activeWorkshopTab, true);
    }
}

function cancelPress() {
    // Guard: Don't cancel if press isn't active (already completed or never started)
    if (pressStartTime === 0) {
        return;
    }

    const workshopSealButton = document.querySelector('.workshop-seal-button');

    workshopSealButton.classList.remove('pressing');

    if (rotationInterval) {
        cancelAnimationFrame(rotationInterval);
        rotationInterval = null;
    }

    // Cancel any ongoing reverse animation
    if (reverseAnimationFrame) {
        cancelAnimationFrame(reverseAnimationFrame);
        reverseAnimationFrame = null;
    }

    let pullStoppedAt = 0;
    if (window.soundManager) {
        pullStoppedAt = window.soundManager.stopPull(true);
        if (pullStoppedAt > 0) {
            window.soundManager.playPullReverse(pullStoppedAt);
        }
    }

    if (workshopSealButton) {
        workshopSealButton.style.transition = 'transform 0.3s ease';
        workshopSealButton.style.transform = 'scale(1) rotate(0deg)';
    }

    if (activeWorkshopTab && !activeWorkshopTab.classList.contains('active')) {
        startReverseAnimation(workshopSealButton, activeWorkshopTab, currentRotation, 0);
    }

    pressStartTime = 0;
    rotationSpeed = 0;
    currentRotation = 0;
}

function cleanupWorkshopPreview(workshopTab, keepVisible) {
    const sheetContent = document.querySelector('.sheet-content');
    const characterSheet = document.querySelector('.character-sheet');

    if (!keepVisible) {
        // For quick cleanup (when animation is complete), just hide immediately
        workshopTab.style.display = 'none';
        workshopTab.style.transform = '';
        workshopTab.style.transition = '';
        workshopTab.style.transformOrigin = '';
        workshopTab.style.pointerEvents = '';
        workshopTab.style.position = '';
        workshopTab.style.top = '';
        workshopTab.style.left = '';
        workshopTab.style.width = '';
        workshopTab.style.zIndex = '';
        workshopTab.style.backfaceVisibility = '';
        workshopTab.style.transformStyle = '';
        workshopTab.style.minHeight = '';
        workshopTab.style.background = '';
        workshopTab.style.backgroundColor = '';
        workshopTab.style.backgroundSize = '';
        workshopTab.style.backgroundPosition = '';
        workshopTab.style.boxShadow = '';
        workshopTab.style.opacity = '';
    }

    // Restore other tabs
    const allTabs = document.querySelectorAll('.tab-content');
    allTabs.forEach(tab => {
        if (tab !== workshopTab) {
            tab.style.opacity = '';
            tab.style.pointerEvents = '';
        }
    });

    // Restore sheet-content perspective and heights
    if (sheetContent) {
        sheetContent.style.perspective = '';
        sheetContent.style.perspectiveOrigin = '';
        sheetContent.style.minHeight = '';
    }
    if (characterSheet) {
        characterSheet.style.minHeight = '';
    }

    // Remove overlays (LAYER 3B and 3C)
    const overlay = document.getElementById('workshop-preview-overlay');
    if (overlay) {
        overlay.remove();
    }
    const border = document.getElementById('workshop-preview-border');
    if (border) {
        border.remove();
    }

    // Reset workshop tab styles after animation completes
    if (!keepVisible) {
        setTimeout(() => {
            if (workshopTab && !workshopTab.classList.contains('active')) {
                workshopTab.style.display = 'none';
                workshopTab.style.transform = '';
                workshopTab.style.transition = '';
                workshopTab.style.transformOrigin = '';
                workshopTab.style.pointerEvents = '';
                workshopTab.style.position = '';
                workshopTab.style.top = '';
                workshopTab.style.left = '';
                workshopTab.style.width = '';
                workshopTab.style.zIndex = '';
                workshopTab.style.backfaceVisibility = '';
                workshopTab.style.transformStyle = '';
                workshopTab.style.minHeight = '';
                workshopTab.style.background = '';
                workshopTab.style.backgroundColor = '';
                workshopTab.style.backgroundSize = '';
                workshopTab.style.backgroundPosition = '';
                workshopTab.style.boxShadow = '';

                const contentChildren = workshopTab.children;
                for (let i = 0; i < contentChildren.length; i++) {
                    contentChildren[i].style.position = '';
                    contentChildren[i].style.zIndex = '';
                }
            }
        }, 500); // Match the animation duration
    } else {
        // When keeping visible (switching to workshop tab), remove all inline styles instantly
        // The CSS from workshop.css will take over seamlessly since it has the same styling
        workshopTab.style.transition = 'none';
        workshopTab.style.transform = '';
        workshopTab.style.transformOrigin = '';
        workshopTab.style.position = '';
        workshopTab.style.top = '';
        workshopTab.style.left = '';
        workshopTab.style.width = '';
        workshopTab.style.zIndex = '';
        workshopTab.style.backfaceVisibility = '';
        workshopTab.style.transformStyle = '';
        workshopTab.style.minHeight = '';
        workshopTab.style.background = '';
        workshopTab.style.backgroundColor = '';
        workshopTab.style.backgroundSize = '';
        workshopTab.style.backgroundPosition = '';
        workshopTab.style.boxShadow = '';
        workshopTab.style.opacity = '';
        workshopTab.style.pointerEvents = '';

        const contentChildren = workshopTab.children;
        for (let i = 0; i < contentChildren.length; i++) {
            contentChildren[i].style.position = '';
            contentChildren[i].style.zIndex = '';
        }
    }
}

function startReverseAnimation(workshopSealButton, activeWorkshopTab, startRotation, startRevealProgress) {
    const reverseStartTime = performance.now();
    const reverseDuration = pullSoundDuration * startRevealProgress; // Duration should match how long we've been pressing

    // Store initial states
    const startRotateX = -70 + (70 * startRevealProgress);

    // Disable transitions during reverse animation
    workshopSealButton.style.transition = 'none';
    if (activeWorkshopTab) {
        activeWorkshopTab.style.transition = 'none';
    }

    function reverseAnimate(timestamp) {
        const elapsed = (timestamp - reverseStartTime) / 1000;
        const progress = Math.min(elapsed / reverseDuration, 1);

        // Ease-out curve for smooth deceleration (inverse of the forward acceleration)
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);

        // Reverse rotation (from current rotation back to 0)
        const currentReverseRotation = startRotation * (1 - easeOutProgress);
        workshopSealButton.style.transform = `rotate(${currentReverseRotation}deg)`;

        // Reverse pulse effects (from current state back to normal)
        const reversePulseSpeed = Math.max(0.2, 1 - (startRevealProgress * 0.3) * (1 - progress));
        const reversePulseScale = Math.min(1.5 + (startRevealProgress * 0.5) * (1 - progress), 3);
        const reversePulseOpacity = Math.min(0.6 + (startRevealProgress * 0.1) * (1 - progress), 0.9);

        workshopSealButton.style.setProperty('--pulse-speed', `${reversePulseSpeed}s`);
        workshopSealButton.style.setProperty('--pulse-scale', reversePulseScale);
        workshopSealButton.style.setProperty('--pulse-opacity', reversePulseOpacity);

        // Reverse workshop tab reveal (from current rotation back to -70deg)
        if (activeWorkshopTab) {
            const reverseRotateX = startRotateX - (startRotateX + 70) * easeOutProgress;
            activeWorkshopTab.style.transform = `rotateX(${reverseRotateX}deg)`;
        }

        if (progress < 1) {
            reverseAnimationFrame = requestAnimationFrame(reverseAnimate);
        } else {
            // Animation complete - clean up
            reverseAnimationFrame = null;
            workshopSealButton.style.transition = '';
            workshopSealButton.style.transform = 'scale(1) rotate(0deg)';
            workshopSealButton.style.willChange = 'auto';

            // Clean up workshop preview
            if (activeWorkshopTab) {
                cleanupWorkshopPreview(activeWorkshopTab, false);
            }
        }
    }

    reverseAnimationFrame = requestAnimationFrame(reverseAnimate);
}

