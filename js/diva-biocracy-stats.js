/**
 * Load data/biocracy-diva-stats.json (from repo; refreshed by GitHub Action from DiVA HTML)
 * and draw compact bar charts on the BIOCRACY portfolio card.
 */

const JSON_PATH = "data/biocracy-diva-stats.json";

function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
}

function drawVerticalBars(canvas, labels, values, barColor) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.width;
    const cssH = canvas.height;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.scale(dpr, dpr);

    const padL = 4;
    const padR = 4;
    const padT = 4;
    const padB = 34;
    const chartW = cssW - padL - padR;
    const chartH = cssH - padT - padB;
    const n = values.length;
    const maxV = Math.max(...values, 1);
    const gap = 4;
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
    ctx.font = "9px system-ui, sans-serif";
    ctx.textAlign = "center";
    labels.forEach((lab, i) => {
        const cx = padL + i * (barW + gap) + barW / 2;
        const short = lab.replace(/\s*-\d{2}$/, "");
        ctx.save();
        ctx.translate(cx, padT + chartH + 6);
        ctx.rotate(-Math.PI / 5);
        ctx.textAlign = "right";
        ctx.fillText(short, 0, 0);
        ctx.restore();
    });
}

/** e.g. 75 → 70+, 8 → 8+ */
function downloadFloorPlus(total) {
    const n = Number(total);
    if (!Number.isFinite(n) || n < 0) return "0+";
    const flo = Math.floor(n / 10) * 10;
    const base = flo > 0 ? flo : n;
    return `${base}+`;
}

/** e.g. 5343 → 5000+, 842 → 0+ then use total */
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

export function refreshDivaBiocracyLegends() {
    const root = document.querySelector(".academic-card--diva [data-diva-stats-root]");
    if (!root?.dataset.dlTotal || !root.dataset.visTotal) return;
    const legDl = root.querySelector("[data-diva-legend-downloads]");
    const legVis = root.querySelector("[data-diva-legend-visits]");
    if (legDl) legDl.textContent = legendDownloads(root.dataset.dlTotal);
    if (legVis) legVis.textContent = legendVisits(root.dataset.visTotal);
}

export async function initDivaBiocracyStats() {
    const card = document.querySelector(".academic-card--diva");
    const root = card?.querySelector("[data-diva-stats-root]");
    if (!card || !root || root.dataset.divaStatsRendered === "1") return;

    try {
        const res = await fetch(JSON_PATH, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        const dl = data.downloads;
        const vis = data.visits;
        if (!dl?.series?.length || !vis?.series?.length) throw new Error("bad json shape");

        const cDl = root.querySelector('canvas[data-diva-chart="downloads"]');
        const cVis = root.querySelector('canvas[data-diva-chart="visits"]');
        const red = cssVar("--red-theme", "#8b1a1a");
        const teal = cssVar("--teal-theme", "#2a6f6f");

        if (cDl) drawVerticalBars(cDl, dl.labels, dl.series, red);
        if (cVis) drawVerticalBars(cVis, vis.labels, vis.series, teal);

        const legDl = root.querySelector("[data-diva-legend-downloads]");
        const legVis = root.querySelector("[data-diva-legend-visits]");
        root.dataset.dlTotal = String(dl.total);
        root.dataset.visTotal = String(vis.total);
        if (legDl) legDl.textContent = legendDownloads(dl.total);
        if (legVis) legVis.textContent = legendVisits(vis.total);

        root.removeAttribute("hidden");
        root.dataset.divaStatsRendered = "1";
    } catch {
        /* keep hidden; optional manual JSON later */
    }
}

window.refreshDivaBiocracyLegends = refreshDivaBiocracyLegends;
