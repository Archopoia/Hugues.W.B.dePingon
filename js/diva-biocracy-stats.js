/**
 * Shared DiVA-mirrored stats (data/biocracy-diva-stats.json) for portfolio BIOCRACY card
 * and About-page thesis teaser.
 */

let statsJsonCache = null;

/** Resolve JSON URL reliably on GitHub Pages (/repo/) and when opened locally via HTTP server */
function getBiocracyStatsJsonUrls() {
    const urls = [];
    try {
        urls.push(new URL("data/biocracy-diva-stats.json", window.location.href).href);
    } catch {
        /* ignore */
    }
    try {
        urls.push(new URL("data/biocracy-diva-stats.json", document.baseURI || window.location.href).href);
    } catch {
        urls.push("data/biocracy-diva-stats.json");
    }
    try {
        urls.push(new URL("../data/biocracy-diva-stats.json", import.meta.url).href);
    } catch {
        /* import.meta unavailable */
    }
    return [...new Set(urls)];
}

function parseEmbeddedBiocracyStats() {
    const el = document.getElementById("biocracy-diva-stats-embedded");
    if (!el?.textContent?.trim()) return null;
    try {
        const data = JSON.parse(el.textContent);
        const dl = data.downloads;
        const vis = data.visits;
        if (!dl?.series?.length || !vis?.series?.length) return null;
        return data;
    } catch {
        return null;
    }
}

function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
}

async function getBiocracyDivaStats() {
    if (statsJsonCache) return statsJsonCache;
    let lastErr = null;
    for (const url of getBiocracyStatsJsonUrls()) {
        try {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) throw new Error(String(res.status));
            const data = await res.json();
            const dl = data.downloads;
            const vis = data.visits;
            if (!dl?.series?.length || !vis?.series?.length) throw new Error("bad json shape");
            statsJsonCache = data;
            return data;
        } catch (e) {
            lastErr = e;
        }
    }
    const embedded = parseEmbeddedBiocracyStats();
    if (embedded) {
        statsJsonCache = embedded;
        return embedded;
    }
    throw lastErr || new Error("Could not load biocracy-diva-stats.json");
}

/**
 * @param {boolean} compact - smaller padding & tick labels (About teaser)
 */
function drawVerticalBars(canvas, labels, values, barColor, compact = false) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.width;
    const cssH = canvas.height;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.scale(dpr, dpr);

    const padL = compact ? 2 : 4;
    const padR = compact ? 2 : 4;
    const padT = compact ? 2 : 4;
    const padB = compact ? 20 : 34;
    const chartW = cssW - padL - padR;
    const chartH = cssH - padT - padB;
    const n = values.length;
    const maxV = Math.max(...values, 1);
    const gap = compact ? 2 : 4;
    const barW = n ? (chartW - gap * (n - 1)) / n : 0;

    ctx.clearRect(0, 0, cssW, cssH);

    values.forEach((v, i) => {
        const h = (v / maxV) * (chartH - 2);
        const x = padL + i * (barW + gap);
        const y = padT + chartH - h;
        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, barW, h);
    });

    ctx.fillStyle = cssVar("--border-brown", "#5c4033");
    ctx.font = compact ? "6px system-ui, sans-serif" : "9px system-ui, sans-serif";
    ctx.textAlign = "center";
    const rot = compact ? -Math.PI / 6 : -Math.PI / 5;
    labels.forEach((lab, i) => {
        const cx = padL + i * (barW + gap) + barW / 2;
        const short = lab.replace(/\s*-\d{2}$/, "");
        ctx.save();
        ctx.translate(cx, padT + chartH + (compact ? 3 : 6));
        ctx.rotate(rot);
        ctx.textAlign = "right";
        ctx.fillText(short, 0, 0);
        ctx.restore();
    });
}

function downloadFloorPlus(total) {
    const n = Number(total);
    if (!Number.isFinite(n) || n < 0) return "0+";
    const flo = Math.floor(n / 10) * 10;
    const base = flo > 0 ? flo : n;
    return `${base}+`;
}

function visitsFloorThousandsPlus(total) {
    const n = Number(total);
    if (!Number.isFinite(n) || n < 0) return "0+";
    const flo = Math.floor(n / 1000) * 1000;
    const base = flo > 0 ? flo : n;
    return `${base}+`;
}

function legendDownloads(total) {
    const t = typeof window.getTranslation === "function" ? window.getTranslation("port-biocracy-stats-dl-suffix") : "downloads";
    return `${downloadFloorPlus(total)} ${t}`;
}

function legendVisits(total) {
    const t = typeof window.getTranslation === "function" ? window.getTranslation("port-biocracy-stats-vis-suffix") : "visits";
    return `${visitsFloorThousandsPlus(total)} ${t}`;
}

function applyLegendsToRoot(root, dlTotal, visTotal) {
    if (!root) return;
    root.dataset.dlTotal = String(dlTotal);
    root.dataset.visTotal = String(visTotal);
    const legDl = root.querySelector("[data-diva-legend-downloads], [data-about-legend-dl]");
    const legVis = root.querySelector("[data-diva-legend-visits], [data-about-legend-vis]");
    if (legDl) legDl.textContent = legendDownloads(dlTotal);
    if (legVis) legVis.textContent = legendVisits(visTotal);
}

export function refreshDivaBiocracyLegends() {
    const portfolioRoot = document.querySelector(".academic-card--diva [data-diva-stats-root]");
    if (portfolioRoot?.dataset.dlTotal && portfolioRoot.dataset.visTotal) {
        const legDl = portfolioRoot.querySelector("[data-diva-legend-downloads]");
        const legVis = portfolioRoot.querySelector("[data-diva-legend-visits]");
        if (legDl) legDl.textContent = legendDownloads(portfolioRoot.dataset.dlTotal);
        if (legVis) legVis.textContent = legendVisits(portfolioRoot.dataset.visTotal);
    }
    const aboutRoot = document.querySelector("[data-about-thesis-teaser]");
    if (aboutRoot?.dataset.dlTotal && aboutRoot.dataset.visTotal) {
        const aDl = aboutRoot.querySelector("[data-about-legend-dl]");
        const aVis = aboutRoot.querySelector("[data-about-legend-vis]");
        if (aDl) aDl.textContent = legendDownloads(aboutRoot.dataset.dlTotal);
        if (aVis) aVis.textContent = legendVisits(aboutRoot.dataset.visTotal);
    }
}

export async function initDivaBiocracyStats() {
    const card = document.querySelector(".academic-card--diva");
    const root = card?.querySelector("[data-diva-stats-root]");
    if (!card || !root || root.dataset.divaStatsRendered === "1") return;

    try {
        const data = await getBiocracyDivaStats();
        const dl = data.downloads;
        const vis = data.visits;

        const cDl = root.querySelector('canvas[data-diva-chart="downloads"]');
        const cVis = root.querySelector('canvas[data-diva-chart="visits"]');
        const red = cssVar("--red-theme", "#8b1a1a");
        const teal = cssVar("--teal-theme", "#517c78");

        if (cDl) drawVerticalBars(cDl, dl.labels, dl.series, red, false);
        if (cVis) drawVerticalBars(cVis, vis.labels, vis.series, teal, false);

        applyLegendsToRoot(root, dl.total, vis.total);

        root.removeAttribute("hidden");
        root.dataset.divaStatsRendered = "1";
    } catch {
        /* keep hidden */
    }
}

export async function initAboutThesisTeaser() {
    const root = document.querySelector("[data-about-thesis-teaser]");
    if (!root || root.dataset.aboutThesisInit === "1") return;
    if (root.dataset.aboutThesisPending === "1") return;
    root.dataset.aboutThesisPending = "1";

    const chartsEl = root.querySelector("[data-about-thesis-charts]");

    try {
        const data = await getBiocracyDivaStats();
        const dl = data.downloads;
        const vis = data.visits;

        const cDl = root.querySelector('canvas[data-about-diva-chart="downloads"]');
        const cVis = root.querySelector('canvas[data-about-diva-chart="visits"]');
        const red = cssVar("--red-theme", "#8b1a1a");
        const teal = cssVar("--teal-theme", "#517c78");

        if (cDl) drawVerticalBars(cDl, dl.labels, dl.series, red, true);
        if (cVis) drawVerticalBars(cVis, vis.labels, vis.series, teal, true);

        applyLegendsToRoot(root, dl.total, vis.total);

        if (chartsEl) {
            chartsEl.removeAttribute("hidden");
            chartsEl.setAttribute("aria-hidden", "false");
        }
        root.dataset.aboutThesisInit = "1";
    } catch {
        /* Link line stays visible; charts stay hidden if JSON missing (e.g. file://) */
        if (chartsEl) {
            chartsEl.setAttribute("aria-hidden", "true");
        }
    } finally {
        delete root.dataset.aboutThesisPending;
    }
}

window.refreshDivaBiocracyLegends = refreshDivaBiocracyLegends;
