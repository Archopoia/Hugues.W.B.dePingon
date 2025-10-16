// Workshop Card Pattern Achievements
// Location: /home/hullivan/Hugues.W.B.dePingon/js/workshop-achievements.js

import { createParticle } from './animations.js';

// Track achieved patterns to avoid duplicate achievements
const achievedPatterns = new Set();

// Track flip sequence for snake pattern
let flipSequence = [];
let lastFlipTime = 0;
const SEQUENCE_TIMEOUT = 5000; // 5 seconds max between flips for snake pattern

// Track last matched pattern to prevent conflicts
let lastMatchedPattern = null;
let lastMatchTime = 0;
const PATTERN_MEMORY_DURATION = 10000; // Remember last pattern for 10 seconds

// Cooldown system to prevent multiple discoveries
let discoveryCooldown = false;
const DISCOVERY_COOLDOWN_DURATION = 3000; // 3 seconds cooldown

// Pattern definitions
const PATTERNS = {
    all: {
        name: 'Harmonie Parfaite',
        description: 'Toutes les 12 cartes retournées d\'un coup !',
        icon: 'fas fa-star',
        color: 'var(--gold)',
        check: (flippedCards, sequence) => {
            // Only match if all 12 cards are flipped
            if (flippedCards.size !== 12) {
                console.log('All pattern: not all cards flipped');
                return false;
            }

            // Check if the current sequence matches the snake pattern
            const snakeSequence = [
                '0-0', '1-0', '2-0',  // Column 0: top to bottom
                '2-1', '1-1', '0-1',  // Column 1: bottom to top
                '0-2', '1-2', '2-2',  // Column 2: top to bottom
                '2-3', '1-3', '0-3'   // Column 3: bottom to top
            ];

            const isSnakePattern = sequence.length === 12 &&
                                  snakeSequence.every((pos, index) => sequence[index] === pos);

            if (isSnakePattern) {
                console.log('All pattern blocked: current sequence is snake pattern');
                return false;
            }

            // Don't match if snake was recently completed (within memory duration)
            const now = Date.now();
            if (lastMatchedPattern === 'snake' && (now - lastMatchTime) < PATTERN_MEMORY_DURATION) {
                console.log('All pattern blocked: snake was recently completed');
                return false;
            }

            console.log('All pattern check: all cards flipped, not snake pattern, snake not recently completed');
            return true;
        }
    },

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

    snake: {
        name: 'Le Chemin du Serpent',
        description: 'Vous avez suivi le motif serpent parfaitement !',
        icon: 'fas fa-route',
        color: 'var(--green-theme)',
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
    // Skip if in cooldown period
    if (discoveryCooldown) {
        console.log('Pattern check skipped - cooldown active');
        return;
    }

    console.log('=== PATTERN CHECK START ===');
    console.log('Flip sequence:', flipSequence);
    console.log('Sequence length:', flipSequence.length);

    // Get currently flipped cards (excluding auto-flipped)
    const flippedCards = new Set();
    gameElements.forEach(card => {
        if (card.classList.contains('flipped') && !card.classList.contains('auto-flipped')) {
            const row = card.dataset.row;
            const col = card.dataset.col;
            flippedCards.add(`${row}-${col}`);
        }
    });

    console.log('Flipped cards:', Array.from(flippedCards));
    console.log('Flipped cards count:', flippedCards.size);

    // Check patterns in priority order: snake first, then others
    // Snake must be checked before 'all' because completing snake also satisfies 'all' condition
    const patternOrder = ['snake', 'h', 'o', 'all'];

    for (const patternKey of patternOrder) {
        const pattern = PATTERNS[patternKey];
        if (!pattern) continue;

        console.log(`\n--- Checking pattern: ${patternKey} ---`);

        // Skip if already achieved
        if (achievedPatterns.has(patternKey)) {
            console.log(`Skipping ${patternKey} - already achieved`);
            continue;
        }

        let matched = false;

        if (patternKey === 'snake' || patternKey === 'all') {
            matched = pattern.check(flippedCards, flipSequence);
            console.log(`${patternKey} pattern result: ${matched}`);
        } else {
            matched = pattern.check(flippedCards);
            console.log(`${patternKey} pattern result: ${matched}`);
        }

        if (matched) {
            console.log(`🎉 PATTERN MATCHED: ${patternKey}`);
            console.log('Starting cooldown...');

            // Track this pattern as last matched
            lastMatchedPattern = patternKey;
            lastMatchTime = Date.now();

            // Start cooldown immediately
            discoveryCooldown = true;
            setTimeout(() => {
                discoveryCooldown = false;
                console.log('Cooldown ended');
            }, DISCOVERY_COOLDOWN_DURATION);

            // Don't add to achievedPatterns to make it repeatable
            showAchievement(pattern, patternKey);

            // Reset snake sequence after achieving
            if (patternKey === 'snake') {
                console.log('Resetting snake sequence');
                flipSequence = [];
            }

            // Only process one pattern at a time
            console.log('=== PATTERN CHECK END (MATCH FOUND) ===');
            break;
        }
    }

    console.log('=== PATTERN CHECK END (NO MATCH) ===');
}

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
    console.log('Sound manager available:', !!window.soundManager);
    console.log('Sound manager audio ready:', window.soundManager?.audioReady);

    if (window.soundManager && window.soundManager.audioReady) {
        // Map pattern keys to secret sound numbers
        const secretSoundMap = {
            'h': 1,      // Secret1.wav for H pattern
            'o': 2,      // Secret2.wav for O pattern
            'snake': 3,  // Secret3.wav for Snake pattern
            'all': 4     // Secret4.wav for All pattern
        };

        const secretNumber = secretSoundMap[patternKey];
        console.log(`Playing sound for pattern ${patternKey}: Secret${secretNumber}.wav`);

        if (secretNumber) {
            try {
                window.soundManager.playSecretUnlock(secretNumber);
                console.log('Sound play command sent successfully');
            } catch (error) {
                console.error('Error playing secret sound:', error);
            }
        } else {
            console.log('No sound number found for pattern:', patternKey);
        }
    } else {
        console.log('Sound manager not available or not ready');
        console.log('Available:', !!window.soundManager);
        console.log('Ready:', window.soundManager?.audioReady);
    }

    // Create gold particles like Designer's Code
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            createParticle();
        }, i * 30);
    }

    // Remove after 5 seconds
    setTimeout(() => {
        achievement.remove();
    }, 5000);
}

// Reset achievements (for testing or when leaving workshop)
export function resetWorkshopAchievements() {
    achievedPatterns.clear();
    flipSequence = [];
    lastFlipTime = 0;
    lastMatchedPattern = null;
    lastMatchTime = 0;
    discoveryCooldown = false;
}

