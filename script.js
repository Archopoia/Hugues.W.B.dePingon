// Medieval Character Sheet Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Add fade in animation
            const activeContent = document.getElementById(targetTab);
            activeContent.style.animation = 'none';
    setTimeout(() => {
                activeContent.style.animation = 'fadeIn 1s cubic-bezier(.39, .575, .565, 1.000) both';
            }, 10);

            // Animate skill bars when skills tab is opened
            if (targetTab === 'skills') {
                setTimeout(() => {
                    animateSkillBars();
                }, 300);
            }
        });
    });

    // Skill bar animation
    function animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        skillBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
            bar.classList.add('animate');
        });
    }

    // Parallax effect for background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.character-sheet');
        const speed = scrolled * 0.5;

        if (parallax) {
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });

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

    // Typing effect for character name
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';

        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
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

    // Floating animation for portrait
    const portrait = document.querySelector('.portrait-frame');
    if (portrait) {
        setInterval(() => {
            portrait.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                portrait.style.transform = 'translateY(0)';
            }, 2000);
        }, 4000);
    }

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

    // Add ripple effect to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', createRipple);
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

    // Add medieval sound effects (optional)
    function playSound(soundType) {
        // This would require audio files, but we can add visual feedback instead
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
                    left: 50%;
            transform: translate(-50%, -50%);
            color: var(--gold);
            font-size: 2rem;
            pointer-events: none;
            z-index: 1000;
            animation: soundFeedback 0.5s ease-out;
        `;

        const soundStyle = document.createElement('style');
        soundStyle.textContent = `
            @keyframes soundFeedback {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.5);
                }
                50% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1.2);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
        `;
        document.head.appendChild(soundStyle);

        feedback.innerHTML = '✨';
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 500);
    }

    // Add sound feedback to tab switches
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            playSound('tab');
        });
    });

    // Add loading animation
    window.addEventListener('load', function() {
        const loader = document.createElement('div');
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--burgundy-dark);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeOut 1s ease-out 2s forwards;
        `;

        const loadingText = document.createElement('div');
        loadingText.style.cssText = `
            color: var(--gold);
            font-family: 'Cinzel', serif;
            font-size: 2rem;
            text-align: center;
        `;
        loadingText.innerHTML = 'Loading Portfolio...';
        loader.appendChild(loadingText);

        const loadingStyle = document.createElement('style');
        loadingStyle.textContent = `
            @keyframes fadeOut {
                to {
                    opacity: 0;
                    visibility: hidden;
                }
            }
        `;
        document.head.appendChild(loadingStyle);

        document.body.appendChild(loader);

        setTimeout(() => {
            loader.remove();
        }, 3000);
    });

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
            modalBody.innerHTML = `<video class="modal-video" controls autoplay><source src="${video.src}" type="video/mp4">Your browser does not support the video tag.</video>`;
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
            modalBody.innerHTML = `<iframe class="modal-pdf" src="${pdf.src}#toolbar=1&navpanes=1&scrollbar=1" frameborder="0"></iframe>`;
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
    };

    // Portfolio Category Filtering
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

    // Skills Category Filtering
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

    // Animate skill bars on initial load
                    setTimeout(() => {
        const visibleSkillFills = document.querySelectorAll('.skill-section:not([style*="display: none"]) .skill-fill');
        visibleSkillFills.forEach(fill => {
            const width = fill.getAttribute('data-width');
            fill.style.width = width + '%';
        });
    }, 500);

    // Initialize Education Navigation
    initializeEducationNavigation();

    console.log('Medieval Character Sheet with Interactive Portfolio loaded successfully! ⚔️');
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
