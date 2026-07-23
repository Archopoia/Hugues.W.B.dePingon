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
const konamiTabCode = ['about', 'education', 'portfolio', 'contact', 'portfolio', 'education', 'about']; // A-E-P-C-P-E-A
let konamiUnlocked = false;

// Fixed 2-step sequence for the header mini-game.
// Order: Role -> Origin (then click portrait to win)
const correctSequence = ['current-role', 'origin'];
const MAX_SECRET_STEPS = correctSequence.length;

function resetSequence() {
    secretSequence = [];
    // Remove locked highlights
    lockedStats.forEach(stat => {
        stat.classList.remove(
            'stat-locked',
            'stat-locked-step-1',
            'stat-locked-step-2',
            'stat-locked-step-3',
            'stat-locked-step-4'
        );
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

    if (count > 0 && count <= MAX_SECRET_STEPS) {
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
    // Portrait secret mini-game (Role -> Origin -> portrait) is disabled.
    // Konami tab sequence remains available via trackKonamiCode().
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

