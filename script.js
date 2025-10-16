// Medieval Character Sheet Interactive Features

// Security: HTML Sanitization Helper
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Security: Create element safely with text content
function createElementSafe(tag, content, className) {
    const elem = document.createElement(tag);
    if (className) elem.className = className;
    if (content) elem.textContent = content;
    return elem;
}

// Dynamic Section Loader - Load HTML sections on demand
async function loadSection(sectionName) {
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
                        initializeVideoHoverPlay();
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

                    // Initialize flip sounds for any flippable cards in this section
                    initializeFlipSounds();
                }, 150);
            }
        }
    } catch (error) {
        // Section failed to load - silently continue
    }
}

// Portfolio Category Filtering - Function for reinitialization
function initializePortfolioNavigation() {
    const portNavBtns = document.querySelectorAll('.port-nav-btn');
    const portfolioCategories = document.querySelectorAll('.portfolio-category');

    portNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');

            // Update active button
            portNavBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Show/hide categories with animation
            portfolioCategories.forEach(cat => {
                if (cat.getAttribute('data-category') === category) {
                    cat.style.display = 'block';
                    cat.style.animation = 'fadeIn 0.5s ease-in-out';
                } else {
                    cat.style.display = 'none';
                }
            });
        });
    });
}

// Skills Category Filtering - Function for reinitialization
function initializeSkillsNavigation() {
    const skillNavBtns = document.querySelectorAll('.skill-nav-btn');
    const skillSections = document.querySelectorAll('.skill-section');

    skillNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-skill-category');

            // Update active button
            skillNavBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Show/hide skill sections with animation
            skillSections.forEach(section => {
                if (section.getAttribute('data-skill-category') === category) {
                    section.style.display = 'block';
                    section.style.animation = 'fadeIn 0.5s ease-in-out';

                    // Animate skill bars when section becomes visible
                    setTimeout(() => {
                        const skillFills = section.querySelectorAll('.skill-fill');
                        skillFills.forEach(fill => {
                            const width = fill.getAttribute('data-width');
                            fill.style.width = width + '%';
                        });
                    }, 100);
                } else {
                    section.style.display = 'none';
                }
            });
        });
    });
}

// Skill bar animation
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
        bar.classList.add('animate');
    });
}

// Preload sections for better UX
function preloadAllSections() {
    const sections = ['about', 'workshop', 'education', 'experience', 'portfolio', 'skills', 'contact'];
    sections.forEach(section => {
        if (section !== 'about') { // About is loaded by default
            loadSection(section);
        }
    });
}

// Initialize flip sound effects for cards
function initializeFlipSounds() {
    // Find all expertise cards and academic stat cards
    const flipCards = document.querySelectorAll('.expertise-card, .academic-stat');

    flipCards.forEach(card => {
        // Remove any existing flip sound listener to avoid duplicates
        card.removeEventListener('mouseenter', playFlipSoundOnHover);
        // Add hover listener for flip sound
        card.addEventListener('mouseenter', playFlipSoundOnHover);

        // Add flip lock behavior for all flipping cards with 2-second delay
        let isFlipping = false;
        let flipTimeout = null;
        let unflipTimeout = null;

        card.addEventListener('mouseenter', function() {
            // Clear any pending unflip timeout
            if (unflipTimeout) {
                clearTimeout(unflipTimeout);
                unflipTimeout = null;
            }

            if (!isFlipping && !this.classList.contains('flipped')) {
                isFlipping = true;
                this.classList.add('flipped');

                // Lock the flip for the duration of the animation (600ms)
                flipTimeout = setTimeout(() => {
                    isFlipping = false;
                }, 600);
            }
        });

        card.addEventListener('mouseleave', function() {
            // Wait 2 seconds before unflipping
            unflipTimeout = setTimeout(() => {
                if (!this.matches(':hover')) {
                    this.classList.remove('flipped');
                    isFlipping = false;
                    if (flipTimeout) clearTimeout(flipTimeout);
                }
            }, 2000); // 2 second delay
        });
    });
}

function playFlipSoundOnHover() {
    if (window.soundManager) {
        window.soundManager.playRandomFlipSound();
    }
}

// Note: Static loader is in HTML and stays visible until soundManager.js handles it
// Animation keyframes are defined in soundManager.js

document.addEventListener('DOMContentLoaded', function() {
    // Load About section immediately
    loadSection('about');

    // Mini-jeu caché : Quête du Code Secret avec Randomisation Quotidienne
    let secretSequence = [];

    // Generate daily sequence (always starts with 'age')
    // Using data-i18n values which are language-independent
    const today = new Date().getDay();
    const remainingStats = ['origin', 'location', 'current-role'];
    const dailySequences = [
        ['age', 'origin', 'location', 'current-role'],      // Sunday (default)
        ['age', 'location', 'current-role', 'origin'],      // Monday
        ['age', 'current-role', 'origin', 'location'],      // Tuesday
        ['age', 'origin', 'current-role', 'location'],      // Wednesday
        ['age', 'location', 'origin', 'current-role'],      // Thursday
        ['age', 'current-role', 'location', 'origin'],      // Friday
        ['age', 'origin', 'location', 'current-role'],      // Saturday (same as Sunday)
    ];
    const correctSequence = dailySequences[today];

    let resetTimer = null;
    let achievementUnlocked = false;
    let lockedStats = [];

    // Konami-style Tab Code Easter Egg
    let tabSequence = [];
    const konamiTabCode = ['about', 'education', 'portfolio', 'skills', 'portfolio', 'education', 'about']; // A-E-P-S-P-E-A
    let konamiUnlocked = false;

    function resetSequence() {
        secretSequence = [];
        // Remove locked highlights
        lockedStats.forEach(stat => {
            stat.classList.remove('stat-locked');
        });
        lockedStats = [];
        clearTimeout(resetTimer);

        // Remove portrait vibration
        const portraitFrame = document.querySelector('.portrait-frame');
        if (portraitFrame) {
            portraitFrame.classList.remove('portrait-vibrate-1', 'portrait-vibrate-2', 'portrait-vibrate-3', 'portrait-vibrate-4');
        }
    }

    function showFailAnimation() {
        const sheet = document.querySelector('.character-sheet');
        sheet.classList.add('shake-fail');

        // Flash red
        const failFlash = document.createElement('div');
        failFlash.className = 'fail-flash';
        document.body.appendChild(failFlash);

        // Play react fail sound
        if (window.soundManager) {
            window.soundManager.playReactFail();
        }

                setTimeout(() => {
            sheet.classList.remove('shake-fail');
            failFlash.remove();
        }, 800);
    }

    function unlockAchievement(isFirstTime) {
        const achievement = document.createElement('div');
        achievement.className = isFirstTime ? 'secret-achievement' : 'secret-achievement-repeat';

        if (isFirstTime) {
            // Create elements safely without innerHTML
            const glow = document.createElement('div');
            glow.className = 'achievement-glow';
            achievement.appendChild(glow);

            const icon = document.createElement('i');
            icon.className = 'fas fa-trophy';
            achievement.appendChild(icon);

            const title = document.createElement('h3');
            title.textContent = 'Secret Découvert !';
            achievement.appendChild(title);

            const subtitle = document.createElement('p');
            subtitle.textContent = '"Le Code du Designer"';
            achievement.appendChild(subtitle);

            const text = document.createElement('p');
            text.className = 'achievement-subtext';
            text.textContent = 'Tu as découvert la séquence cachée. Nous, les designers, voyons et créons des motifs partout.';
            achievement.appendChild(text);

            // Create particle effects
            for (let i = 0; i < 30; i++) {
                setTimeout(() => createParticle(), i * 100);
            }
        } else {
            const icon = document.createElement('i');
            icon.className = 'fas fa-check-circle';
            achievement.appendChild(icon);

            const title = document.createElement('h3');
            title.textContent = 'Code Confirmé';
            achievement.appendChild(title);

            const text = document.createElement('p');
            text.className = 'achievement-subtext';
            text.textContent = 'Tu te souviens bien de la séquence.';
            achievement.appendChild(text);
        }

        document.body.appendChild(achievement);

        setTimeout(() => {
            achievement.style.animation = 'fadeOut 1s forwards';
            setTimeout(() => achievement.remove(), 1000);
        }, isFirstTime ? 5000 : 3000);
    }

    function unlockKonamiSecret() {
        const achievement = document.createElement('div');
        achievement.className = 'konami-achievement';

        // Create elements safely without innerHTML
        const glow = document.createElement('div');
        glow.className = 'achievement-glow';
        achievement.appendChild(glow);

        const icon = document.createElement('i');
        icon.className = 'fas fa-star';
        achievement.appendChild(icon);

        const title = document.createElement('h3');
        title.textContent = 'Master Navigator!';
        achievement.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.textContent = '"The Seven Paths"';
        achievement.appendChild(subtitle);

        const text = document.createElement('p');
        text.className = 'achievement-subtext';
        text.textContent = 'You\'ve mastered the sacred navigation sequence. About → Education → Portfolio → Skills → Portfolio → Education → About';
        achievement.appendChild(text);

        document.body.appendChild(achievement);

        // Special rainbow particles
        for (let i = 0; i < 50; i++) {
            setTimeout(() => createRainbowParticle(), i * 60);
        }

        setTimeout(() => {
            achievement.style.animation = 'fadeOut 1s forwards';
            setTimeout(() => achievement.remove(), 1000);
        }, 6000);
    }

    function createRainbowParticle() {
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

    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'gold-particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
    }

    // Add click listeners to stat values
    const stats = document.querySelectorAll('.stat-item');
    const portraitFrame = document.querySelector('.portrait-frame');

    // Add subtle hint to Age stat (first in sequence)
    let hintInterval;
    function startAgeHint() {
        const ageStat = Array.from(stats).find(stat =>
            stat.querySelector('.stat-label').getAttribute('data-i18n') === 'age'
        );

        if (ageStat) {
            // Add periodic subtle pulse to Age stat (continues until achievement unlocked)
            hintInterval = setInterval(() => {
                if (secretSequence.length === 0 && !ageStat.classList.contains('stat-locked') && !achievementUnlocked) {
                    ageStat.classList.add('stat-hint-pulse');
                    // No sound for hint pulse - visual only
                    setTimeout(() => ageStat.classList.remove('stat-hint-pulse'), 2000);
                }
            }, 8000); // Pulse every 8 seconds

            // Do first pulse immediately
            setTimeout(() => {
                if (secretSequence.length === 0 && !achievementUnlocked) {
                    ageStat.classList.add('stat-hint-pulse');
                    // No sound for hint pulse - visual only
                    setTimeout(() => ageStat.classList.remove('stat-hint-pulse'), 2000);
                }
            }, 2000); // First hint after 2 seconds on page
        }
    }

    // Start the hint system
    startAgeHint();

    function updatePortraitFeedback() {
        const count = secretSequence.length;

        // Remove all previous vibration classes
        portraitFrame.classList.remove('portrait-vibrate-1', 'portrait-vibrate-2', 'portrait-vibrate-3', 'portrait-vibrate-4');

        if (count > 0 && count <= 4) {
            portraitFrame.classList.add(`portrait-vibrate-${count}`);
        }

        // Age hint continues until achievement is unlocked (not just when sequence starts)
    }

    stats.forEach(stat => {
        // Use data-i18n attribute which is language-independent
        const label = stat.querySelector('.stat-label').getAttribute('data-i18n');
        stat.addEventListener('click', function(e) {
            // Stop event from bubbling to portrait
            e.stopPropagation();

            // Only add if not already locked
            if (!this.classList.contains('stat-locked')) {
                this.style.animation = 'pulse 0.3s';
                setTimeout(() => this.style.animation = '', 300);

                // Lock this stat with highlight
                this.classList.add('stat-locked');
                lockedStats.push(this);

                secretSequence.push(label);

                // Play bell sound based on this stat's position in the CORRECT sequence
                // This way, each stat always plays the same bell (as a hint)
                // Position 0 in correct sequence = bell4, 1 = bell3, 2 = bell2, 3 = bell1
                const positionInCorrectSequence = correctSequence.indexOf(label);
                if (window.soundManager && positionInCorrectSequence >= 0) {
                    window.soundManager.playBellForSequence(positionInCorrectSequence);
                }

                // Update portrait feedback based on sequence length
                updatePortraitFeedback();

                // Reset after 5 seconds of inactivity
                clearTimeout(resetTimer);
                resetTimer = setTimeout(() => {
                    resetSequence();
                    portraitFrame.classList.remove('portrait-vibrate-1', 'portrait-vibrate-2', 'portrait-vibrate-3', 'portrait-vibrate-4');
                }, 5000);
            }
        });
    });

    // Portrait click = Submit/Check sequence
    const portraitImage = document.querySelector('.portrait-image');
    if (portraitImage) {
        // Load saved portrait state from localStorage
        const savedPortrait = localStorage.getItem('portraitState');
        if (savedPortrait === 'funny') {
            portraitImage.src = 'Assets/Hugues/funnysmiling.PNG';
        }

        portraitImage.addEventListener('click', function(e) {
            // Check if sequence is correct
            const current = secretSequence.join(',');
            const correct = correctSequence.join(',');

            if (current === correct) {
                // SUCCESS!
                if (!achievementUnlocked) {
                    // First time discovery
                    achievementUnlocked = true;
                    this.classList.add('portrait-spinning');

                    // Play success sound (first time - flagflow + react01)
                    if (window.soundManager) {
                        window.soundManager.playReactSuccess(true);
                    }

                    // Change portrait 3 seconds in (1 second before animation ends)
                    setTimeout(() => {
                        const portraitImg = document.querySelector('.portrait-image');
                        if (portraitImg) {
                            // Toggle between original and funny
                            const currentSrc = portraitImg.src;
                            if (currentSrc.includes('funnysmiling.PNG')) {
                                portraitImg.src = 'Assets/Hugues/roundvignette.jpg';
                                localStorage.setItem('portraitState', 'original');
                            } else {
                                portraitImg.src = 'Assets/Hugues/funnysmiling.PNG';
                                localStorage.setItem('portraitState', 'funny');
                            }
                        }
                    }, 3000);

                    unlockAchievement(true);
                    resetSequence();

                    setTimeout(() => {
                        this.classList.remove('portrait-spinning');
                    }, 4000);
                } else {
                    // Already discovered, do the same toggle with spinning
                    this.classList.add('portrait-spinning');

                    // Play success sound (subsequent - react02)
                    if (window.soundManager) {
                        window.soundManager.playReactSuccess(false);
                    }

                    // Change portrait 3 seconds in (1 second before animation ends)
                    setTimeout(() => {
                        const portraitImg = document.querySelector('.portrait-image');
                        if (portraitImg) {
                            // Toggle between original and funny
                            const currentSrc = portraitImg.src;
                            if (currentSrc.includes('funnysmiling.PNG')) {
                                portraitImg.src = 'Assets/Hugues/roundvignette.jpg';
                                localStorage.setItem('portraitState', 'original');
                            } else {
                                portraitImg.src = 'Assets/Hugues/funnysmiling.PNG';
                                localStorage.setItem('portraitState', 'funny');
                            }
                        }
                    }, 3000);

                    unlockAchievement(false);
                    resetSequence();

                    setTimeout(() => {
                        this.classList.remove('portrait-spinning');
                    }, 4000);
                }
            } else if (secretSequence.length > 0) {
                // FAILED - show fail animation
                showFailAnimation();
                resetSequence();

                // Still do a small shake on portrait
                this.style.animation = 'shake 0.5s';
                setTimeout(() => this.style.animation = '', 500);
            } else {
                // No sequence attempted - show fail animation and give hint with color reversal
                showFailAnimation();

                const ageStat = Array.from(stats).find(stat =>
                    stat.querySelector('.stat-label').getAttribute('data-i18n') === 'age'
                );

                if (ageStat) {
                    // Add strong hint with color reversal (2 second animation)
                    ageStat.classList.add('stat-hint-click');
                    setTimeout(() => {
                        ageStat.classList.remove('stat-hint-click');
                    }, 2000);
                }

                // Portrait shakes as feedback
                this.style.animation = 'shake 0.5s';
                setTimeout(() => this.style.animation = '', 500);
            }
        });
    }

    // Tab switching function (can be called programmatically)
    async function switchTab(targetTab) {
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

    // Make switchTab globally available
    window.switchTab = switchTab;

    // Tab switching functionality with dynamic loading
    const tabButtons = document.querySelectorAll('.tab-button, .workshop-seal-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Special handling for workshop seal button press-and-hold
    const workshopSealButton = document.querySelector('.workshop-seal-button');
    const workshopTab = document.getElementById('workshop');
    let activeWorkshopTab = null; // Will hold the current workshop tab reference after loading
    let skipWorkshopAnimation = false; // Flag to skip default animation after progressive reveal

    // Get the pull sound duration to sync animation
    let pullSoundDuration = 2.0; // Default
    if (window.soundManager) {
        // Wait a moment for audio to load, then get duration
        setTimeout(() => {
            pullSoundDuration = window.soundManager.getPullDuration();
        }, 500);
    }

    // Create and add the pulsating glow element
    if (workshopSealButton) {
        const glowElement = document.createElement('div');
        glowElement.className = 'workshop-glow';
        workshopSealButton.appendChild(glowElement);
    }

    let pressTimer = null;
    let pressStartTime = 0;
    let rotationInterval = null;
    let currentRotation = 0;
    let rotationSpeed = 0;
    let finalRotation = 0; // Store the final rotation when button is released

    async function startPress(e) {
        e.preventDefault();
        e.stopPropagation();

        // Don't allow pressing if already on workshop tab
        if (workshopSealButton.classList.contains('on-workshop-tab')) {
            return;
        }

        pressStartTime = Date.now();
        currentRotation = 0;
        rotationSpeed = 0;

        // Disable transition during rotation
        workshopSealButton.style.transition = 'none';

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

            // Get the parent container and add perspective
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
            activeWorkshopTab.style.pointerEvents = 'none'; // Disable interactions during preview
            activeWorkshopTab.style.animation = 'none'; // Disable automatic animation
            activeWorkshopTab.style.position = 'absolute';
            activeWorkshopTab.style.top = '0';
            activeWorkshopTab.style.left = '0';
            activeWorkshopTab.style.width = '100%';
            activeWorkshopTab.style.zIndex = '10';
            activeWorkshopTab.style.transformStyle = 'preserve-3d'; // Ensure 3D transforms are preserved
            activeWorkshopTab.style.minHeight = '500px'; // Ensure it has some height

            // Apply workshop burgundy background with patterns to the tab itself (matching character-header)
            // Add a solid base layer to ensure full opacity
            activeWorkshopTab.style.background = `
                radial-gradient(circle at 20% 20%, rgba(100, 48, 48, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(100, 48, 48, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, var(--red-theme-alpha) 0%, var(--red-theme) 50%)
            `;
            activeWorkshopTab.style.backgroundColor = 'var(--parchment-light)'; // Solid fallback matching sheet-content
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

            // Ensure all content inside has proper z-index to appear above the overlay
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
            activeWorkshopTab.style.opacity = '1'; // Keep full opacity throughout
            activeWorkshopTab.style.backfaceVisibility = 'hidden';

            // Expand the parent containers to fit the workshop tab's height
            const workshopHeight = activeWorkshopTab.offsetHeight;
            if (sheetContent && workshopHeight > 0) {
                sheetContent.style.minHeight = workshopHeight + 'px';
            }
            if (characterSheet && workshopHeight > 0) {
                characterSheet.style.minHeight = (workshopHeight + 64) + 'px'; // +64 for padding
            }
        }

        // Start rotation animation using requestAnimationFrame for smoother performance
        function animate() {
            const pressDuration = (Date.now() - pressStartTime) / 1000; // in seconds

            // Accelerating rotation: starts fast and accelerates dramatically
            // Base speed + exponential acceleration
            const baseSpeed = 200; // Start at 200 deg/s immediately
            const acceleration = Math.pow(pressDuration + 0.5, 2.5) * 300; // Steep curve
            rotationSpeed = Math.min(baseSpeed + acceleration, 3000); // Max 3000 deg/s

            // Increment rotation
            currentRotation += rotationSpeed / 60; // 60 fps

            // Apply transform
            workshopSealButton.style.transform = `rotate(${currentRotation}deg)`;

            // Update pulse effect based on press duration
            const pulseSpeed = Math.max(0.2, 1 - (pressDuration * 0.3)); // Faster as you hold (min 0.2s)
            const pulseScale = Math.min(1.5 + (pressDuration * 0.5), 3); // Larger as you hold (max 3x)
            const pulseOpacity = Math.min(0.6 + (pressDuration * 0.1), 0.9); // Brighter as you hold

            workshopSealButton.style.setProperty('--pulse-speed', `${pulseSpeed}s`);
            workshopSealButton.style.setProperty('--pulse-scale', pulseScale);
            workshopSealButton.style.setProperty('--pulse-opacity', pulseOpacity);

            // Update glow pulsation speed (faster as you hold)
            const glowSpeed = Math.max(0.3, 2 - (pressDuration * 0.8)); // Starts at 2s, goes down to 0.3s
            workshopSealButton.style.setProperty('--glow-speed', `${glowSpeed}s`);

            // Progressive reveal of workshop tab (sync with pull sound duration)
            if (activeWorkshopTab && activeWorkshopTab.parentElement) {
                // Progress from 0 to 1 over the pull sound duration
                const revealProgress = Math.min(pressDuration / pullSoundDuration, 1);

                // Transform from -70deg to 0deg (swing-in animation)
                const rotateX = -70 + (70 * revealProgress);

                activeWorkshopTab.style.transform = `rotateX(${rotateX}deg)`;
                activeWorkshopTab.style.transformOrigin = 'top';
                // Opacity stays at 1.0 throughout
            }

            // Continue animation
            if (pressStartTime > 0) {
                rotationInterval = requestAnimationFrame(animate);
            }
        }

        rotationInterval = requestAnimationFrame(animate);
    }

    async function endPress(e) {
        e.preventDefault();
        e.stopPropagation();

        // Remove pressing class
        workshopSealButton.classList.remove('pressing');

        // Stop animation loop
        if (rotationInterval) {
            cancelAnimationFrame(rotationInterval);
        }

        const pressDuration = (Date.now() - pressStartTime) / 1000;
        const revealProgress = Math.min(pressDuration / pullSoundDuration, 1);

        // Check if animation is complete enough (at least 80% revealed)
        if (revealProgress < 0.8) {
            // Stop pull sound and play in reverse from the stopped position
            let pullStoppedAt = 0;
            if (window.soundManager) {
                pullStoppedAt = window.soundManager.stopPull(true); // Stop immediately
                if (pullStoppedAt > 0) {
                    window.soundManager.playPullReverse(pullStoppedAt);
                }
            }

            // Reset button with spring-back
            workshopSealButton.style.transition = 'transform 0.3s ease';
            workshopSealButton.style.transform = 'scale(1) rotate(0deg)';
            workshopSealButton.style.setProperty('--glow-speed', '2s'); // Reset glow speed

            // Reverse the workshop tab animation
            if (activeWorkshopTab && !activeWorkshopTab.classList.contains('active')) {
                activeWorkshopTab.style.transition = 'transform 0.3s ease';
                activeWorkshopTab.style.transform = 'rotateX(-70deg)';

                // Restore other tabs
                const allTabs = document.querySelectorAll('.tab-content');
                allTabs.forEach(tab => {
                    if (tab !== activeWorkshopTab && tab.classList.contains('active')) {
                        tab.style.opacity = '';
                        tab.style.pointerEvents = '';
                    }
                });

                // Restore sheet-content perspective and heights
                const sheetContent = document.querySelector('.sheet-content');
                const characterSheet = document.querySelector('.character-sheet');
                if (sheetContent) {
                    sheetContent.style.perspective = '';
                    sheetContent.style.perspectiveOrigin = '';
                    sheetContent.style.minHeight = '';
                }
                if (characterSheet) {
                    characterSheet.style.minHeight = '';
                }

                // Remove the workshop preview overlay
                const cancelOverlay = document.getElementById('workshop-preview-overlay');
                if (cancelOverlay) {
                    cancelOverlay.remove();
                }

                // Hide it completely after reverse animation
                setTimeout(() => {
                    if (activeWorkshopTab && !activeWorkshopTab.classList.contains('active')) {
                        activeWorkshopTab.style.display = 'none';
                        activeWorkshopTab.style.transform = '';
                        activeWorkshopTab.style.transition = '';
                        activeWorkshopTab.style.transformOrigin = '';
                        activeWorkshopTab.style.pointerEvents = '';
                        activeWorkshopTab.style.position = '';
                        activeWorkshopTab.style.top = '';
                        activeWorkshopTab.style.left = '';
                        activeWorkshopTab.style.width = '';
                        activeWorkshopTab.style.zIndex = '';
                        activeWorkshopTab.style.backfaceVisibility = '';
                        activeWorkshopTab.style.transformStyle = '';
                        activeWorkshopTab.style.minHeight = '';
                        activeWorkshopTab.style.background = '';
                        activeWorkshopTab.style.backgroundColor = '';
                        activeWorkshopTab.style.boxShadow = '';

                        // Reset content children
                        const contentChildren = activeWorkshopTab.children;
                        for (let i = 0; i < contentChildren.length; i++) {
                            contentChildren[i].style.position = '';
                            contentChildren[i].style.zIndex = '';
                        }
                    }
                }, 300);
            }

            pressStartTime = 0;
            rotationSpeed = 0;
            currentRotation = 0;
            return;
        }

        // Stop pull sound and play release sound (animation was completed)
        if (window.soundManager) {
            window.soundManager.stopPull(true);
            window.soundManager.playRelease();
        }

        // Store the final rotation for puff-out animation
        finalRotation = currentRotation % 360; // Normalize to 0-360

        // Skip the launch animation - go directly to puff-out
        // Just reset the button transform smoothly
        workshopSealButton.style.transition = 'transform 0.2s ease-out';
        workshopSealButton.style.transform = `rotate(${finalRotation}deg)`; // Just preserve rotation, no scale

        // Complete the tab reveal animation smoothly
        if (activeWorkshopTab) {
            const remainingProgress = 1 - revealProgress;
            const completionDuration = remainingProgress * 300; // Complete animation in remaining time (max 300ms)

            activeWorkshopTab.style.transition = `transform ${completionDuration}ms ease-out`;
            activeWorkshopTab.style.transform = 'rotateX(0deg)';
            activeWorkshopTab.style.pointerEvents = 'auto'; // Re-enable interactions
        }

        // Trigger tab switch immediately (no delay needed since we skipped launch animation)
        // Reset button rotation
        workshopSealButton.style.transition = 'transform 0.2s ease-out';
        workshopSealButton.style.transform = 'rotate(0deg)';
        workshopSealButton.style.setProperty('--glow-speed', '2s'); // Reset glow speed

        // Set flag to skip the default tab animation since we already animated it
        skipWorkshopAnimation = true;

        // Override the CSS animation by setting animation to none with !important priority
        if (activeWorkshopTab) {
            activeWorkshopTab.style.setProperty('animation', 'none', 'important');
        }

        // Prevent the workshop seal button puff animation from triggering automatically
        // (We'll trigger it manually in switchTab)

        // Switch to workshop tab (this will properly set active classes and trigger puff-out)
        const targetTab = workshopSealButton.getAttribute('data-tab');
        await switchTab(targetTab);

        // Immediately clean up preview styles but keep the tab in its final position
        if (activeWorkshopTab) {
            activeWorkshopTab.style.transition = 'none'; // Disable transitions during cleanup
            activeWorkshopTab.style.transformOrigin = '';
            activeWorkshopTab.style.position = '';
            activeWorkshopTab.style.top = '';
            activeWorkshopTab.style.left = '';
            activeWorkshopTab.style.width = '';
            activeWorkshopTab.style.zIndex = '';
            activeWorkshopTab.style.backfaceVisibility = '';
            activeWorkshopTab.style.transformStyle = '';
            activeWorkshopTab.style.minHeight = '';
            activeWorkshopTab.style.background = '';
            activeWorkshopTab.style.backgroundColor = '';
            activeWorkshopTab.style.boxShadow = '';

            // After a frame, clean up remaining styles but KEEP animation: none
            requestAnimationFrame(() => {
                if (activeWorkshopTab) {
                    activeWorkshopTab.style.transform = '';
                    activeWorkshopTab.style.transformOrigin = '';
                    activeWorkshopTab.style.backfaceVisibility = '';
                    activeWorkshopTab.style.transition = '';
                    activeWorkshopTab.style.opacity = '';
                }
            });
        }

        // Remove the workshop preview overlay and cleanup
        const overlay = document.getElementById('workshop-preview-overlay');
        if (overlay) {
            overlay.remove();
        }

        // Restore other tabs
        const allTabs = document.querySelectorAll('.tab-content');
        allTabs.forEach(tab => {
            if (tab !== activeWorkshopTab) {
                tab.style.opacity = '';
                tab.style.pointerEvents = '';
            }
        });

        // Restore sheet-content perspective and heights
        const sheetContent = document.querySelector('.sheet-content');
        const characterSheet = document.querySelector('.character-sheet');
        if (sheetContent) {
            sheetContent.style.perspective = '';
            sheetContent.style.perspectiveOrigin = '';
            sheetContent.style.minHeight = '';
        }
        if (characterSheet) {
            characterSheet.style.minHeight = '';
        }

        // Reset content children styles and cleanup workshop tab
        if (activeWorkshopTab) {
            const contentChildren = activeWorkshopTab.children;
            for (let i = 0; i < contentChildren.length; i++) {
                contentChildren[i].style.position = '';
                contentChildren[i].style.zIndex = '';
            }
        }

        pressStartTime = 0;
        rotationSpeed = 0;
        rotationInterval = null;
    }

    function cancelPress() {
        // Remove pressing class
        workshopSealButton.classList.remove('pressing');

        // Stop animation loop
        if (rotationInterval) {
            cancelAnimationFrame(rotationInterval);
            rotationInterval = null;
        }

        // Stop pull sound and play in reverse (cancelled)
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
            workshopSealButton.style.setProperty('--glow-speed', '2s'); // Reset glow speed
        }

        // Hide the workshop tab preview with reverse animation
        if (activeWorkshopTab && !activeWorkshopTab.classList.contains('active')) {
            activeWorkshopTab.style.transition = 'transform 0.3s ease';
            activeWorkshopTab.style.transform = 'rotateX(-70deg)';

            // Restore other tabs
            const allTabs = document.querySelectorAll('.tab-content');
            allTabs.forEach(tab => {
                if (tab !== activeWorkshopTab && tab.classList.contains('active')) {
                    tab.style.opacity = '';
                    tab.style.pointerEvents = '';
                }
            });

            // Restore sheet-content perspective and heights
            const sheetContent = document.querySelector('.sheet-content');
            const characterSheet = document.querySelector('.character-sheet');
            if (sheetContent) {
                sheetContent.style.perspective = '';
                sheetContent.style.perspectiveOrigin = '';
                sheetContent.style.minHeight = '';
            }
            if (characterSheet) {
                characterSheet.style.minHeight = '';
            }

            // Remove the workshop preview overlay and reset content children styles
            const cancelOverlay = document.getElementById('workshop-preview-overlay');
            if (cancelOverlay) {
                cancelOverlay.remove();
            }
            if (activeWorkshopTab) {
                const contentChildren = activeWorkshopTab.children;
                for (let i = 0; i < contentChildren.length; i++) {
                    contentChildren[i].style.position = '';
                    contentChildren[i].style.zIndex = '';
                }
            }

            // Hide it completely after animation
            setTimeout(() => {
                if (activeWorkshopTab && !activeWorkshopTab.classList.contains('active')) {
                    activeWorkshopTab.style.display = 'none';
                    activeWorkshopTab.style.transform = '';
                    activeWorkshopTab.style.opacity = '';
                    activeWorkshopTab.style.transition = '';
                    activeWorkshopTab.style.transformOrigin = '';
                    activeWorkshopTab.style.pointerEvents = '';
                    activeWorkshopTab.style.position = '';
                    activeWorkshopTab.style.top = '';
                    activeWorkshopTab.style.left = '';
                    activeWorkshopTab.style.width = '';
                    activeWorkshopTab.style.zIndex = '';
                    activeWorkshopTab.style.backfaceVisibility = '';
                    activeWorkshopTab.style.transformStyle = '';
                    activeWorkshopTab.style.minHeight = '';
                    activeWorkshopTab.style.background = '';
                    activeWorkshopTab.style.backgroundColor = '';
                    activeWorkshopTab.style.boxShadow = '';
                }
            }, 300);
        }

        pressStartTime = 0;
        rotationSpeed = 0;
        currentRotation = 0;
    }

    if (workshopSealButton) {
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

    tabButtons.forEach(button => {
        // Skip workshop seal button as it has custom handling
        if (button.classList.contains('workshop-seal-button')) return;

        button.addEventListener('click', async function() {
            const targetTab = this.getAttribute('data-tab');

            // Play random page sound for any tab except workshop
            if (targetTab !== 'workshop' && window.soundManager) {
                window.soundManager.playRandomPageSound();
            }

            // Konami Tab Code Tracking
            tabSequence.push(targetTab);
            if (tabSequence.length > konamiTabCode.length) {
                tabSequence.shift(); // Keep only last 7 tabs
            }

            // Check if Konami code matched
            if (tabSequence.join(',') === konamiTabCode.join(',') && !konamiUnlocked) {
                konamiUnlocked = true;
                unlockKonamiSecret();
            }

            // Use the switchTab function
            await switchTab(targetTab);
        });
    });

    // Parallax effect for background - DISABLED (was causing scroll issues)
    // window.addEventListener('scroll', function() {
    //     const scrolled = window.pageYOffset;
    //     const parallax = document.querySelector('.character-sheet');
    //     const speed = scrolled * 0.5;
    //
    //     if (parallax) {
    //         parallax.style.transform = `translateY(${speed}px)`;
    //     }
    // });

    // Hover effects for cards
    const cards = document.querySelectorAll('.highlight-card, .project-card, .work-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Typing effect for character name (secure version)
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }

        type();
    }

    // Initialize typing effect on load
    const characterName = document.querySelector('.character-name');
    if (characterName) {
        const originalText = characterName.textContent;
        setTimeout(() => {
            typeWriter(characterName, originalText, 80);
        }, 1000);
    }

    // Portrait stays static - no floating animation

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

    // Add ripple effect to buttons
    function createRipple(event) {
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

    // Add ripple effect to tab buttons (exclude workshop seal button)
    tabButtons.forEach(button => {
        if (!button.classList.contains('workshop-seal-button')) {
            button.addEventListener('click', createRipple);
        }
    });

    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
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
    document.head.appendChild(style);

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

    // Add particle effect background
    function createParticles() {
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

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        const activeTab = document.querySelector('.tab-button.active');
        const activeIndex = Array.from(tabButtons).indexOf(activeTab);

        if (e.key === 'ArrowLeft' && activeIndex > 0) {
            tabButtons[activeIndex - 1].click();
        } else if (e.key === 'ArrowRight' && activeIndex < tabButtons.length - 1) {
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

    // Modal functionality
    window.openFullVideo = function(videoType) {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        const videoSources = {
            'clicker': {
                title: 'Knowledge-based Incremental Clicker',
                src: 'Portfolio/Game Development (Design, Worldbuilding, Graphic)/2) GameJams & Prototypes/2023 - WIP Knowledge-based Incremental Clicker project.mp4'
            },
            'goap': {
                title: 'Multi-stepped GOAP-Utility AI',
                src: 'Portfolio/Game Development (Design, Worldbuilding, Graphic)/2) GameJams & Prototypes/2023 - WIP Multi-stepped GOAP-Utility AI (too early).mp4'
            },
            'kalevipoeg': {
                title: 'KALEVIPOEG - 48H GameJam',
                src: 'Portfolio/Game Development (Design, Worldbuilding, Graphic)/2) GameJams & Prototypes/2025 - KALEVIPOEG - 48H; GameJam as Tech Lead, Generative Tower Defense Estonian Folklore.mp4'
            }
        };

        const video = videoSources[videoType];
        if (video) {
            modalTitle.textContent = video.title;

            // Create video element safely
            const videoElement = document.createElement('video');
            videoElement.className = 'modal-video';
            videoElement.controls = true;
            videoElement.autoplay = true;

            const source = document.createElement('source');
            source.src = video.src;
            source.type = 'video/mp4';

            videoElement.appendChild(source);
            videoElement.appendChild(document.createTextNode('Your browser does not support the video tag.'));

            modalBody.innerHTML = '';
            modalBody.appendChild(videoElement);

            modal.style.display = 'flex';
            modal.style.animation = 'fadeIn 0.3s ease-in-out';
        }
    }

    window.openFullPDF = function(pdfType) {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        const pdfSources = {
            'biocracy': {
                title: 'BIOCRACY - A Nietzschean Alignment',
                src: 'Portfolio/Academia (Foresight, Ethics & Serious Games)/2025 - MASTER - BIOCRACY - A Nietzschean Alignment; From Artificial Intelligence to Accelerated Independence - H.W.B.dePingon.pdf'
            },
            'morality': {
                title: 'Evaluation of Morality as a factor of Creativity',
                src: 'Portfolio/Academia (Foresight, Ethics & Serious Games)/2021 - MASTER - Evaluation of Morality as a factor of Creativity in Futures Studies - Hugues W. B. de Pingon.pdf'
            },
            'archolectics': {
                title: 'Archolectics - Thesis Proposal',
                src: 'Portfolio/Academia (Foresight, Ethics & Serious Games)/PhD Research Proposals/2021 - H.W.B. dePingon - Archolectics - Thesis Proposal - EN.pdf'
            },
            'economie': {
                title: 'Economie Ecologique Evolutive',
                src: 'Portfolio/Academia (Foresight, Ethics & Serious Games)/PhD Research Proposals/2022 - H.W.B. de Pingon - Economie Ecologique Evolutive - Projet de recherche - FR.pdf'
            },
            'unesco': {
                title: 'UNESCO - Moral Conflicts in Future-Oriented Activities',
                src: 'Portfolio/Academia (Foresight, Ethics & Serious Games)/2023 - UNESCO - The Intrinsic Moral Conflicts, Hindrances & Benefits to Creativity in Future-Oriented Activities (FOA) - HWB de Pingon.pdf'
            },
            'ateliers': {
                title: 'Les Ateliers de Jeux de role Pratiques',
                src: 'Portfolio/Academia (Foresight, Ethics & Serious Games)/2023 - ARTICLE - Les Ateliers de Jeux de rôle Pratiques aujourd\'hui.pdf'
            },
            'ttrpg': {
                title: 'The Discording Tales - TTRPG (300 pages)',
                src: 'Portfolio/Game Development (Design, Worldbuilding, Graphic)/TTRPG - 300p - Des Récits Discordants (FR - The Discording Tales).pdf'
            }
        };

        const pdf = pdfSources[pdfType];
        if (pdf) {
            modalTitle.textContent = pdf.title;

            // Create iframe element safely
            const iframe = document.createElement('iframe');
            iframe.className = 'modal-pdf';
            iframe.src = pdf.src + '#toolbar=1&navpanes=1&scrollbar=1';
            iframe.frameBorder = '0';

            modalBody.innerHTML = '';
            modalBody.appendChild(iframe);

            modal.style.display = 'flex';
            modal.style.animation = 'fadeIn 0.3s ease-in-out';
        }
    }

    window.openImageGallery = function(galleryType) {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        const galleries = {
            'worldmaps': {
                title: 'Worldmaps & Cartography - The Discording Tales',
                images: [
                    { src: 'Assets/Worldmaps/2021 - WorldMap.jpg', caption: 'Award-Winning Worldmap (Shadyversity 2020 Tourney Winner)' },
                    { src: 'Assets/Worldmaps/2021 - GeocosmosENG_empty.jpg', caption: 'Geocosmos - Cosmological Map of the Universe' }
                ]
            },
            'characters': {
                title: 'Character Design - The Discording Tales',
                images: [
                    { src: 'Assets/Character Design/Aristese.jpg', caption: 'Aristese - Character Portrait' },
                    { src: 'Assets/Character Design/Ylf.jpg', caption: 'Ylf - Character Portrait' },
                    { src: 'Assets/Character Design/Meridians.jpg', caption: 'Meridians - Character Portrait' }
                ]
            },
            'creatures': {
                title: 'Creature Design - The Discording Tales',
                images: [
                    { src: 'Assets/Creature Design/iguana-shrimp-macaque.png', caption: 'Iguana-Shrimp-Macaque Hybrid' },
                    { src: 'Assets/Creature Design/hedgehog-pufferfish-siphonophore.png', caption: 'Hedgehog-Pufferfish-Siphonophore' },
                    { src: 'Assets/Creature Design/beetle-squirrel-siphonophore.png', caption: 'Beetle-Squirrel-Siphonophore' },
                    { src: 'Assets/Creature Design/slug-wasp-mole.jpg', caption: 'Slug-Wasp-Mole Creature' },
                    { src: 'Assets/Creature Design/sloth-wale-caterpillar.jpg', caption: 'Sloth-Whale-Caterpillar' },
                    { src: 'Assets/Creature Design/honeypotant-lemur.jpg', caption: 'Honeypot Ant-Lemur Hybrid' },
                    { src: 'Assets/Creature Design/cat-jellyfish.png', caption: 'Cat-Jellyfish Creature' },
                    { src: 'Assets/Creature Design/silkworm-mole-feasant.png', caption: 'Silkworm-Mole-Pheasant' }
                ]
            },
            'commissions': {
                title: 'Client Commissions - Professional Work',
                images: [
                    { src: 'Assets/Commissions/BookCover 2021.jpg', caption: 'Book Cover Design (2021)' },
                    { src: 'Assets/Commissions/2020 - ArtPoster.jpg', caption: 'Art Poster Design (2020)' },
                    { src: 'Assets/Commissions/2016 - Forthright Forum Poster A2 - Copy.jpg', caption: 'Forum Poster A2 (2016)' },
                    { src: 'Assets/Commissions/2024 - URsymbol.png', caption: 'UR Symbol Branding (2024)' }
                ],
                videos: [
                    { src: 'Assets/Commissions/2018 - CharacterSheet animation.mp4', caption: 'Character Sheet Animation (2018)' }
                ]
            }
        };

        const gallery = galleries[galleryType];
        if (gallery) {
            modalTitle.textContent = gallery.title;

            // Create gallery container
            const galleryContainer = document.createElement('div');
            galleryContainer.className = 'image-gallery';
            galleryContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; padding: 20px; max-height: 70vh; overflow-y: auto;';

            // Add images
            if (gallery.images) {
                gallery.images.forEach(item => {
                    const imgWrapper = document.createElement('div');
                    imgWrapper.style.cssText = 'text-align: center;';

                    const img = document.createElement('img');
                    img.src = item.src;
                    img.alt = item.caption;
                    img.style.cssText = 'width: 100%; height: auto; border-radius: 8px; cursor: pointer; transition: transform 0.3s;';
                    img.onmouseover = () => img.style.transform = 'scale(1.05)';
                    img.onmouseout = () => img.style.transform = 'scale(1)';
                    img.onclick = () => window.open(item.src, '_blank');

                    const caption = document.createElement('p');
                    caption.textContent = item.caption;
                    caption.style.cssText = 'margin-top: 10px; font-size: 14px; color: #8B7355;';

                    imgWrapper.appendChild(img);
                    imgWrapper.appendChild(caption);
                    galleryContainer.appendChild(imgWrapper);
                });
            }

            // Add videos if present
            if (gallery.videos) {
                gallery.videos.forEach(item => {
                    const videoWrapper = document.createElement('div');
                    videoWrapper.style.cssText = 'text-align: center;';

                    const video = document.createElement('video');
                    video.src = item.src;
                    video.controls = true;
                    video.style.cssText = 'width: 100%; height: auto; border-radius: 8px;';

                    const caption = document.createElement('p');
                    caption.textContent = item.caption;
                    caption.style.cssText = 'margin-top: 10px; font-size: 14px; color: #8B7355;';

                    videoWrapper.appendChild(video);
                    videoWrapper.appendChild(caption);
                    galleryContainer.appendChild(videoWrapper);
                });
            }

            modalBody.innerHTML = '';
            modalBody.appendChild(galleryContainer);

            modal.style.display = 'flex';
            modal.style.animation = 'fadeIn 0.3s ease-in-out';
        }
    }

    window.closeModal = function() {
        const modal = document.getElementById('modal-overlay');
        modal.style.animation = 'fadeOut 0.3s ease-in-out';
                setTimeout(() => {
            modal.style.display = 'none';
            // Clear the content
            document.getElementById('modal-body').innerHTML = '';
        }, 300);
    }

    // Close modal when clicking outside
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // Close modal with Escape key
document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Toggle Experience Card expansion
    window.toggleExpCard = function(card) {
        card.classList.toggle('expanded');

        // Check if card is now expanded and has a video
        const video = card.querySelector('video');
        if (video) {
            if (card.classList.contains('expanded')) {
                // Card is expanding - play the video
                video.play().catch(() => {});
            } else {
                // Card is collapsing - pause and reset the video
                video.pause();
                video.currentTime = 0;
            }
        }
    };


    // Portfolio navigation will be initialized when the portfolio section is loaded

    // Skills Category Filtering - Function for reinitialization

    // Skills navigation will be initialized when the skills section is loaded

    // Animate skill bars on initial load
                    setTimeout(() => {
        const visibleSkillFills = document.querySelectorAll('.skill-section:not([style*="display: none"]) .skill-fill');
        visibleSkillFills.forEach(fill => {
            const width = fill.getAttribute('data-width');
            fill.style.width = width + '%';
        });
    }, 500);

    // Education navigation will be initialized when the education section is loaded

    // Video Hover-to-Play Functionality
    initializeVideoHoverPlay();

    // Alpine Education Card Video Hover-to-Play
    initializeAlpineEducationVideo();

    // Initialize flip sounds for cards (about section loads immediately)
    setTimeout(() => {
        initializeFlipSounds();
    }, 300);
});

function initializeEducationNavigation() {
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

function initializeVideoHoverPlay() {
    // Find all project cards (the entire box including title, description, etc.)
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const video = card.querySelector('video');

        if (video) {
            // Play video when hovering over the entire card
            card.addEventListener('mouseenter', function() {
                video.play().catch(() => {
                    // Handle autoplay restrictions gracefully
                });
            });

            // Pause video when mouse leaves the entire card
            card.addEventListener('mouseleave', function() {
                video.pause();
            });
        }
    });
}

// Contact Method Switcher - Initialize function
function initializeContactMethods() {
    // Contact buttons use onclick in HTML, so just ensure everything is visible
    // Make sure form section is visible by default
    const formSection = document.getElementById('contact-form-section');
    if (formSection) {
        formSection.style.display = 'block';
    }
}

// Contact Form Navigation
let currentQuestion = 1;
const totalQuestions = 5;

function switchContactMethod(method) {
    // Update button states
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.method === method) {
            btn.classList.add('active');
        }
    });

    // Hide all sections
    document.querySelectorAll('.contact-method-content').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    document.getElementById(`contact-${method}-section`).style.display = 'block';
}

function nextQuestion() {
    const currentQ = document.querySelector(`.quest-question[data-question="${currentQuestion}"]`);
    const inputs = currentQ.querySelectorAll('input[required], textarea[required]');

    // Validate current question
    let isValid = true;
    inputs.forEach(input => {
        if (input.type === 'radio') {
            const radioGroup = currentQ.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) isValid = false;
        } else if (!input.value.trim()) {
            isValid = false;
        }
    });

    if (!isValid) {
        // Show validation feedback
        currentQ.style.animation = 'shake 0.3s';
        setTimeout(() => currentQ.style.animation = '', 300);
        return;
    }

    // Hide current question
    currentQ.classList.remove('active');

    // Show next question
    currentQuestion++;
    document.querySelector(`.quest-question[data-question="${currentQuestion}"]`).classList.add('active');

    // Update progress dots
    updateProgressDots();

    // Update navigation buttons
    document.getElementById('prev-btn').disabled = false;

    if (currentQuestion === totalQuestions) {
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('submit-btn').style.display = 'block';
    }
}

function previousQuestion() {
    // Hide current question
    document.querySelector(`.quest-question[data-question="${currentQuestion}"]`).classList.remove('active');

    // Show previous question
    currentQuestion--;
    document.querySelector(`.quest-question[data-question="${currentQuestion}"]`).classList.add('active');

    // Update progress dots
    updateProgressDots();

    // Update navigation buttons
    if (currentQuestion === 1) {
        document.getElementById('prev-btn').disabled = true;
    }

    document.getElementById('next-btn').style.display = 'block';
    document.getElementById('submit-btn').style.display = 'none';
}

function updateProgressDots() {
    const dots = document.querySelectorAll('.progress-dots .dot');
    dots.forEach((dot, index) => {
        if (index < currentQuestion) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('interactive-contact-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Collect form data
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // Create email body
            const emailBody = `
Purpose: ${data.purpose}
Interest Area: ${data.interest}
Timeline: ${data.timeline}
Name: ${data.name}
Email: ${data.email}
Organization: ${data.organization || 'N/A'}

Message:
${data.message}
            `.trim();

            // Create mailto link
            const subject = `Contact Quest: ${data.purpose} - ${data.interest}`;
            const mailtoLink = `mailto:hugues.ii.w.b.depingon@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

            // Open email client
            window.location.href = mailtoLink;

            // Show success message
            setTimeout(() => {
                document.querySelector('.contact-quest-form').style.display = 'none';
                document.querySelector('.contact-quest-intro').style.display = 'none';
                document.getElementById('form-success').style.display = 'block';
            }, 500);
        });
    }
});

function resetContactForm() {
    // Reset form
    document.getElementById('interactive-contact-form').reset();

    // Reset to first question
    document.querySelectorAll('.quest-question').forEach(q => q.classList.remove('active'));
    document.querySelector('.quest-question[data-question="1"]').classList.add('active');
    currentQuestion = 1;

    // Reset navigation
    document.getElementById('prev-btn').disabled = true;
    document.getElementById('next-btn').style.display = 'block';
    document.getElementById('submit-btn').style.display = 'none';
    updateProgressDots();

    // Show form again
    document.querySelector('.contact-quest-form').style.display = 'block';
    document.querySelector('.contact-quest-intro').style.display = 'block';
    document.getElementById('form-success').style.display = 'none';
}

// Add shake animation for validation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Full Image Modal Function
function openFullImage(imageSrc) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    // Clear modal body
    modalBody.innerHTML = '';

    // Create container safely
    const container = document.createElement('div');
    container.className = 'full-image-container';

    const img = document.createElement('img');
    img.className = 'full-image';
    img.src = imageSrc;
    img.style.cursor = 'pointer';
    img.title = 'Click to open in new tab for zooming';
    img.onclick = () => window.open(imageSrc, '_blank');

    const caption = document.createElement('p');
    caption.className = 'full-image-caption';

    // Check if this is an ASUM image
    if (imageSrc.includes('ASUM')) {
        if (imageSrc.includes('poster.png')) {
            modalTitle.textContent = 'ASUM Campaign Poster';
            img.alt = 'Full size campaign poster';
            caption.textContent = 'ASUM Presidential Campaign Poster - Spring 2018';
        } else {
            modalTitle.textContent = 'ASUM Presidential Campaign';
            img.alt = 'Full size campaign photo';
            caption.textContent = 'ASUM Presidential Campaign - Spring 2018';
        }
    } else if (imageSrc.includes('fullfashion')) {
        // Vilnius photo - no title
        modalTitle.style.display = 'none';
        img.alt = 'Full size photo';
        caption.textContent = '';
    } else {
        modalTitle.textContent = '';
        modalTitle.style.display = 'none';
        img.alt = 'Full size photo';
        caption.textContent = '';
    }

    // Reset title display for ASUM images
    if (imageSrc.includes('ASUM')) {
        modalTitle.style.display = 'block';
    }

    container.appendChild(img);
    container.appendChild(caption);
    modalBody.appendChild(container);

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Alpine Education Card Video Hover Functionality
function initializeAlpineEducationVideo() {
    const alpineCard = document.querySelector('.alpine-card');
    const alpineVideo = document.querySelector('.alpine-education-video');

    if (alpineCard && alpineVideo) {
        // Play video when hovering over the entire card
        alpineCard.addEventListener('mouseenter', function() {
            alpineVideo.play().catch(() => {});
        });

        // Pause video when mouse leaves the card
        alpineCard.addEventListener('mouseleave', function() {
            alpineVideo.pause();
        });
    }
}
