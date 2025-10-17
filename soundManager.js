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
            stamp: null,
            bells: [],
            pages: [],
            reactFail: null,
            react01: null,
            react02: null,
            flagflow: null,
            secrets: []
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
        // Door unlock sound (plays once on page load) - needs full preload
        this.sounds.doorUnlock = this.createFullyPreloadedAudio('Assets/Sounds/door_unlock.wav', 0.7);

        // Chimes (looping background) - needs full preload
        this.sounds.chimes = this.createFullyPreloadedAudio('Assets/Sounds/Chimes.wav', 0.3);
        this.sounds.chimes.loop = false; // We'll handle looping manually for fade effect

        // Create audio pools for click sounds (frequently used)
        for (let i = 0; i < this.clickPoolSize; i++) {
            this.clickPool.push(this.createPreloadedAudio('Assets/Sounds/click.wav', 0.25));
        }
        // Keep one reference as main click sound
        this.sounds.click = this.clickPool[0];

        // Create audio pools for clickfail sounds (frequently used)
        for (let i = 0; i < this.clickfailPoolSize; i++) {
            this.clickfailPool.push(this.createPreloadedAudio('Assets/Sounds/clickfail.wav', 0.25));
        }
        // Keep one reference as main clickfail sound
        this.sounds.clickfail = this.clickfailPool[0];

        // Pull sound (for workshop button press) - needs full preload for immediate playback
        this.sounds.pull = this.createFullyPreloadedAudio('Assets/Sounds/Pull.wav', 0.6);

        // Release sound (for workshop button release) - needs full preload
        this.sounds.release = this.createFullyPreloadedAudio('Assets/Sounds/Release.wav', 0.6);

        // Stamp sound (for workshop seal stamp effect) - needs full preload
        this.sounds.stamp = this.createFullyPreloadedAudio('Assets/Sounds/Stamp.mp3', 0.7);

        // Page sounds (for tab switching and flip effects) - page1 to page4 - need full preload for immediate playback
        for (let i = 1; i <= 4; i++) {
            const pageSound = this.createFullyPreloadedAudio(`Assets/Sounds/pages/page${i}.wav`, 0.25);
            this.sounds.pages.push(pageSound);
        }
        // Store indices 0-3 (page1, page2, page3, page4)
        this.pagesSoundPool = [0, 1, 2, 3];

        // Bell sounds (for secret code game) - bell4 to bell1 - need full preload for immediate playback
        for (let i = 4; i >= 1; i--) {
            const bellSound = this.createFullyPreloadedAudio(`Assets/Sounds/bells/bell${i}.wav`, 0.6);
            this.sounds.bells.push(bellSound);
        }

        // React/Feedback sounds for portrait game - need full preload for immediate playback
        this.sounds.reactFail = this.createFullyPreloadedAudio('Assets/Sounds/reactFail.wav', 0.6);
        this.sounds.react01 = this.createFullyPreloadedAudio('Assets/Sounds/react01.wav', 0.6);
        this.sounds.react02 = this.createFullyPreloadedAudio('Assets/Sounds/react02.wav', 0.6);
        this.sounds.flagflow = this.createFullyPreloadedAudio('Assets/Sounds/flagflow.wav', 0.5);

        // Secret unlock sounds for workshop achievements - need full preload for immediate playback
        for (let i = 1; i <= 4; i++) {
            const secretSound = this.createFullyPreloadedAudio(`Assets/Sounds/Unlocks/Secret${i}.wav`, 0.7);
            this.sounds.secrets.push(secretSound);
        }

        // Initialize available page sounds
        this.resetPageSoundPool();
        this.resetFlipSoundPool();

        // Mark audio as ready after page sounds are loaded
        // Wait a bit longer to ensure all sounds are properly loaded
        setTimeout(() => {
            this.audioReady = true;
        }, 500);
    }

    // Helper to create fully preloaded audio (for critical sounds that must play immediately)
    createFullyPreloadedAudio(src, volume) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = volume;
        audio.src = src;
        // Load the audio immediately
        audio.load();
        return audio;
    }

    // Helper to create preloaded audio with proper settings
    // Performance: Use metadata preload for faster initial load (for non-critical sounds)
    createPreloadedAudio(src, volume) {
        const audio = new Audio();
        // Performance: Only preload metadata initially to reduce bandwidth
        audio.preload = 'metadata';
        audio.volume = volume;
        audio.src = src;

        // Performance: Load full audio on first interaction
        const loadFullAudio = () => {
            if (audio.preload === 'metadata') {
                audio.preload = 'auto';
                audio.load();
            }
        };

        // Load full audio on first play attempt
        audio.addEventListener('play', loadFullAudio, { once: true });

        // Load the metadata immediately
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

    // Performance: Clean up audio resources when not needed
    cleanup() {
        // Pause all sounds
        this.stopChimesLoop();

        // Pause and reset all audio elements
        Object.values(this.sounds).forEach(sound => {
            if (sound && sound.pause) {
                sound.pause();
                sound.currentTime = 0;
            } else if (Array.isArray(sound)) {
                sound.forEach(s => {
                    if (s && s.pause) {
                        s.pause();
                        s.currentTime = 0;
                    }
                });
            }
        });

        // Clean up pools
        this.clickPool.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });

        this.clickfailPool.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
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

        // Play the sound (reset if already playing)
        const pageSound = this.sounds.pages[soundIndex];
        if (!pageSound.paused) {
            pageSound.currentTime = 0;
        }

        // Ensure the sound is ready to play
        if (pageSound.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            pageSound.play().catch(() => {});
        } else {
            // If not ready, wait a bit and try again
            setTimeout(() => {
                pageSound.play().catch(() => {});
            }, 50);
        }
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

        // Ensure the sound is ready to play
        if (pageSound.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            pageSound.play().catch(() => {});
        } else {
            // If not ready, wait a bit and try again
            setTimeout(() => {
                pageSound.play().catch(() => {});
            }, 50);
        }
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
        // Always play flagflow starting at 1 second with fade-in
        const flagflow = this.sounds.flagflow;
        flagflow.currentTime = 1.0; // Start at 1 second
        flagflow.volume = 0; // Start silent for fade-in

        flagflow.play().catch(() => {});

        // Fade in flagflow over 1 second
        const fadeInDuration = 1.0; // seconds
        const targetVolume = 0.5;
        let fadeInStartTime = performance.now();

        const fadeInInterval = setInterval(() => {
            const elapsed = (performance.now() - fadeInStartTime) / 1000;
            const fadeProgress = Math.min(elapsed / fadeInDuration, 1);

            flagflow.volume = fadeProgress * targetVolume;

            if (fadeProgress >= 1) {
                clearInterval(fadeInInterval);
            }
        }, 50);

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

    // Get pull sound duration
    getPullDuration() {
        if (!this.audioReady || !this.sounds.pull) return 2.0; // Default fallback
        return this.sounds.pull.duration || 2.0;
    }

    // Start playing pull sound (workshop button press and hold)
    startPull() {
        if (!this.audioReady) return;
        if (this.pullPlaying) return;

        this.pullPlaying = true;
        this.pullStartTime = Date.now();
        const pull = this.sounds.pull;
        pull.currentTime = 0;
        pull.play().catch(() => {});

        // If sound ends naturally (held longer than audio), just stop
        pull.onended = () => {
            this.pullPlaying = false;
        };
    }

    // Stop pull sound and return the playback position
    stopPull(immediate = false) {
        if (!this.pullPlaying) {
            return 0;
        }

        this.pullPlaying = false;
        const pull = this.sounds.pull;
        const stoppedAt = pull.currentTime;

        if (immediate) {
            // Stop immediately without fade
            pull.pause();
            const returnValue = stoppedAt;
            // Don't reset currentTime yet - we need it for reverse playback
            return returnValue;
        } else if (pull.currentTime < 0.1) {
            // Just started, stop immediately
            pull.pause();
            pull.currentTime = 0;
            return 0;
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

            return stoppedAt;
        }
    }

    // Play pull sound in reverse from a specific position
    playPullReverse(fromTime) {
        if (!this.audioReady) return;

        const pull = this.sounds.pull;

        // Reset playback rate first
        pull.playbackRate = 1.0;
        pull.currentTime = fromTime;

        // Try setting negative playback rate
        try {
            pull.playbackRate = -1.0;
        } catch (e) {
            this.simulateReversePull(fromTime);
            return;
        }

        pull.play().then(() => {
            // Listen for when it reaches the beginning
            pull.ontimeupdate = () => {
                if (pull.currentTime <= 0) {
                    pull.pause();
                    pull.currentTime = 0;
                    pull.playbackRate = 1.0;
                    pull.ontimeupdate = null;
                }
            };
        }).catch((error) => {
            // If browser doesn't support negative playback rate, simulate it
            pull.playbackRate = 1.0; // Reset
            this.simulateReversePull(fromTime);
        });
    }

    // Simulate reverse playback by playing backwards manually
    simulateReversePull(fromTime) {
        const pull = this.sounds.pull;
        let currentTime = fromTime;

        pull.playbackRate = 1; // Reset to normal playback rate
        pull.currentTime = fromTime;

        // Start with low volume for fade-in
        const originalVolume = pull.volume;
        pull.volume = 0;

        pull.play().catch(() => {});

        // Fade in over 50ms
        const fadeInDuration = 50;
        const fadeInStart = Date.now();
        let reverseDuration = 0;

        const reverseInterval = setInterval(() => {
            const elapsed = Date.now() - fadeInStart;
            reverseDuration = elapsed;

            // Fade in volume
            if (elapsed < fadeInDuration) {
                pull.volume = originalVolume * (elapsed / fadeInDuration);
            } else {
                pull.volume = originalVolume;
            }

            currentTime -= 0.016; // ~60fps

            if (currentTime <= 0) {
                pull.pause();
                pull.currentTime = 0;
                pull.volume = originalVolume;
                clearInterval(reverseInterval);
            } else {
                pull.currentTime = currentTime;
            }
        }, 16);
    }

    // Play release sound (workshop button release)
    playRelease() {
        if (!this.audioReady) return;

        const release = this.sounds.release;
        release.currentTime = 0;
        release.play().catch(() => {});
    }

    // Play stamp sound (workshop seal stamp effect)
    playStamp() {
        if (!this.audioReady) return;

        const stamp = this.sounds.stamp;
        stamp.currentTime = 0;
        stamp.play().catch(() => {});
    }

    // Play secret unlock sound for workshop achievements
    // secretNumber: 1=Secret1.wav (H pattern), 2=Secret2.wav (O pattern),
    //               3=Secret3.wav (Snake pattern), 4=Secret4.wav (All pattern)
    playSecretUnlock(secretNumber) {
        if (!this.audioReady) return;

        if (secretNumber >= 1 && secretNumber <= 4) {
            const secretSound = this.sounds.secrets[secretNumber - 1];

            // Stop and reset the audio completely before playing
            secretSound.pause();
            secretSound.currentTime = 0;

            // Play the sound
            secretSound.play().catch(() => {});
        }
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
    const unlockAudio = async (playSound = true) => {
        if (audioUnlocked) return;
        audioUnlocked = true;

        // Hide button
        if (enterButton) {
            enterButton.style.display = 'none';
        }

        // Fade out the static loader
        if (staticLoader) {
            staticLoader.style.animation = 'fadeOut 1.5s ease-in-out forwards';
            setTimeout(() => {
                staticLoader.remove();

                // Show workshop button and language switcher after entrance screen is gone
                const workshopButton = document.querySelector('.workshop-seal-button');
                const languageSwitcher = document.querySelector('.language-switcher');
                if (workshopButton) {
                    workshopButton.classList.add('visible');
                }
                if (languageSwitcher) languageSwitcher.classList.add('visible');
            }, 1500);
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

        // Also unlock page sounds for immediate playback
        soundManager.sounds.pages.forEach(audio => {
            const promise = audio.play()
                .then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                })
                .catch(() => {});
            unlockPromises.push(promise);
        });

        // Also unlock stamp sound for immediate playback
        if (soundManager.sounds.stamp) {
            const promise = soundManager.sounds.stamp.play()
                .then(() => {
                    soundManager.sounds.stamp.pause();
                    soundManager.sounds.stamp.currentTime = 0;
                })
                .catch(() => {});
            unlockPromises.push(promise);
        }

        // Also unlock secret sounds for immediate playback
        soundManager.sounds.secrets.forEach(audio => {
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

        // Play door unlock sound immediately at full volume (only if not already played)
        if (playSound) {
        soundManager.playDoorUnlock();
        }

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

                // Add hover tracking for proper animation cycling
                enterButton.addEventListener('mouseenter', () => {
                    enterButton.classList.add('was-hovered');
                });
            }

            // Unlock on button click
            if (enterButton) {
                enterButton.addEventListener('click', () => {
                    // Prevent fallback handler from running
                    window.keyholeClickInProgress = true;

                    // Play the door unlock sound immediately on click
                    soundManager.sounds.doorUnlock.volume = 0.7;
                    soundManager.audioReady = true;
                    soundManager.sounds.doorUnlock.play();

                    // Create a beautiful golden flash element that purges everything
                    const flashElement = document.createElement('div');
                    flashElement.id = 'golden-flash';
                    flashElement.style.cssText = `
                        position: fixed;
                        top: 47%;
                        left: 50%;
                        width: 0;
                        height: 0;
                        background: radial-gradient(circle,
                            rgba(255, 235, 198, 1) 0%,
                            rgba(255, 235, 198, 0.8) 20%,
                            rgba(255, 235, 198, 0.4) 35%,
                            rgba(255, 235, 198, 0.1) 50%,
                            transparent 70%);
                        transform: translate(-50%, -50%);
                        border-radius: 50%;
                        pointer-events: none;
                        z-index: 10001;
                        opacity: 1;
                    `;
                    document.body.appendChild(flashElement);

                    // Start the flash animation immediately - it purges everything
                    flashElement.style.animation = 'goldenFlash 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';


                    // Wait for the flash to completely cover the screen
                    setTimeout(() => {
                        // Flash is at maximum - hide the entrance background underneath
                        if (staticLoader) {
                            staticLoader.style.display = 'none';
                        }
                        if (enterButton) {
                            enterButton.style.display = 'none';
                        }

                        // Remove the goldenFlash animation first to release the animation-fill-mode
                        flashElement.style.animation = 'none';
                        // Force a reflow to ensure the animation change is registered
                        void flashElement.offsetHeight;

                        // Now set the final dimensions as inline styles
                        flashElement.style.width = '3000px';
                        flashElement.style.height = '3000px';

                        // Apply fadeOut animation
                        flashElement.style.animation = 'fadeOut 1.5s ease-in-out forwards';

                        // After flash fades out, show the website content
                        setTimeout(() => {

                            // Remove the static loader from DOM
                            if (staticLoader && staticLoader.parentNode) {
                                staticLoader.remove();
                            }

                            // Show workshop button and language switcher
                            const workshopButton = document.querySelector('.workshop-seal-button');
                            const languageSwitcher = document.querySelector('.language-switcher');
                            if (workshopButton) {
                                workshopButton.classList.add('visible');
                            }
                            if (languageSwitcher) languageSwitcher.classList.add('visible');

                            // Clean up flash element
                            if (flashElement.parentNode) {
                                flashElement.parentNode.removeChild(flashElement);
                            }

                            // Unlock audio without playing sound (sound already played on click)
                            audioUnlocked = true;

                            // Unlock all pooled audio
                            const unlockPromises = [];
                            soundManager.clickPool.forEach(audio => {
                                const promise = audio.play()
                                    .then(() => {
                                        audio.pause();
                                        audio.currentTime = 0;
                                    })
                                    .catch(() => {});
                                unlockPromises.push(promise);
                            });

                            // Unlock other sounds
                            if (soundManager.sounds.stamp) {
                                const promise = soundManager.sounds.stamp.play()
                                    .then(() => {
                                        soundManager.sounds.stamp.pause();
                                        soundManager.sounds.stamp.currentTime = 0;
                                    })
                                    .catch(() => {});
                                unlockPromises.push(promise);
                            }

                            soundManager.sounds.secrets.forEach(audio => {
                                const promise = audio.play()
                                    .then(() => {
                                        audio.pause();
                                        audio.currentTime = 0;
                                    })
                                    .catch(() => {});
                                unlockPromises.push(promise);
                            });

                            // Start chimes loop after unlocking
                            Promise.all(unlockPromises).then(() => {
                                setTimeout(() => {
                                    soundManager.startChimesLoop();
                                }, 1000);
                            });
                        }, 1500); // Wait for fadeOut animation to complete
                    }, 1200); // Wait for the full flash animation to complete
                }, { once: true });
            }

            // Also handle regular clicks anywhere as fallback
            document.addEventListener('click', (e) => {
                if (!audioUnlocked && !window.keyholeClickInProgress && e.target !== enterButton && !e.target.closest('#enter-archives-btn')) {
                    soundManager.sounds.doorUnlock.volume = 0.7;
                    soundManager.audioReady = true;
                    unlockAudio(true);
                }
            }, { once: true });
        }
    }, 500);

    // Track last click to prevent doubles
    let lastClickTime = 0;
    let lastClickTarget = null;

    // Add click listener to entire document for click sound
    document.addEventListener('click', (e) => {
        const target = e.target;
        const now = Date.now();

        // Prevent double sound within 50ms on same element or related label/input pair
        if (now - lastClickTime < 50) {
            const parentLabel = target.closest('label');
            const lastParentLabel = lastClickTarget?.closest('label');

            // Skip if clicking same element or elements within same label
            if (target === lastClickTarget ||
                (parentLabel && parentLabel === lastParentLabel)) {
                return;
            }
        }

        const isInteractive = isElementInteractive(target);

        if (isInteractive) {
            soundManager.playClick();
            lastClickTime = now;
            lastClickTarget = target;
        } else {
            soundManager.playClickFail();
            lastClickTime = now;
            lastClickTarget = target;
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

