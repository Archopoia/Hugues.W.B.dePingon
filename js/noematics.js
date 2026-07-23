// Noematics - Essays loaded from Markdown files
// Location: js/noematics.js
//
// This section is fully data-driven. Every essay is a real Markdown file in the
// /noematics folder, listed in /noematics/manifest.json. Edit or add .md files,
// push, and the page updates itself - no HTML editing required.

import { loadMarkdownPost } from './markdown-parser.js';

const CONTENT_DIR = 'noematics';

// In-memory store of loaded essays, keyed by slug (filename without .md).
const essays = new Map();
let initialized = false;

function slugFromFilename(filename) {
    return filename.replace(/\.md$/i, '');
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function loadManifest() {
    const response = await fetch(`${CONTENT_DIR}/manifest.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load Noematics manifest');
    return response.json();
}

async function buildEssays(manifest) {
    const files = Array.isArray(manifest.posts) ? manifest.posts : [];

    const loaded = await Promise.all(files.map(async (filename) => {
        try {
            const { metadata, html } = await loadMarkdownPost(filename, CONTENT_DIR);
            return { slug: slugFromFilename(filename), filename, metadata, html };
        } catch (err) {
            console.error(`Noematics: could not load ${filename}`, err);
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
    const carousel = document.getElementById('noematics-grid');
    if (!carousel) return;

    const ordered = Array.from(essays.values()).sort((a, b) => a.order - b.order);

    carousel.innerHTML = ordered.map(essay => {
        const m = essay.metadata || {};

        return `
        <article class="noema-card" data-slug="${essay.slug}" role="button" tabindex="0" aria-label="Open essay: ${m.title || essay.slug}">
            <h3 class="noema-card-title">${m.title || essay.slug}</h3>
            <div class="noema-card-meta">
                <span><i class="fas fa-feather-pointed"></i> ${formatDate(m.date)}</span>
                ${m.readTime ? `<span><i class="fas fa-hourglass-half"></i> ${m.readTime} min</span>` : ''}
            </div>
            ${m.question ? `<p class="noema-card-question">${m.question}</p>` : ''}
            <p class="noema-card-excerpt">${m.excerpt || ''}</p>
        </article>`;
    }).join('');

    carousel.querySelectorAll('.noema-card').forEach(card => {
        const slug = card.dataset.slug;
        const open = () => {
            // Ignore clicks that were really a drag/swipe through the carousel.
            if (carousel.dataset.dragMoved === 'true') return;
            openNoema(slug);
        };
        card.addEventListener('click', open);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        });
    });
}

function bindCarouselNav() {
    const wrap = document.querySelector('.noematics-carousel-wrap');
    const carousel = document.getElementById('noematics-grid');
    const prev = document.getElementById('noematics-carousel-prev');
    const next = document.getElementById('noematics-carousel-next');
    if (!carousel || !prev || !next) return;

    // Re-bind safely if the section DOM was replaced.
    if (carousel.dataset.navBound === 'true') return;
    carousel.dataset.navBound = 'true';

    const getCardStep = () => {
        const card = carousel.querySelector('.noema-card');
        if (!card) return 240;
        const styles = window.getComputedStyle(carousel);
        const gap = parseFloat(styles.columnGap || styles.gap || '16') || 16;
        return card.getBoundingClientRect().width + gap;
    };

    const scrollByCard = (direction) => {
        carousel.scrollBy({ left: direction * getCardStep(), behavior: 'smooth' });
        if (window.soundManager) window.soundManager.playRandomPageSound();
    };

    prev.addEventListener('click', () => scrollByCard(-1));
    next.addEventListener('click', () => scrollByCard(1));

    const WHEEL_SENSITIVITY = 2.75;

    const normalizeWheelDelta = (e) => {
        // deltaMode: 0 = pixels, 1 = lines, 2 = pages
        const lineHeight = 40;
        const pageHeight = carousel.clientWidth || 800;
        if (e.deltaMode === 1) return { x: e.deltaX * lineHeight, y: e.deltaY * lineHeight };
        if (e.deltaMode === 2) return { x: e.deltaX * pageHeight, y: e.deltaY * pageHeight };
        return { x: e.deltaX, y: e.deltaY };
    };

    // Vertical wheel / trackpad over the carousel scrolls it horizontally.
    const onWheel = (e) => {
        const { x, y } = normalizeWheelDelta(e);
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (maxScroll <= 1) return;

        // Prefer converting vertical intent; also honor native horizontal deltas.
        const delta = (Math.abs(y) >= Math.abs(x) ? y : x) * WHEEL_SENSITIVITY;
        if (!delta) return;

        // Keep the page still while the pointer is over the carousel.
        e.preventDefault();
        e.stopPropagation();
        carousel.scrollLeft = Math.max(0, Math.min(maxScroll, carousel.scrollLeft + delta));
    };

    // Capture on the wrap so hovering cards / arrows still routes here.
    const wheelTarget = wrap || carousel;
    wheelTarget.addEventListener('wheel', onWheel, { passive: false, capture: true });

    // Pointer drag / touch swipe scrolls the carousel.
    let drag = null;

    const onPointerDown = (e) => {
        // Left mouse button, touch, or pen only.
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        drag = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startScroll: carousel.scrollLeft,
            moved: false,
            // Touch uses native overflow pan-x; mouse/pen use custom drag scroll.
            nativeTouch: e.pointerType === 'touch'
        };
        carousel.dataset.dragMoved = 'false';

        if (!drag.nativeTouch) {
            carousel.classList.add('is-dragging');
            try {
                carousel.setPointerCapture(e.pointerId);
            } catch (_) {
                // Ignore capture failures.
            }
        }
    };

    const onPointerMove = (e) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        const dx = e.clientX - drag.startX;
        if (!drag.moved && Math.abs(dx) > 6) {
            drag.moved = true;
            carousel.dataset.dragMoved = 'true';
        }
        if (drag.nativeTouch || !drag.moved) return;
        e.preventDefault();
        carousel.scrollLeft = drag.startScroll - dx;
    };

    const endDrag = (e) => {
        if (!drag || (e && e.pointerId !== drag.pointerId)) return;
        const wasMoved = drag.moved;
        drag = null;
        carousel.classList.remove('is-dragging');
        // Keep dragMoved true briefly so the click after a swipe is ignored.
        if (wasMoved) {
            carousel.dataset.dragMoved = 'true';
            window.setTimeout(() => {
                carousel.dataset.dragMoved = 'false';
            }, 80);
        } else {
            carousel.dataset.dragMoved = 'false';
        }
    };

    carousel.addEventListener('pointerdown', onPointerDown);
    carousel.addEventListener('pointermove', onPointerMove, { passive: false });
    carousel.addEventListener('pointerup', endDrag);
    carousel.addEventListener('pointercancel', endDrag);
    carousel.addEventListener('lostpointercapture', endDrag);
}

function openNoema(slug) {
    const essay = essays.get(slug);
    if (!essay) return;

    const modal = document.getElementById('noema-modal');
    const content = document.getElementById('noema-content');
    if (!modal || !content) return;

    const m = essay.metadata || {};

    content.innerHTML = `
        <div class="noema-article-header">
            <div class="noema-article-meta">
                <span><i class="fas fa-feather-pointed"></i> ${formatDate(m.date)}</span>
                ${m.readTime ? `<span><i class="fas fa-hourglass-half"></i> ${m.readTime} min read</span>` : ''}
            </div>
        </div>
        <div class="noema-article-body">${essay.html}</div>`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const scroll = modal.querySelector('.noema-scroll');
    if (scroll) scroll.scrollTop = 0;
    updateReadingProgress();

    if (window.soundManager) window.soundManager.playRandomPageSound();
}

function closeNoema() {
    const modal = document.getElementById('noema-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function updateReadingProgress() {
    const modal = document.getElementById('noema-modal');
    const scroll = modal ? modal.querySelector('.noema-scroll') : null;
    const bar = document.getElementById('noema-progress');
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

// Expose for any inline handlers / debugging.
window.openNoema = openNoema;
window.closeNoema = closeNoema;

export async function initializeNoematics() {
    const carousel = document.getElementById('noematics-grid');
    if (!carousel) return;

    // Guard against double init when the section reloads.
    if (initialized && essays.size > 0) {
        renderCards();
        bindCarouselNav();
        return;
    }

    carousel.innerHTML = `<div class="noema-loading"><i class="fas fa-spinner fa-spin"></i> Gathering the essays...</div>`;

    try {
        const manifest = await loadManifest();
        await buildEssays(manifest);
        renderCards();
        bindCarouselNav();
        initialized = true;
    } catch (err) {
        console.error('Noematics failed to initialize', err);
        carousel.innerHTML = `<div class="noema-loading">The essays could not be loaded right now.</div>`;
    }

    const modal = document.getElementById('noema-modal');
    if (modal && !modal.dataset.bound) {
        modal.dataset.bound = 'true';
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeNoema();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeNoema();
        });
        const closeBtn = modal.querySelector('.noema-close');
        if (closeBtn) closeBtn.addEventListener('click', closeNoema);
    }
}
