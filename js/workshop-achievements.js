// Workshop Card Pattern Achievements
// Location: /home/hullivan/Hugues.W.B.dePingon/js/workshop-achievements.js

import { createRainbowParticle } from './animations.js';

// Track achieved patterns to avoid duplicate achievements
const achievedPatterns = new Set();

// Track flip sequence for snake pattern
let flipSequence = [];
let lastFlipTime = 0;
const SEQUENCE_TIMEOUT = 5000; // 5 seconds max between flips for snake pattern

// Pattern definitions
const PATTERNS = {
    all: {
        name: 'Perfect Harmony',
        description: 'All 12 cards flipped at once!',
        icon: '🌟',
        check: (flippedCards) => flippedCards.size === 12
    },

    h: {
        name: 'The Letter H',
        description: 'Drew an "H" with the flipped cards!',
        icon: '🅷',
        check: (flippedCards) => {
            // H pattern: cards 1,5,9,6,7,4,8,12 (any order)
            const hPositions = [
                '0-0',  // Card 1
                '1-0',  // Card 5
                '2-0',  // Card 9
                '1-1',  // Card 6
                '1-2',  // Card 7
                '0-3',  // Card 4
                '1-3',  // Card 8
                '2-3'   // Card 12
            ];
            return hPositions.every(pos => flippedCards.has(pos)) && flippedCards.size === 8;
        }
    },

    o: {
        name: 'The Letter O',
        description: 'Drew an "O" with the perimeter cards!',
        icon: '⭕',
        check: (flippedCards) => {
            // O pattern: all perimeter cards except middle 4
            const oPositions = [
                '0-0', '0-1', '0-2', '0-3',  // Top row
                '1-0', '1-3',                 // Middle sides (not 1-1, 1-2)
                '2-0', '2-1', '2-2', '2-3'   // Bottom row
            ];
            return oPositions.every(pos => flippedCards.has(pos)) &&
                   !flippedCards.has('1-1') && !flippedCards.has('1-2') &&
                   flippedCards.size === 10;
        }
    },

    snake: {
        name: 'The Snake Path',
        description: 'Followed the snake pattern perfectly!',
        icon: '🐍',
        check: (flippedCards, sequence) => {
            // Snake pattern order: col0 (top-down), col1 (bottom-up), col2 (top-down), col3 (bottom-up)
            const expectedSequence = [
                '0-0', '1-0', '2-0',  // Column 0: top to bottom
                '2-1', '1-1', '0-1',  // Column 1: bottom to top
                '0-2', '1-2', '2-2',  // Column 2: top to bottom
                '2-3', '1-3', '0-3'   // Column 3: bottom to top
            ];

            if (sequence.length !== 12) return false;

            return expectedSequence.every((pos, index) => sequence[index] === pos);
        }
    }
};

export function initializeWorkshopAchievements() {
    const gameElements = document.querySelectorAll('.game-element');

    if (gameElements.length !== 12) return;

    // Add mutation observer to track flipped state changes
    const observer = new MutationObserver(() => {
        checkPatterns(gameElements);
    });

    gameElements.forEach(card => {
        observer.observe(card, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Track flip sequence for snake pattern
        card.addEventListener('mouseenter', function() {
            const row = this.dataset.row;
            const col = this.dataset.col;
            const pos = `${row}-${col}`;
            const now = Date.now();

            // Reset sequence if too much time passed
            if (now - lastFlipTime > SEQUENCE_TIMEOUT) {
                flipSequence = [];
            }

            // Add to sequence when card flips (not already in sequence)
            setTimeout(() => {
                if (this.classList.contains('flipped') && !flipSequence.includes(pos)) {
                    flipSequence.push(pos);
                    lastFlipTime = now;
                    checkPatterns(gameElements);
                }
            }, 100);
        });
    });
}

function checkPatterns(gameElements) {
    // Get currently flipped cards (excluding auto-flipped)
    const flippedCards = new Set();
    gameElements.forEach(card => {
        if (card.classList.contains('flipped') && !card.classList.contains('auto-flipped')) {
            const row = card.dataset.row;
            const col = card.dataset.col;
            flippedCards.add(`${row}-${col}`);
        }
    });

    // Check each pattern
    for (const [patternKey, pattern] of Object.entries(PATTERNS)) {
        // Skip if already achieved
        if (achievedPatterns.has(patternKey)) continue;

        let matched = false;

        if (patternKey === 'snake') {
            matched = pattern.check(flippedCards, flipSequence);
        } else {
            matched = pattern.check(flippedCards);
        }

        if (matched) {
            achievedPatterns.add(patternKey);
            showAchievement(pattern, patternKey);

            // Reset snake sequence after achieving
            if (patternKey === 'snake') {
                flipSequence = [];
            }
        }
    }
}

function showAchievement(pattern, patternKey) {
    // Create achievement notification
    const achievement = document.createElement('div');
    achievement.className = 'workshop-achievement-notification';
    achievement.innerHTML = `
        <div class="achievement-icon">${pattern.icon}</div>
        <div class="achievement-content">
            <div class="achievement-title">🎉 Secret Achievement Unlocked!</div>
            <div class="achievement-name">${pattern.name}</div>
            <div class="achievement-desc">${pattern.description}</div>
        </div>
    `;

    document.body.appendChild(achievement);

    // Play secret unlock sound based on pattern
    if (window.soundManager) {
        // Map pattern keys to secret sound numbers
        const secretSoundMap = {
            'h': 1,      // Secret1.wav for H pattern
            'o': 2,      // Secret2.wav for O pattern
            'snake': 3,  // Secret3.wav for Snake pattern
            'all': 4     // Secret4.wav for All pattern
        };

        const secretNumber = secretSoundMap[patternKey];
        if (secretNumber) {
            window.soundManager.playSecretUnlock(secretNumber);
        }
    }

    // Create rainbow particles
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            createRainbowParticle(x, y);
        }, i * 30);
    }

    // Animate in
    requestAnimationFrame(() => {
        achievement.classList.add('show');
    });

    // Remove after 5 seconds
    setTimeout(() => {
        achievement.classList.remove('show');
        setTimeout(() => {
            achievement.remove();
        }, 500);
    }, 5000);
}

// Reset achievements (for testing or when leaving workshop)
export function resetWorkshopAchievements() {
    achievedPatterns.clear();
    flipSequence = [];
    lastFlipTime = 0;
}

