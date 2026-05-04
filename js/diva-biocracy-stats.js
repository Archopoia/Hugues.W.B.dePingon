/**
 * Load data/biocracy-diva-stats.json (from repo; refreshed by GitHub Action from DiVA HTML)
 * and draw compact bar charts on the BIOCRACY portfolio card.
 */

const JSON_PATH = "data/biocracy-diva-stats.json";

function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
}

function drawVerticalBars(canvas, labels, values, title, barColor) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.width;
    const cssH = canvas.height;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.scale(dpr, dpr);

    const padL = 4;
    const padR = 4;
    const padT = title ? 22 : 10;
    const padB = 36;
    const chartW = cssW - padL - padR;
    const chartH = cssH - padT - padB;
    const n = values.length;
    const maxV = Math.max(...values, 1);
    const gap = 4;
    const barW = n ? (chartW - gap * (n - 1)) / n : 0;

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(padL, padT, chartW, chartH);

    if (title) {
        const t = title.length > 44 ? `${title.slice(0, 41)}…` : title;
        ctx.fillStyle = cssVar("--text-dark", "#2a1810");
        ctx.font = "600 9px Cinzel, Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText(t, cssW / 2, 13);
    }

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

function formatSynced(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return iso;
    }
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

        if (cDl) drawVerticalBars(cDl, dl.labels, dl.series, dl.title, red);
        if (cVis) drawVerticalBars(cVis, vis.labels, vis.series, vis.title, teal);

        const nDl = root.querySelector("[data-diva-total-downloads]");
        const nVis = root.querySelector("[data-diva-total-visits]");
        if (nDl) nDl.textContent = String(dl.total);
        if (nVis) nVis.textContent = String(vis.total);

        const syncEl = root.querySelector("[data-diva-synced-at]");
        if (syncEl && data.scrapedAt) {
            syncEl.textContent = formatSynced(data.scrapedAt);
            syncEl.setAttribute("datetime", data.scrapedAt);
        }

        root.removeAttribute("hidden");
        root.dataset.divaStatsRendered = "1";
    } catch {
        /* keep hidden; optional manual JSON later */
    }
}
