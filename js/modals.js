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

// Detect mobile devices
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
}

// PDF Modal
export function openFullPDF(pdfType) {
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
}

// Image Gallery Modal
export function openImageGallery(galleryType) {
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
    document.body.style.overflow = 'hidden';
}

// Close Modal
export function closeModal() {
    const modal = document.getElementById('modal-overlay');
    modal.style.animation = 'fadeOut 0.3s ease-in-out';
    setTimeout(() => {
        modal.style.display = 'none';
        // Clear the content
        document.getElementById('modal-body').innerHTML = '';
    }, 300);
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

