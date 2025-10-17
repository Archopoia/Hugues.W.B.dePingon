// Medieval Character Sheet - Easter Eggs & Mini-Games
// Location: /home/hullivan/Hugues.W.B.dePingon/js/easter-eggs.js

import { createParticle, createRainbowParticle } from './animations.js';

// Mini-jeu caché : Quête du Code Secret avec Randomisation Quotidienne
let secretSequence = [];
let resetTimer = null;
let achievementUnlocked = false;
let lockedStats = [];

// Konami-style Tab Code Easter Egg
let tabSequence = [];
const konamiTabCode = ['about', 'education', 'portfolio', 'skills', 'portfolio', 'education', 'about']; // A-E-P-S-P-E-A
let konamiUnlocked = false;

// Generate daily sequence (always starts with 'age')
const today = new Date().getDay();
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
        title.textContent = getTranslation('achievement-secret-title');
        achievement.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.textContent = getTranslation('achievement-secret-subtitle');
        achievement.appendChild(subtitle);

        const text = document.createElement('p');
        text.className = 'achievement-subtext';
        text.textContent = getTranslation('achievement-secret-text');
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
        title.textContent = getTranslation('achievement-code-title');
        achievement.appendChild(title);

        const text = document.createElement('p');
        text.className = 'achievement-subtext';
        text.textContent = '';
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

function updatePortraitFeedback() {
    const portraitFrame = document.querySelector('.portrait-frame');
    if (!portraitFrame) return;

    const count = secretSequence.length;

    // Remove all previous vibration classes
    portraitFrame.classList.remove('portrait-vibrate-1', 'portrait-vibrate-2', 'portrait-vibrate-3', 'portrait-vibrate-4');

    if (count > 0 && count <= 4) {
        portraitFrame.classList.add(`portrait-vibrate-${count}`);
    }
}

// Helper function to get translation (fallback if i18n not available)
function getTranslation(key) {
    if (typeof window.getTranslation === 'function') {
        return window.getTranslation(key);
    }
    // Fallback translations
    const fallbacks = {
        'achievement-secret-title': '🏆 Secret Discoverer!',
        'achievement-secret-subtitle': '"The Hidden Code"',
        'achievement-secret-text': 'You\'ve unlocked the secret sequence!',
        'achievement-code-title': '✓ Code Mastered'
    };
    return fallbacks[key] || key;
}

export function initializeEasterEggs() {
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
                    if (portraitFrame) {
                        portraitFrame.classList.remove('portrait-vibrate-1', 'portrait-vibrate-2', 'portrait-vibrate-3', 'portrait-vibrate-4');
                    }
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
            portraitImage.src = 'Assets/Hugues/Hugues.W.B.dePingon - funnysmiling.PNG';
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
                                portraitImg.src = 'Assets/Hugues/Hugues.W.B.dePingon - roundvignette.jpg';
                                localStorage.setItem('portraitState', 'original');
                            } else {
                                portraitImg.src = 'Assets/Hugues/Hugues.W.B.dePingon - funnysmiling.PNG';
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
                                portraitImg.src = 'Assets/Hugues/Hugues.W.B.dePingon - roundvignette.jpg';
                                localStorage.setItem('portraitState', 'original');
                            } else {
                                portraitImg.src = 'Assets/Hugues/Hugues.W.B.dePingon - funnysmiling.PNG';
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
}

export function trackKonamiCode(targetTab) {
    tabSequence.push(targetTab);
    if (tabSequence.length > konamiTabCode.length) {
        tabSequence.shift(); // Keep only last 7 tabs
    }

    // Check if Konami code matched
    if (tabSequence.join(',') === konamiTabCode.join(',') && !konamiUnlocked) {
        konamiUnlocked = true;
        unlockKonamiSecret();
    }
}

