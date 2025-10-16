// Workshop Card Pattern Achievements
// Location: /home/hullivan/Hugues.W.B.dePingon/js/workshop-achievements.js

import { createParticle } from './animations.js';

// ==========================================
// CONSTANTS
// ==========================================

// Snake pattern sequence (the ONLY valid snake order)
const SNAKE_SEQUENCE = [
    '0-0', '1-0', '2-0',  // Column 0: top to bottom
    '2-1', '1-1', '0-1',  // Column 1: bottom to top
    '0-2', '1-2', '2-2',  // Column 2: top to bottom
    '2-3', '1-3', '0-3'   // Column 3: bottom to top
];

const SEQUENCE_TIMEOUT = 5000; // 5 seconds max between flips for snake pattern
const PATTERN_MEMORY_DURATION = 10000; // Remember last pattern for 10 seconds
const DISCOVERY_COOLDOWN_DURATION = 3000; // 3 seconds cooldown between discoveries

// ==========================================
// STATE TRACKING
// ==========================================

// Track achieved patterns to avoid duplicate achievements
const achievedPatterns = new Set();

// Track flip sequence
let flipSequence = [];
let lastFlipTime = 0;

// Track last matched pattern to prevent conflicts
let lastMatchedPattern = null;
let lastMatchTime = 0;

// Cooldown system to prevent multiple discoveries
let discoveryCooldown = false;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Check if a given sequence matches the snake pattern exactly
 * @param {Array} sequence - The sequence to check
 * @returns {boolean} - True if the sequence is exactly the snake pattern
 */
function isSnakeSequence(sequence) {
    if (sequence.length !== 12) {
        return false;
    }
    return SNAKE_SEQUENCE.every((pos, index) => sequence[index] === pos);
}

// ==========================================
// PATTERN DEFINITIONS
// ==========================================

const PATTERNS = {
    // SNAKE PATTERN - Must be checked FIRST
    snake: {
        name: 'Le Chemin du Serpent',
        description: 'Vous avez suivi le motif serpent parfaitement !',
        icon: 'fas fa-route',
        color: 'var(--green-theme)',
        check: (flippedCards, sequence) => {
            return isSnakeSequence(sequence);
        }
    },

    // H PATTERN
    h: {
        name: 'La Lettre H',
        description: 'Vous avez dessiné un "H" avec les cartes retournées !',
        icon: 'fas fa-h',
        color: 'var(--red-theme)',
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

    // O PATTERN
    o: {
        name: 'La Lettre O',
        description: 'Vous avez dessiné un "O" avec les cartes du périmètre !',
        icon: 'fas fa-o',
        color: 'var(--yellow-theme)',
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

    // HARMONY/ALL PATTERN - Must be checked LAST
    // CRITICAL: Only triggers if all cards are flipped AND it's NOT the snake pattern
    all: {
        name: 'Harmonie Parfaite',
        description: 'Toutes les 12 cartes retournées d\'un coup !',
        icon: 'fas fa-star',
        color: 'var(--gold)',
        check: (flippedCards, sequence) => {
            // REQUIREMENT 1: All 12 cards must be flipped
            if (flippedCards.size !== 12) {
                return false;
            }
            
            // REQUIREMENT 2: The sequence must NOT be the snake pattern
            // This is the CRITICAL check to prevent harmony from triggering on snake completion
            if (isSnakeSequence(sequence)) {
                return false;
            }
            
            // REQUIREMENT 3: Snake pattern must not have been recently completed
            const now = Date.now();
            if (lastMatchedPattern === 'snake' && (now - lastMatchTime) < PATTERN_MEMORY_DURATION) {
                return false;
            }
            
            return true;
        }
    }
};

// ==========================================
// PATTERN CHECKING
// ==========================================

function checkPatterns(gameElements) {
    // Skip if in cooldown period
    if (discoveryCooldown) {
        return;
    }

    // Get currently flipped cards (excluding auto-flipped)
    const flippedCards = new Set();
    gameElements.forEach(card => {
        if (card.classList.contains('flipped') && !card.classList.contains('auto-flipped')) {
            const row = card.dataset.row;
            const col = card.dataset.col;
            flippedCards.add(`${row}-${col}`);
        }
    });

    // CRITICAL: Check patterns in strict priority order
    // Snake MUST be checked before 'all' because snake completion also flips all 12 cards
    const patternOrder = ['snake', 'h', 'o', 'all'];

    for (const patternKey of patternOrder) {
        const pattern = PATTERNS[patternKey];
        if (!pattern) continue;

        // Skip if already achieved (for repeatable achievements, this check can be removed)
        if (achievedPatterns.has(patternKey)) {
            continue;
        }

        // Check the pattern
        let matched = false;
        
        if (patternKey === 'snake' || patternKey === 'all') {
            // Snake and harmony patterns need the sequence
            matched = pattern.check(flippedCards, flipSequence);
        } else {
            // H and O patterns only need flipped cards
            matched = pattern.check(flippedCards);
        }

        // If pattern matched, trigger achievement and stop checking
        if (matched) {
            // Track this pattern as last matched
            lastMatchedPattern = patternKey;
            lastMatchTime = Date.now();

            // Start cooldown to prevent multiple discoveries
            discoveryCooldown = true;
            setTimeout(() => {
                discoveryCooldown = false;
            }, DISCOVERY_COOLDOWN_DURATION);

            // Show the achievement
            showAchievement(pattern, patternKey);

            // Reset snake sequence after achieving snake pattern
            if (patternKey === 'snake') {
                flipSequence = [];
            }

            // CRITICAL: Only process ONE pattern per check
            return; // Exit immediately after finding a match
        }
    }
}

// ==========================================
// ACHIEVEMENT DISPLAY
// ==========================================

function showAchievement(pattern, patternKey) {
    // Create achievement notification in Designer's Code style
    const achievement = document.createElement('div');
    achievement.className = 'secret-achievement';
    achievement.innerHTML = `
        <div class="achievement-glow"></div>
        <i class="${pattern.icon}" style="color: ${pattern.color};"></i>
        <h3>Vous avez découvert un motif secret</h3>
    `;

    document.body.appendChild(achievement);

    // Play secret unlock sound based on pattern
    if (window.soundManager && window.soundManager.audioReady) {
        // Map pattern keys to secret sound numbers
        const secretSoundMap = {
            'h': 1,      // Secret1.wav for H pattern
            'o': 2,      // Secret2.wav for O pattern
            'snake': 3,  // Secret3.wav for Snake pattern
            'all': 4     // Secret4.wav for All/Harmony pattern
        };

        const secretNumber = secretSoundMap[patternKey];
        
        if (secretNumber) {
            try {
                window.soundManager.playSecretUnlock(secretNumber);
            } catch (error) {
                console.error('Error playing secret sound:', error);
            }
        }
    }

    // Create gold particles
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            createParticle();
        }, i * 30);
    }

    // Remove notification after 5 seconds
    setTimeout(() => {
        achievement.remove();
    }, 5000);
}

// ==========================================
// INITIALIZATION
// ==========================================

export function initializeWorkshopAchievements() {
    const gameElements = document.querySelectorAll('.game-element');

    if (gameElements.length !== 12) {
        return;
    }

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

            // Reset sequence if too much time passed since last flip
            if (now - lastFlipTime > SEQUENCE_TIMEOUT) {
                flipSequence = [];
            }

            // Add to sequence when card flips (and not already in sequence)
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

// ==========================================
// RESET FUNCTION
// ==========================================

// Reset achievements (for testing or when leaving workshop)
export function resetWorkshopAchievements() {
    achievedPatterns.clear();
    flipSequence = [];
    lastFlipTime = 0;
    lastMatchedPattern = null;
    lastMatchTime = 0;
    discoveryCooldown = false;
}
