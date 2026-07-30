// Poetics - Bilingual lore essays loaded from Markdown files
// Location: js/poetics.js
//
// Mirrors Noematics: each piece is a real Markdown file in /poetics, listed in
// /poetics/manifest.json. Bodies use <!--lang:en--> / <!--lang:fr--> sections;
// cards and modal follow the site language toggle.
// Prefix a filename with "-" (e.g. "-rils-siwomiz.md") to keep it on disk but hide it.

import { parseFrontMatter, markdownToHTML, isHiddenMarkdownFilename } from './markdown-parser.js';

const CONTENT_DIR = 'poetics';

const essays = new Map();
let initialized = false;

function slugFromFilename(filename) {
    return filename.replace(/\.md$/i, '');
}

function currentLanguage() {
    if (typeof currentLang !== 'undefined' && currentLang) return currentLang;
    return document.documentElement.lang === 'fr' ? 'fr' : 'en';
}

function pickLocalized(metadata, field, lang) {
    if (!metadata) return '';
    if (lang === 'fr') {
        const fr = metadata[`${field}_fr`];
        if (fr) return fr;
    }
    return metadata[field] || '';
}

function splitBilingualMarkdown(markdown) {
    const marker = /<!--\s*lang:(en|fr)\s*-->/gi;
    const parts = { en: '', fr: '' };
    let lastLang = null;
    let lastIndex = 0;
    let match;

    const source = String(markdown || '');
    while ((match = marker.exec(source))) {
        if (lastLang) {
            parts[lastLang] += source.slice(lastIndex, match.index);
        }
        lastLang = match[1].toLowerCase();
        lastIndex = match.index + match[0].length;
    }
    if (lastLang) {
        parts[lastLang] += source.slice(lastIndex);
    } else {
        parts.en = source;
        parts.fr = source;
    }

    return {
        en: parts.en.trim(),
        fr: parts.fr.trim()
    };
}

async function loadPoeticsPost(filename) {
    const response = await fetch(`${CONTENT_DIR}/${filename}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load ${filename}`);
    const content = await response.text();
    const { metadata, markdown } = parseFrontMatter(content);
    const bodies = splitBilingualMarkdown(markdown);
    return {
        metadata,
        htmlEn: markdownToHTML(bodies.en || bodies.fr),
        htmlFr: markdownToHTML(bodies.fr || bodies.en)
    };
}

async function loadManifest() {
    const response = await fetch(`${CONTENT_DIR}/manifest.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load Poetics manifest');
    return response.json();
}

async function buildEssays(manifest) {
    const files = Array.isArray(manifest.posts) ? manifest.posts : [];

    const loaded = await Promise.all(files.map(async (filename) => {
        if (isHiddenMarkdownFilename(filename)) return null;

        try {
            const { metadata, htmlEn, htmlFr } = await loadPoeticsPost(filename);
            return { slug: slugFromFilename(filename), filename, metadata, htmlEn, htmlFr };
        } catch (err) {
            // Renamed on disk to "-name.md" but still listed without the prefix: treat as hidden.
            const hiddenName = `-${String(filename).replace(/^\.\//, '')}`;
            try {
                const probe = await fetch(`${CONTENT_DIR}/${hiddenName}`, { cache: 'no-store' });
                if (probe.ok) return null;
            } catch (_) {
                // Ignore probe failures; fall through to the original error.
            }
            console.error(`Poetics: could not load ${filename}`, err);
            return null;
        }
    }));

    essays.clear();
    loaded.filter(Boolean).forEach((essay, order) => {
        essay.order = order;
        essays.set(essay.slug, essay);
    });
}

function renderCards() {
    const carousel = document.getElementById('poetics-grid');
    if (!carousel) return;

    const lang = currentLanguage();
    const ordered = Array.from(essays.values()).sort((a, b) => a.order - b.order);
    const openLabel = lang === 'fr' ? 'Ouvrir le texte' : 'Open text';

    carousel.innerHTML = ordered.map((essay) => {
        const m = essay.metadata || {};
        const title = pickLocalized(m, 'title', lang) || essay.slug;
        const question = pickLocalized(m, 'question', lang);
        const excerpt = pickLocalized(m, 'excerpt', lang);

        return `
        <article class="poema-card" data-slug="${essay.slug}" role="button" tabindex="0" aria-label="${openLabel}: ${title}">
            <h3 class="poema-card-title">${title}</h3>
            ${question ? `<p class="poema-card-question">${question}</p>` : ''}
            <p class="poema-card-excerpt">${excerpt || ''}</p>
        </article>`;
    }).join('');
}

function bindCarouselNav() {
    const wrap = document.querySelector('.poetics-carousel-wrap');
    const carousel = document.getElementById('poetics-grid');
    const prev = document.getElementById('poetics-carousel-prev');
    const next = document.getElementById('poetics-carousel-next');
    if (!carousel || !prev || !next) return;

    if (carousel.dataset.navBound === 'true') return;
    carousel.dataset.navBound = 'true';

    const isMobileLayout = () => window.matchMedia('(max-width: 768px)').matches;

    carousel.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.poema-card');
        if (!card) return;
        e.preventDefault();
        openPoema(card.dataset.slug);
    });

    // Simple click open on mobile stacked layout (no drag carousel).
    carousel.addEventListener('click', (e) => {
        if (!isMobileLayout()) return;
        const card = e.target.closest('.poema-card');
        if (!card) return;
        openPoema(card.dataset.slug);
    });

    const getCardStep = () => {
        const card = carousel.querySelector('.poema-card');
        if (!card) return 240;
        const styles = window.getComputedStyle(carousel);
        const gap = parseFloat(styles.columnGap || styles.gap || '16') || 16;
        return card.getBoundingClientRect().width + gap;
    };

    const scrollByCard = (direction) => {
        carousel.scrollBy({ left: direction * getCardStep(), behavior: 'smooth' });
    };

    prev.addEventListener('click', () => scrollByCard(-1));
    next.addEventListener('click', () => scrollByCard(1));

    const WHEEL_SENSITIVITY = 2.75;
    const DRAG_THRESHOLD_PX = 14;

    const normalizeWheelDelta = (e) => {
        const lineHeight = 40;
        const pageHeight = carousel.clientWidth || 800;
        if (e.deltaMode === 1) return { x: e.deltaX * lineHeight, y: e.deltaY * lineHeight };
        if (e.deltaMode === 2) return { x: e.deltaX * pageHeight, y: e.deltaY * pageHeight };
        return { x: e.deltaX, y: e.deltaY };
    };

    const onWheel = (e) => {
        if (isMobileLayout()) return;
        const { x, y } = normalizeWheelDelta(e);
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (maxScroll <= 1) return;

        const delta = (Math.abs(y) >= Math.abs(x) ? y : x) * WHEEL_SENSITIVITY;
        if (!delta) return;

        e.preventDefault();
        e.stopPropagation();
        carousel.scrollLeft = Math.max(0, Math.min(maxScroll, carousel.scrollLeft + delta));
    };

    const wheelTarget = wrap || carousel;
    wheelTarget.addEventListener('wheel', onWheel, { passive: false, capture: true });

    let drag = null;

    const onPointerDown = (e) => {
        if (isMobileLayout()) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (e.target.closest('.poetics-carousel-nav')) return;

        const card = e.target.closest('.poema-card');
        drag = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startScroll: carousel.scrollLeft,
            moved: false,
            nativeTouch: e.pointerType === 'touch',
            openSlug: card ? card.dataset.slug : null
        };
        carousel.dataset.dragMoved = 'false';
    };

    const onPointerMove = (e) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        const dx = e.clientX - drag.startX;
        if (!drag.moved && Math.abs(dx) > DRAG_THRESHOLD_PX) {
            drag.moved = true;
            carousel.dataset.dragMoved = 'true';
            if (!drag.nativeTouch) {
                carousel.classList.add('is-dragging');
                try {
                    carousel.setPointerCapture(e.pointerId);
                } catch (_) {
                    // Ignore capture failures.
                }
            }
        }
        if (drag.nativeTouch || !drag.moved) return;
        e.preventDefault();
        carousel.scrollLeft = drag.startScroll - dx;
    };

    const endDrag = (e) => {
        if (!drag || (e && e.pointerId !== drag.pointerId)) return;
        const wasMoved = drag.moved;
        const openSlug = drag.openSlug;
        drag = null;
        carousel.classList.remove('is-dragging');
        carousel.dataset.dragMoved = 'false';

        // Desktop: open on pointerup when the gesture was a click, not a drag.
        if (!wasMoved && openSlug && e && e.type === 'pointerup') {
            openPoema(openSlug);
        }
    };

    carousel.addEventListener('pointerdown', onPointerDown);
    carousel.addEventListener('pointermove', onPointerMove, { passive: false });
    carousel.addEventListener('pointerup', endDrag);
    carousel.addEventListener('pointercancel', (e) => {
        if (!drag || (e && e.pointerId !== drag.pointerId)) return;
        drag = null;
        carousel.classList.remove('is-dragging');
        carousel.dataset.dragMoved = 'false';
    });
    carousel.addEventListener('lostpointercapture', (e) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        drag = null;
        carousel.classList.remove('is-dragging');
        carousel.dataset.dragMoved = 'false';
    });
}

function openPoema(slug) {
    const essay = essays.get(slug);
    if (!essay) return;

    const modal = document.getElementById('poema-modal');
    const content = document.getElementById('poema-content');
    if (!modal || !content) return;

    // Portfolio category animations use transform, which traps position:fixed.
    // Keep the modal on document.body so it always covers the viewport.
    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }

    const lang = currentLanguage();
    const html = lang === 'fr' ? essay.htmlFr : essay.htmlEn;

    content.dataset.slug = slug;
    content.innerHTML = `<div class="poema-article-body">${html}</div>`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const scroll = modal.querySelector('.poema-scroll');
    if (scroll) scroll.scrollTop = 0;
    updateReadingProgress();

    if (window.soundManager) window.soundManager.playRandomPageSound();
}

function closePoema() {
    const modal = document.getElementById('poema-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function updateReadingProgress() {
    const modal = document.getElementById('poema-modal');
    const scroll = modal ? modal.querySelector('.poema-scroll') : null;
    const bar = document.getElementById('poema-progress');
    if (!scroll || !bar) return;

    const onScroll = () => {
        const max = scroll.scrollHeight - scroll.clientHeight;
        const pct = max > 0 ? (scroll.scrollTop / max) * 100 : 0;
        bar.style.width = `${Math.min(pct, 100)}%`;
    };
    scroll.removeEventListener('scroll', onScroll);
    scroll.addEventListener('scroll', onScroll);
    onScroll();
}

function refreshPoeticsLanguage() {
    if (!initialized || essays.size === 0) return;
    renderCards();
    const modal = document.getElementById('poema-modal');
    const body = document.getElementById('poema-content');
    if (modal && modal.classList.contains('active') && body && body.dataset.slug) {
        openPoema(body.dataset.slug);
    }
}

window.openPoema = openPoema;
window.closePoema = closePoema;
window.refreshPoeticsLanguage = refreshPoeticsLanguage;

export async function initializePoetics() {
    const carousel = document.getElementById('poetics-grid');
    if (!carousel) return;

    if (initialized && essays.size > 0) {
        renderCards();
        bindCarouselNav();
        return;
    }

    const lang = currentLanguage();
    carousel.innerHTML = `<div class="poema-loading"><i class="fas fa-spinner fa-spin"></i> ${
        lang === 'fr' ? 'Assemblage des textes...' : 'Gathering the texts...'
    }</div>`;

    try {
        const manifest = await loadManifest();
        await buildEssays(manifest);
        renderCards();
        bindCarouselNav();
        initialized = true;
    } catch (err) {
        console.error('Poetics failed to initialize', err);
        carousel.innerHTML = `<div class="poema-loading">${
            lang === 'fr'
                ? 'Les textes n\'ont pas pu être chargés pour le moment.'
                : 'The texts could not be loaded right now.'
        }</div>`;
    }

    const modal = document.getElementById('poema-modal');
    if (modal && !modal.dataset.bound) {
        modal.dataset.bound = 'true';
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePoema();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closePoema();
        });
        const closeBtn = modal.querySelector('.poema-close');
        if (closeBtn) closeBtn.addEventListener('click', closePoema);
    }
}

window.initializePoetics = initializePoetics;
