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
    if (!carousel || !prev || !next || carousel.dataset.navBound === 'true') return;

    carousel.dataset.navBound = 'true';

    const scrollByCard = (direction) => {
        const card = carousel.querySelector('.noema-card');
        const step = card ? card.getBoundingClientRect().width + 16 : 240;
        carousel.scrollBy({ left: direction * step, behavior: 'smooth' });
        if (window.soundManager) window.soundManager.playRandomPageSound();
    };

    prev.addEventListener('click', () => scrollByCard(-1));
    next.addEventListener('click', () => scrollByCard(1));

    // Vertical wheel / trackpad over the carousel scrolls it horizontally.
    const onWheel = (e) => {
        const mostlyVertical = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
        if (!mostlyVertical) return;
        if (carousel.scrollWidth <= carousel.clientWidth) return;

        e.preventDefault();
        const previousBehavior = carousel.style.scrollBehavior;
        carousel.style.scrollBehavior = 'auto';
        carousel.scrollLeft += e.deltaY + e.deltaX;
        carousel.style.scrollBehavior = previousBehavior;
    };

    const wheelTarget = wrap || carousel;
    wheelTarget.addEventListener('wheel', onWheel, { passive: false });

    // Track drag/swipe so a touch-drag does not accidentally open a card.
    let pointerActive = false;
    let startX = 0;
    let startY = 0;

    const onPointerDown = (e) => {
        pointerActive = true;
        startX = e.clientX;
        startY = e.clientY;
        carousel.dataset.dragMoved = 'false';
    };

    const onPointerMove = (e) => {
        if (!pointerActive) return;
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);
        if (dx > 8 || dy > 8) {
            carousel.dataset.dragMoved = 'true';
        }
    };

    const onPointerUp = () => {
        pointerActive = false;
        // Keep dragMoved true briefly so the click that follows a swipe is ignored.
        window.setTimeout(() => {
            carousel.dataset.dragMoved = 'false';
        }, 50);
    };

    carousel.addEventListener('pointerdown', onPointerDown);
    carousel.addEventListener('pointermove', onPointerMove);
    carousel.addEventListener('pointerup', onPointerUp);
    carousel.addEventListener('pointercancel', onPointerUp);
    carousel.addEventListener('pointerleave', () => {
        if (pointerActive) onPointerUp();
    });
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
