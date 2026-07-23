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
let categories = [];
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

function categoryById(id) {
    return categories.find(c => c.id === id) || { id, label: id, icon: 'fa-scroll' };
}

async function loadManifest() {
    const response = await fetch(`${CONTENT_DIR}/manifest.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load Noematics manifest');
    return response.json();
}

async function buildEssays(manifest) {
    categories = Array.isArray(manifest.categories) ? manifest.categories : [];
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

function renderCategoryFilter() {
    const container = document.getElementById('noematics-categories');
    if (!container) return;

    const buttons = [`
        <button class="noema-cat-btn btn-nav active" data-category="all">
            <i class="fas fa-book"></i>
            <span>All Essays</span>
        </button>`];

    categories.forEach(cat => {
        buttons.push(`
        <button class="noema-cat-btn btn-nav" data-category="${cat.id}">
            <i class="fas ${cat.icon || 'fa-scroll'}"></i>
            <span>${cat.label}</span>
        </button>`);
    });

    container.innerHTML = buttons.join('');

    container.querySelectorAll('.noema-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.noema-cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterEssays(btn.dataset.category);
            if (window.soundManager) window.soundManager.playRandomPageSound();
        });
    });
}

function renderCards() {
    const grid = document.getElementById('noematics-grid');
    if (!grid) return;

    const ordered = Array.from(essays.values()).sort((a, b) => a.order - b.order);

    grid.innerHTML = ordered.map(essay => {
        const m = essay.metadata || {};
        const cat = categoryById(m.category);
        const tags = (m.tags ? String(m.tags).split(',') : [])
            .map(t => t.trim())
            .filter(Boolean)
            .map(t => `<span class="noema-tag"><i class="fas fa-tag"></i> ${t}</span>`)
            .join('');

        return `
        <article class="noema-card" data-category="${m.category || ''}" data-slug="${essay.slug}">
            <div class="noema-card-ribbon">
                <i class="fas ${cat.icon}"></i>
                <span>${cat.label}</span>
            </div>
            <h3 class="noema-card-title">${m.title || essay.slug}</h3>
            <div class="noema-card-meta">
                <span><i class="fas fa-feather-pointed"></i> ${formatDate(m.date)}</span>
                ${m.readTime ? `<span><i class="fas fa-hourglass-half"></i> ${m.readTime} min</span>` : ''}
            </div>
            ${m.question ? `<p class="noema-card-question"><i class="fas fa-circle-question"></i> ${m.question}</p>` : ''}
            <p class="noema-card-excerpt">${m.excerpt || ''}</p>
            <div class="noema-card-tags">${tags}</div>
            <button class="noema-read-btn btn-action" type="button">
                <i class="fas fa-book-open"></i>
                <span>Read the essay</span>
            </button>
        </article>`;
    }).join('');

    grid.querySelectorAll('.noema-card').forEach(card => {
        const slug = card.dataset.slug;
        card.querySelector('.noema-read-btn').addEventListener('click', () => openNoema(slug));
    });
}

function filterEssays(category) {
    const cards = document.querySelectorAll('.noema-card');
    const empty = document.getElementById('noematics-empty');
    let visible = 0;

    cards.forEach(card => {
        const match = category === 'all' || card.dataset.category === category;
        card.style.display = match ? '' : 'none';
        if (match) visible++;
    });

    if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
}

function searchEssays(query) {
    const q = query.trim().toLowerCase();
    const cards = document.querySelectorAll('.noema-card');
    const empty = document.getElementById('noematics-empty');
    let visible = 0;

    cards.forEach(card => {
        const essay = essays.get(card.dataset.slug);
        const m = (essay && essay.metadata) || {};
        const haystack = [m.title, m.question, m.excerpt, m.tags]
            .filter(Boolean).join(' ').toLowerCase();
        const match = q === '' || haystack.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) visible++;
    });

    if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
}

function openNoema(slug) {
    const essay = essays.get(slug);
    if (!essay) return;

    const modal = document.getElementById('noema-modal');
    const content = document.getElementById('noema-content');
    if (!modal || !content) return;

    const m = essay.metadata || {};
    const cat = categoryById(m.category);

    content.innerHTML = `
        <div class="noema-article-header">
            <span class="noema-article-cat"><i class="fas ${cat.icon}"></i> ${cat.label}</span>
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
    const grid = document.getElementById('noematics-grid');
    if (!grid) return;

    // Guard against double init when the section reloads.
    if (initialized && essays.size > 0) {
        renderCategoryFilter();
        renderCards();
        return;
    }

    grid.innerHTML = `<div class="noema-loading"><i class="fas fa-spinner fa-spin"></i> Gathering the essays...</div>`;

    try {
        const manifest = await loadManifest();
        await buildEssays(manifest);
        renderCategoryFilter();
        renderCards();
        initialized = true;
    } catch (err) {
        console.error('Noematics failed to initialize', err);
        grid.innerHTML = `<div class="noema-loading">The essays could not be loaded right now.</div>`;
    }

    const searchInput = document.getElementById('noematics-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => searchEssays(e.target.value));
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
