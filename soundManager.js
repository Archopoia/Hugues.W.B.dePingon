// Sound Manager for Medieval Character Sheet Portfolio
// Handles all audio interactions and effects

class SoundManager {
    constructor() {
        // Audio elements
        this.sounds = {
            doorUnlock: null,
            chimes: null,
            click: null,
            clickfail: null,
            pull: null,
            release: null,
            bells: [],
            pages: [],
            reactFail: null,
            react01: null,
            react02: null,
            flagflow: null
        };

        // Audio pools for frequently used sounds (to avoid delays)
        this.clickPool = [];
        this.clickfailPool = [];
        this.clickPoolSize = 10;
        this.clickfailPoolSize = 10;
        this.clickPoolIndex = 0;
        this.clickfailPoolIndex = 0;

        // State tracking
        this.chimesPlaying = false;
        this.pullPlaying = false;
        this.pagesSoundPool = [];
        this.availablePageSounds = [];
        this.availableFlipSounds = [];
        this.audioReady = false;

        // Initialize all sounds
        this.initializeSounds();
    }

    initializeSounds() {
        // Door unlock sound (plays once on page load)
        this.sounds.doorUnlock = this.createPreloadedAudio('Assets/Sounds/door_unlock.wav', 0.7);

        // Chimes (looping background)
        this.sounds.chimes = this.createPreloadedAudio('Assets/Sounds/Chimes.wav', 0.3);
        this.sounds.chimes.loop = false; // We'll handle looping manually for fade effect

        // Create audio pools for click sounds (frequently used)
        for (let i = 0; i < this.clickPoolSize; i++) {
            this.clickPool.push(this.createPreloadedAudio('Assets/Sounds/click.wav', 0.5));
        }
        // Keep one reference as main click sound
        this.sounds.click = this.clickPool[0];

        // Create audio pools for clickfail sounds (frequently used)
        for (let i = 0; i < this.clickfailPoolSize; i++) {
            this.clickfailPool.push(this.createPreloadedAudio('Assets/Sounds/clickfail.wav', 0.5));
        }
        // Keep one reference as main clickfail sound
        this.sounds.clickfail = this.clickfailPool[0];

        // Pull sound (for workshop button press)
        this.sounds.pull = this.createPreloadedAudio('Assets/Sounds/Pull.wav', 0.6);

        // Release sound (for workshop button release)
        this.sounds.release = this.createPreloadedAudio('Assets/Sounds/Release.wav', 0.6);

        // Page sounds (for tab switching and flip effects) - page1 to page4
        for (let i = 1; i <= 4; i++) {
            const pageSound = this.createPreloadedAudio(`Assets/Sounds/pages/page${i}.wav`, 0.5);
            this.sounds.pages.push(pageSound);
        }
        // Store indices 0-3 (page1, page2, page3, page4)
        this.pagesSoundPool = [0, 1, 2, 3];

        // Bell sounds (for secret code game) - bell4 to bell1
        for (let i = 4; i >= 1; i--) {
            const bellSound = this.createPreloadedAudio(`Assets/Sounds/bells/bell${i}.wav`, 0.6);
            this.sounds.bells.push(bellSound);
        }

        // React/Feedback sounds for portrait game
        this.sounds.reactFail = this.createPreloadedAudio('Assets/Sounds/reactFail.wav', 0.6);
        this.sounds.react01 = this.createPreloadedAudio('Assets/Sounds/react01.wav', 0.6);
        this.sounds.react02 = this.createPreloadedAudio('Assets/Sounds/react02.wav', 0.6);
        this.sounds.flagflow = this.createPreloadedAudio('Assets/Sounds/flagflow.wav', 0.5);

        // Initialize available page sounds
        this.resetPageSoundPool();
        this.resetFlipSoundPool();

        // Mark audio as ready after a short delay
        setTimeout(() => {
            this.audioReady = true;
        }, 100);
    }

    // Helper to create preloaded audio with proper settings
    createPreloadedAudio(src, volume) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = volume;
        audio.src = src;
        // Load the audio immediately
        audio.load();
        return audio;
    }

    // Reset the page sound pool (refill when all have been played)
    resetPageSoundPool() {
        this.availablePageSounds = [...this.pagesSoundPool];
    }

    // Reset the flip sound pool (separate pool for flip effects)
    resetFlipSoundPool() {
        this.availableFlipSounds = [...this.pagesSoundPool];
    }

    // Play door unlock sound (only after user interaction)
    playDoorUnlock() {
        if (!this.audioReady) return;

        this.sounds.doorUnlock.currentTime = 0;
        this.sounds.doorUnlock.play().catch(() => {});
    }

    // Start the chimes loop with fade in/out effect (only after user interaction)
    startChimesLoop() {
        if (this.chimesPlaying) return;
        if (!this.audioReady) return;

        this.chimesPlaying = true;
        this.playChimesWithFade();
    }

    playChimesWithFade() {
        if (!this.chimesPlaying) return;

        const chimes = this.sounds.chimes;
        chimes.currentTime = 0;
        chimes.volume = 0;

        // Fade in duration (in seconds)
        const fadeInDuration = 2;
        const fadeOutDuration = 2;
        const targetVolume = 0.3;

        chimes.play().catch(() => {});

        // Fade in
        let fadeInInterval = setInterval(() => {
            if (chimes.volume < targetVolume - 0.01) {
                chimes.volume = Math.min(chimes.volume + 0.01, targetVolume);
            } else {
                clearInterval(fadeInInterval);
            }
        }, (fadeInDuration * 1000) / (targetVolume * 100));

        // Set up fade out before the track ends
        chimes.onended = null; // Clear any previous handler

        // Calculate when to start fade out
        const duration = chimes.duration;
        if (duration && !isNaN(duration)) {
            const fadeOutStartTime = duration - fadeOutDuration;

            const checkFadeOut = setInterval(() => {
                if (chimes.currentTime >= fadeOutStartTime && chimes.currentTime < duration) {
                    // Fade out
                    if (chimes.volume > 0.01) {
                        chimes.volume = Math.max(chimes.volume - 0.01, 0);
                    }
                }

                // When track ends, restart with fade in
                if (chimes.currentTime >= duration - 0.1 || chimes.ended) {
                    clearInterval(checkFadeOut);
                    if (this.chimesPlaying) {
                        // Small delay before restarting
                        setTimeout(() => this.playChimesWithFade(), 100);
                    }
                }
            }, (fadeOutDuration * 1000) / (targetVolume * 100));
        } else {
            // Fallback: just loop when ended
            chimes.onended = () => {
                if (this.chimesPlaying) {
                    setTimeout(() => this.playChimesWithFade(), 100);
                }
            };
        }
    }

    stopChimesLoop() {
        this.chimesPlaying = false;
        const chimes = this.sounds.chimes;

        // Fade out quickly
        const fadeOut = setInterval(() => {
            if (chimes.volume > 0.01) {
                chimes.volume = Math.max(chimes.volume - 0.05, 0);
            } else {
                clearInterval(fadeOut);
                chimes.pause();
                chimes.currentTime = 0;
            }
        }, 50);
    }

    // Play click sound (for any mouse click) - uses pool for better performance
    playClick() {
        if (!this.audioReady) return;

        // Get the next audio from the pool
        const audio = this.clickPool[this.clickPoolIndex];

        // Reset audio if it's playing
        if (!audio.paused) {
            audio.currentTime = 0;
        }

        // Play the audio
        audio.play().catch(() => {});

        // Move to next audio in pool
        this.clickPoolIndex = (this.clickPoolIndex + 1) % this.clickPoolSize;
    }

    // Play click fail sound (for non-interactive clicks) - uses pool for better performance
    playClickFail() {
        if (!this.audioReady) return;

        // Get the next audio from the pool
        const audio = this.clickfailPool[this.clickfailPoolIndex];

        // Reset audio if it's playing
        if (!audio.paused) {
            audio.currentTime = 0;
        }

        // Play the audio
        audio.play().catch(() => {});

        // Move to next audio in pool
        this.clickfailPoolIndex = (this.clickfailPoolIndex + 1) % this.clickfailPoolSize;
    }

    // Play a random page sound (for tab switching, excluding workshop)
    playRandomPageSound() {
        if (!this.audioReady) return;

        // If all sounds have been played, refill the pool
        if (this.availablePageSounds.length === 0) {
            this.resetPageSoundPool();
        }

        // Pick a random sound from available ones
        const randomIndex = Math.floor(Math.random() * this.availablePageSounds.length);
        const soundIndex = this.availablePageSounds[randomIndex];

        // Remove this sound from available pool
        this.availablePageSounds.splice(randomIndex, 1);

        // Play the sound
        const pageSound = this.sounds.pages[soundIndex];
        pageSound.currentTime = 0;
        pageSound.play().catch(() => {});
    }

    // Play a random page sound for flip effects (separate pool)
    playRandomFlipSound() {
        if (!this.audioReady) return;

        // If all sounds have been played, refill the pool
        if (this.availableFlipSounds.length === 0) {
            this.resetFlipSoundPool();
        }

        // Pick a random sound from available ones
        const randomIndex = Math.floor(Math.random() * this.availableFlipSounds.length);
        const soundIndex = this.availableFlipSounds[randomIndex];

        // Remove this sound from available pool
        this.availableFlipSounds.splice(randomIndex, 1);

        // Play the sound (reset if already playing)
        const pageSound = this.sounds.pages[soundIndex];
        if (!pageSound.paused) {
            pageSound.currentTime = 0;
        }
        pageSound.play().catch(() => {});
    }

    // Play bell sound for secret code sequence (bell4→bell3→bell2→bell1)
    playBellForSequence(sequencePosition) {
        if (!this.audioReady) return;

        // sequencePosition: 0=bell4, 1=bell3, 2=bell2, 3=bell1
        if (sequencePosition >= 0 && sequencePosition < 4) {
            const bellSound = this.sounds.bells[sequencePosition];

            // Stop and reset the audio completely before playing
            bellSound.pause();
            bellSound.currentTime = 0;

            // Play the sound
            bellSound.play().catch(() => {});
        }
    }

    // Play failure sound for portrait game
    playReactFail() {
        if (!this.audioReady) return;

        this.sounds.reactFail.currentTime = 0;
        this.sounds.reactFail.play().catch(() => {});
    }

    // Play success sound for portrait game
    playReactSuccess(isFirstTime = true) {
        if (!this.audioReady) return;
        // Always play flagflow with fade out
        const flagflow = this.sounds.flagflow;
        flagflow.currentTime = 0;
        flagflow.volume = 0.5;

        flagflow.play().catch(() => {});

        // Fade out flagflow near the end (if duration is available)
        const fadeOutDuration = 1.5; // seconds
        flagflow.onloadedmetadata = () => {
            const duration = flagflow.duration;
            if (duration && !isNaN(duration)) {
                const fadeOutStartTime = Math.max(0, duration - fadeOutDuration);

                const checkFadeOut = setInterval(() => {
                    if (flagflow.currentTime >= fadeOutStartTime && flagflow.currentTime < duration) {
                        if (flagflow.volume > 0.01) {
                            flagflow.volume = Math.max(flagflow.volume - 0.02, 0);
                        }
                    }

                    if (flagflow.currentTime >= duration - 0.1 || flagflow.ended) {
                        clearInterval(checkFadeOut);
                        flagflow.volume = 0.5; // Reset volume for next play
                    }
                }, 50);
            }
        };

        // Play react01 for first time, react02 for subsequent times
        if (isFirstTime) {
            this.sounds.react01.currentTime = 0;
            this.sounds.react01.play().catch(() => {});
        } else {
            this.sounds.react02.currentTime = 0;
            this.sounds.react02.play().catch(() => {});
        }
    }

    // Start playing pull sound (workshop button press and hold)
    startPull() {
        if (!this.audioReady) return;
        if (this.pullPlaying) return;

        this.pullPlaying = true;
        const pull = this.sounds.pull;
        pull.currentTime = 0;
        pull.play().catch(() => {});

        // If sound ends naturally (held longer than audio), just stop
        pull.onended = () => {
            this.pullPlaying = false;
        };
    }

    // Stop pull sound with fade out (when button released early)
    stopPull(immediate = false) {
        if (!this.pullPlaying) return;

        this.pullPlaying = false;
        const pull = this.sounds.pull;

        if (immediate || pull.currentTime < 0.1) {
            // Stop immediately if just started
            pull.pause();
            pull.currentTime = 0;
        } else {
            // Fade out over 200ms
            const fadeOutDuration = 200;
            const startVolume = pull.volume;
            const startTime = Date.now();

            const fadeInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / fadeOutDuration;

                if (progress >= 1) {
                    pull.pause();
                    pull.currentTime = 0;
                    pull.volume = startVolume;
                    clearInterval(fadeInterval);
                } else {
                    pull.volume = startVolume * (1 - progress);
                }
            }, 10);
        }
    }

    // Play release sound (workshop button release)
    playRelease() {
        if (!this.audioReady) return;

        const release = this.sounds.release;
        release.currentTime = 0;
        release.play().catch(() => {});
    }
}

// Create global sound manager instance
const soundManager = new SoundManager();

// Initialize sounds when page loads
window.addEventListener('DOMContentLoaded', () => {
    const staticLoader = document.getElementById('static-loader');
    const enterButton = document.getElementById('enter-archives-btn');

    // Add button hover effects
    if (enterButton) {
        enterButton.onmouseover = () => {
            enterButton.style.background = '#E0B885';
            enterButton.style.transform = 'translateY(-3px)';
            enterButton.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
            enterButton.style.borderColor = '#8B1A1A';
        };
        enterButton.onmouseout = () => {
            enterButton.style.background = '#D4A574';
            enterButton.style.transform = 'translateY(0)';
            enterButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            enterButton.style.borderColor = '#8B5A3C';
        };
    }

    // Add fadeOut animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Unlock audio on user interaction
    let audioUnlocked = false;
    const unlockAudio = async (showAnimation = true) => {
        if (audioUnlocked) return;
        audioUnlocked = true;

        // Hide button
        if (enterButton) {
            enterButton.style.display = 'none';
        }

        // Fade out the static loader
        if (staticLoader) {
            staticLoader.style.animation = 'fadeOut 1.5s ease-in-out forwards';
            setTimeout(() => staticLoader.remove(), 1500);
        }

        // Create an array of unlock promises for all pooled audio
        const unlockPromises = [];

        // Play and immediately pause all pooled sounds to unlock them
        soundManager.clickPool.forEach(audio => {
            const promise = audio.play()
                .then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                })
                .catch(() => {});
            unlockPromises.push(promise);
        });

        soundManager.clickfailPool.forEach(audio => {
            const promise = audio.play()
                .then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                })
                .catch(() => {});
            unlockPromises.push(promise);
        });

        // Wait for all audio to unlock
        await Promise.all(unlockPromises);

        // Play door unlock sound immediately at full volume
        soundManager.playDoorUnlock();

        // Start chimes loop after door unlock
        setTimeout(() => {
            soundManager.startChimesLoop();
        }, 1000);
    };

    // Try to autoplay immediately (will work if user has high MEI or on some browsers)
    setTimeout(async () => {
        // Create a separate test audio to avoid affecting the real doorUnlock sound
        const testAudio = soundManager.createPreloadedAudio('Assets/Sounds/door_unlock.wav', 0.01);

        try {
            await testAudio.play();
            // Success! Autoplay is allowed
            testAudio.pause();
            testAudio.currentTime = 0;

            // Mark as ready and play sounds with animation
            soundManager.audioReady = true;

            // Just animate
            unlockAudio(true); // Show animation
        } catch (err) {
            // Autoplay blocked - show enter button

            // Ensure doorUnlock volume is correct (in case it was modified during testing)
            soundManager.sounds.doorUnlock.volume = 0.7;

            // Show the button
            if (enterButton) {
                enterButton.style.display = 'block';
            }

            // Unlock on button click
            if (enterButton) {
                enterButton.addEventListener('click', () => {
                    // Ensure volume is at full before playing
                    soundManager.sounds.doorUnlock.volume = 0.7;
                    soundManager.audioReady = true;
                    unlockAudio(true);
                }, { once: true });
            }

            // Also handle regular clicks anywhere as fallback
            document.addEventListener('click', (e) => {
                if (!audioUnlocked && e.target !== enterButton) {
                    soundManager.sounds.doorUnlock.volume = 0.7;
                    soundManager.audioReady = true;
                    unlockAudio(true);
                }
            }, { once: true });
        }
    }, 500);

    // Add click listener to entire document for click sound
    document.addEventListener('click', (e) => {
        // Check if the clicked element is interactive
        const target = e.target;
        const isInteractive = isElementInteractive(target);

        if (isInteractive) {
            soundManager.playClick();
        } else {
            soundManager.playClickFail();
        }
    });

    // Helper function to determine if an element is interactive
    function isElementInteractive(element) {
        // Check if element or any parent is interactive
        let current = element;
        while (current && current !== document.body) {
            // Check for interactive elements
            const tagName = current.tagName?.toLowerCase();
            const role = current.getAttribute('role');

            // Interactive tag names
            if (['a', 'button', 'input', 'select', 'textarea', 'label'].includes(tagName)) {
                return true;
            }

            // Elements with explicit click handlers or interactive attributes
            if (
                current.onclick ||
                current.hasAttribute('onclick') ||
                role === 'button' ||
                role === 'link' ||
                role === 'tab'
            ) {
                return true;
            }

            // Specific interactive classes that we know have click handlers
            if (
                current.classList.contains('tab-button') ||
                current.classList.contains('workshop-seal-button') ||
                current.classList.contains('stat-item') ||
                current.classList.contains('port-nav-btn') ||
                current.classList.contains('skill-nav-btn') ||
                current.classList.contains('edu-nav-btn') ||
                current.classList.contains('skill-item') ||
                current.classList.contains('method-btn') ||
                current.classList.contains('portrait-image') ||
                current.classList.contains('portrait-frame') ||
                current.classList.contains('lang-btn') ||
                current.classList.contains('modal-close') ||
                current.classList.contains('cta-button') ||
                current.classList.contains('project-link') ||
                current.hasAttribute('data-tab') ||
                current.hasAttribute('data-category') ||
                current.hasAttribute('data-skill-category') ||
                current.hasAttribute('data-section')
            ) {
                return true;
            }

            current = current.parentElement;
        }

        return false;
    }

    // Add mousedown listener to entire document as backup
    document.addEventListener('mousedown', (e) => {
        // Only play if click event didn't fire (edge case)
        // The click sound is already handled by the click event above
    });
});

// Make sound manager globally available
window.soundManager = soundManager;

