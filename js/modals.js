// Medieval Character Sheet - Modal Functions
// Location: /home/hullivan/Hugues.W.B.dePingon/js/modals.js

// Video Modal
export function openFullVideo(videoType) {
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
        },
        'curvedWorld': {
            title: 'Curved World - shader prototype',
            src: 'Assets/Curvedshader.mp4'
        },
        'undergroundEnlightenment': {
            title: 'Underground Enlightenment - custom voxel engine',
            src: 'Assets/UndergroundEnlightenment.mp4'
        },
        'spiritsBounty': {
            title: 'Spirits Bounty - local LLM in Godot',
            src: 'Assets/Spirits_Bounty.mp4'
        },
        'mountedWarfare': {
            title: 'Mounted Warfare',
            src: 'Assets/Mounted_Warfare.mp4'
        },
        'tutelary': {
            title: 'Tutelary - fly fishing sim',
            src: 'Assets/Tutelary.mp4'
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
        videoElement.preload = 'auto';
        videoElement.playsInline = true;

        const source = document.createElement('source');
        source.src = video.src;
        const lower = video.src.toLowerCase();
        source.type = lower.endsWith('.webm')
            ? 'video/webm'
            : lower.endsWith('.avi')
                ? 'video/x-msvideo'
                : 'video/mp4';

        videoElement.appendChild(source);
        videoElement.appendChild(document.createTextNode('Your browser does not support the video tag.'));

        modalBody.innerHTML = '';
        modalBody.appendChild(videoElement);

        modal.style.display = 'flex';
        modal.style.animation = 'fadeIn 0.3s ease-in-out';
        lockBodyScrollForModal();
    }
}

// Detect mobile devices
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
}

// PDF Modal
export function openFullPDF(pdfType) {
    const pdfSources = {
        'biocracy': {
            title: 'BIOCRACY - A Nietzschean AI Alignment',
            src: 'Portfolio/Academia (Foresight, Ethics & Serious Games)/2025 - BIOCRACY - A Nietzschean Alignment; From Artificial Intelligence to Accelerated Independence - H.W.B.dePingon.pdf'
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
        }
    };

    const pdf = pdfSources[pdfType];
    if (!pdf) return;

    // On mobile: directly open PDF in new tab (don't show modal)
    if (isMobileDevice()) {
        window.open(pdf.src, '_blank', 'noopener,noreferrer');
        return;
    }

    // On desktop: show modal with iframe (keeps user on the website)
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = pdf.title;
    modalBody.innerHTML = '';

    // Create iframe element to display PDF within the website
    const iframe = document.createElement('iframe');
    iframe.className = 'modal-pdf';
    iframe.src = pdf.src + '#toolbar=1&navpanes=1&scrollbar=1';
    iframe.frameBorder = '0';

    // Add error handling to prevent console errors
    iframe.onload = function() {
        // PDF loaded successfully
    };

    iframe.onerror = function() {
        // Handle PDF loading errors silently
        console.warn('PDF loading error handled silently');
    };

    modalBody.appendChild(iframe);

    modal.style.display = 'flex';
    modal.style.animation = 'fadeIn 0.3s ease-in-out';
    lockBodyScrollForModal();
}

// Image Gallery Modal
export function openImageGallery(galleryType) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    const galleries = {
        'cattle-bridge': {
            title: 'Victorian Alpine Cattle Bridge Fantaisie',
            images: [
                { src: 'Assets/Architecture/bridge1.jpg', caption: 'Front elevation - hand-drawn timber frame' },
                { src: 'Assets/Architecture/bridge2.jpg', caption: 'Side elevation - hand-drawn timber frame' }
            ]
        },
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
                { src: 'Assets/Commissions/2024 - URsymbol.png', caption: 'UR Symbol Branding (2024)' },
                { src: 'Assets/Hugues/Hugues.W.B.dePingon - ASUM poster.png', caption: 'ASUM Campaign Poster (2018)' }
            ],
            videos: [
                { src: 'Assets/Commissions/2018 - CharacterSheet animation.mp4', caption: 'Character Sheet Animation (2018)' }
            ]
        },
        'media-appearances': {
            title: 'Media Appearances & Public Events',
            images: [
                {
                    src: 'Assets/Hugues/Articles/Hugues.W.B.dePingon - fullfashion.jpg',
                    titleKey: 'media-vilnius-title',
                    descKey: 'media-vilnius-desc',
                    url: 'https://www.facebook.com/permalink.php?story_fbid=pfbid022JYJWjRgNiZ6JKe6aWSzoYrY4cHvapwYjTo1tki7QXFiVKYSEcjAKPQTgaR2p3fXl&id=100011063237238'
                },
                {
                    src: 'Assets/Hugues/Articles/Hugues.W.B.dePingon - BrainBar2025.jpg',
                    titleKey: 'media-brainbar-title',
                    descKey: 'media-brainbar-desc',
                    url: 'https://youtu.be/98z9I0WwnY8?t=42'
                },
                {
                    src: 'Assets/Hugues/Articles/Hugues.W.B.dePingon - Vilnius Saint John Juonines Festival.PNG',
                    titleKey: 'media-festival-title',
                    descKey: 'media-festival-desc',
                    url: 'https://www.delfi.lt/vasara/naujienos/vilniuje-jau-dega-lauzai-ir-pinami-vainikai-verkiu-rumu-parke-prasidejo-tradicine-rasos-svente-81526543#gallery-id=84b01d40-7347-11ed-b29f-3da05397cd7c&image-id=e4a83fd0-7346-11ed-a414-71a9be2e1577'
                },
                {
                    src: 'Assets/Hugues/Articles/Hugues.W.B.dePingon - ASUM.webp',
                    titleKey: 'media-asum-title',
                    descKey: 'media-asum-desc',
                    url: 'https://www.montanakaimin.com/features/who-will-be-our-next-fearless-leader-asum-candidate-profiles/article_51257c7e-3c4f-11e8-9548-536939775063.html'
                }
            ],
            videos: [
                {
                    src: 'Assets/Hugues/Articles/Hugues.W.B.dePingon - 2020 - RTS - Alpagisme.mp4',
                    titleKey: 'media-rts-title',
                    descKey: 'media-rts-desc',
                    url: 'https://www.facebook.com/reel/290268345456134'
                }
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

                // Use translation keys for media-appearances gallery, fallback to caption for others
                let altText, titleText, descText;
                if (galleryType === 'media-appearances' && item.titleKey && item.descKey) {
                    altText = window.getTranslation ? window.getTranslation(item.titleKey) : item.titleKey;
                    titleText = window.getTranslation ? window.getTranslation(item.titleKey) : item.titleKey;
                    descText = window.getTranslation ? window.getTranslation(item.descKey) : item.descKey;
                } else {
                    altText = item.caption || '';
                    titleText = item.caption || '';
                    descText = '';
                }

                img.alt = altText;
                img.style.cssText = 'width: 100%; height: auto; border-radius: 8px; cursor: pointer; transition: transform 0.3s;';
                img.onmouseover = () => img.style.transform = 'scale(1.05)';
                img.onmouseout = () => img.style.transform = 'scale(1)';
                img.onclick = () => {
                    // For media-appearances gallery, open the URL instead of the image
                    if (galleryType === 'media-appearances' && item.url) {
                        window.open(item.url, '_blank');
                    } else {
                        window.open(item.src, '_blank');
                    }
                };

                // Create title element
                const title = document.createElement('h4');
                title.textContent = titleText;
                title.style.cssText = 'margin: 10px 0 5px 0; font-size: 16px; font-weight: bold; color: #8B7355;';

                // Create description element
                const caption = document.createElement('p');
                caption.textContent = descText;
                caption.style.cssText = 'margin: 0 0 10px 0; font-size: 14px; color: #8B7355;';

                imgWrapper.appendChild(img);
                imgWrapper.appendChild(title);
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
                video.style.cssText = 'width: 100%; height: auto; border-radius: 8px; cursor: pointer;';
                video.onclick = () => {
                    // For media-appearances gallery, open the URL instead of playing the video
                    if (galleryType === 'media-appearances' && item.url) {
                        window.open(item.url, '_blank');
                    }
                };

                // Use translation keys for media-appearances gallery, fallback to caption for others
                let titleText, descText;
                if (galleryType === 'media-appearances' && item.titleKey && item.descKey) {
                    titleText = window.getTranslation ? window.getTranslation(item.titleKey) : item.titleKey;
                    descText = window.getTranslation ? window.getTranslation(item.descKey) : item.descKey;
                } else {
                    titleText = item.caption || '';
                    descText = '';
                }

                // Create title element
                const title = document.createElement('h4');
                title.textContent = titleText;
                title.style.cssText = 'margin: 10px 0 5px 0; font-size: 16px; font-weight: bold; color: #8B7355;';

                // Create description element
                const caption = document.createElement('p');
                caption.textContent = descText;
                caption.style.cssText = 'margin: 0 0 10px 0; font-size: 14px; color: #8B7355;';

                videoWrapper.appendChild(video);
                videoWrapper.appendChild(title);
                videoWrapper.appendChild(caption);
                galleryContainer.appendChild(videoWrapper);
            });
        }

        modalBody.innerHTML = '';
        modalBody.appendChild(galleryContainer);

        modal.style.display = 'flex';
        modal.style.animation = 'fadeIn 0.3s ease-in-out';
        lockBodyScrollForModal();
    }
}

// Full Image Modal (for single images)
export function openFullImage(imageSrc) {
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
    lockBodyScrollForModal();
}

// Close Modal
export function closeModal() {
    const modal = document.getElementById('modal-overlay');
    modal.style.animation = 'fadeOut 0.3s ease-in-out';
    setTimeout(() => {
        modal.style.display = 'none';
        // Clear the content
        document.getElementById('modal-body').innerHTML = '';
        unlockBodyScrollForModal();
    }, 300);
}

function lockBodyScrollForModal() {
    document.body.dataset.modalScrollLocked = 'true';
    document.body.style.overflow = 'hidden';
}

function unlockBodyScrollForModal() {
    delete document.body.dataset.modalScrollLocked;

    // Keep scroll locked if another system still requires it.
    const entranceActive = document.body.classList.contains('entrance-active');
    const chronicleModalActive = document.getElementById('chronicle-modal')?.classList.contains('active');
    const shouldRemainLocked = entranceActive || chronicleModalActive;

    if (!shouldRemainLocked) {
        document.body.style.overflow = '';
    }
}

// Initialize modal event listeners
export function initializeModalListeners() {
    // Close modal when clicking outside
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Toggle Experience Card expansion
export function toggleExpCard(card) {
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
}

// Export functions for global access
window.openImageGallery = openImageGallery;
window.openFullVideo = openFullVideo;
window.openFullPDF = openFullPDF;
window.openFullImage = openFullImage;
window.closeModal = closeModal;

