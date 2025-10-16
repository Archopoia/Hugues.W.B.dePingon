// Medieval Character Sheet - Workshop Seal Button Handler
// Location: /home/hullivan/Hugues.W.B.dePingon/js/workshop-seal.js

import { loadSection, switchTab, setSkipWorkshopAnimation, setFinalRotation, getFinalRotation } from './navigation.js';

let pressTimer = null;
let pressStartTime = 0;
let rotationInterval = null;
let currentRotation = 0;
let rotationSpeed = 0;
let activeWorkshopTab = null;

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

    // Use performance.now() for consistency with requestAnimationFrame
    pressStartTime = performance.now();
    currentRotation = 0;
    rotationSpeed = 0;

    // Disable transition during rotation and clear any lingering styles
    workshopSealButton.style.transition = 'none';
    workshopSealButton.style.animation = '';
    workshopSealButton.style.transform = 'rotate(0deg)'; // Start from 0

    // Add pressing class for pulse effect
    workshopSealButton.classList.add('pressing');

    // Play pull sound
    if (window.soundManager) {
        window.soundManager.startPull();
    }

    // Preload workshop content if not loaded
    await loadSection('workshop');

    // Re-get the workshop tab reference after loading (in case DOM was modified)
    activeWorkshopTab = document.getElementById('workshop');

    // Show workshop tab for preview (but not as active yet)
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

        // Apply workshop burgundy background with patterns
        activeWorkshopTab.style.background = `
            radial-gradient(circle at 20% 20%, rgba(100, 48, 48, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(100, 48, 48, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, var(--red-theme-alpha) 0%, var(--red-theme) 50%)
        `;
        activeWorkshopTab.style.backgroundColor = 'var(--parchment-light)';
        activeWorkshopTab.style.boxShadow = 'inset 0 0 0 2px var(--border-tan)';

        // Add the diagonal hatched lines pattern as an overlay
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

        // Ensure all content inside has proper z-index
        const contentChildren = activeWorkshopTab.children;
        for (let i = 0; i < contentChildren.length; i++) {
            if (contentChildren[i].id !== 'workshop-preview-overlay') {
                contentChildren[i].style.position = 'relative';
                contentChildren[i].style.zIndex = '2';
            }
        }

        // Start with fully hidden state
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

    // Start rotation animation using requestAnimationFrame
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

        const glowSpeed = Math.max(0.3, 2 - (pressDuration * 0.8));
        workshopSealButton.style.setProperty('--glow-speed', `${glowSpeed}s`);

        // Progressive reveal
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
        workshopSealButton.style.setProperty('--glow-speed', '2s');

        // Reverse the workshop tab animation
        if (activeWorkshopTab && !activeWorkshopTab.classList.contains('active')) {
            cleanupWorkshopPreview(activeWorkshopTab, false);
        }

        pressStartTime = 0;
        rotationSpeed = 0;
        currentRotation = 0;
        return;
    }

    // Stop pull sound and play release sound
    if (window.soundManager) {
        window.soundManager.stopPull(true);
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

    // Complete the tab reveal animation
    if (activeWorkshopTab) {
        const remainingProgress = 1 - revealProgress;
        const completionDuration = remainingProgress * 300;

        activeWorkshopTab.style.transition = `transform ${completionDuration}ms ease-out`;
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
        workshopSealButton.style.setProperty('--glow-speed', '2s');
    }

    if (activeWorkshopTab && !activeWorkshopTab.classList.contains('active')) {
        cleanupWorkshopPreview(activeWorkshopTab, false);
    }

    pressStartTime = 0;
    rotationSpeed = 0;
    currentRotation = 0;
}

function cleanupWorkshopPreview(workshopTab, keepVisible) {
    const sheetContent = document.querySelector('.sheet-content');
    const characterSheet = document.querySelector('.character-sheet');

    if (!keepVisible) {
        // CRITICAL: Get the COMPUTED transform (actual visual position) not inline style
        const computedStyle = window.getComputedStyle(workshopTab);
        const computedTransform = computedStyle.transform;

        // Extract current rotation from the inline style as backup
        const currentTransform = workshopTab.style.transform;
        const currentRotateMatch = currentTransform.match(/rotateX\(([^)]+)\)/);
        const currentRotateX = currentRotateMatch ? parseFloat(currentRotateMatch[1]) : 0;

        // Step 1: Explicitly set current position with NO transition (freeze frame)
        workshopTab.style.transition = 'none';
        workshopTab.style.transform = `rotateX(${currentRotateX}deg)`;

        // Step 2: Force reflow to ensure the browser applies this state
        workshopTab.offsetHeight;

        // Step 3: Use requestAnimationFrame to ensure browser has painted the freeze frame
        requestAnimationFrame(() => {
            // Now add transition and animate to final position
            // Use cubic-bezier that matches the reverse motion (ease-in for folding back up)
            workshopTab.style.transition = 'transform 0.5s cubic-bezier(0.680, -0.275, 0.825, 0.115)';

            // Set target position (will animate smoothly from frozen position)
            workshopTab.style.transform = 'rotateX(-70deg)';
        });
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

    // Remove overlay
    const overlay = document.getElementById('workshop-preview-overlay');
    if (overlay) {
        overlay.remove();
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
                workshopTab.style.boxShadow = '';

                const contentChildren = workshopTab.children;
                for (let i = 0; i < contentChildren.length; i++) {
                    contentChildren[i].style.position = '';
                    contentChildren[i].style.zIndex = '';
                }
            }
        }, 500); // Match the animation duration
    } else {
        workshopTab.style.transition = 'none';
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
        workshopTab.style.boxShadow = '';

        requestAnimationFrame(() => {
            if (workshopTab) {
                workshopTab.style.transform = '';
                workshopTab.style.transformOrigin = '';
                workshopTab.style.backfaceVisibility = '';
                workshopTab.style.transition = '';
                workshopTab.style.opacity = '';
            }
        });

        const contentChildren = workshopTab.children;
        for (let i = 0; i < contentChildren.length; i++) {
            contentChildren[i].style.position = '';
            contentChildren[i].style.zIndex = '';
        }
    }
}

