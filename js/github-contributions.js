const CONTRIBUTIONS_API_URL = 'https://github-contributions-api.jogruber.de/v4/Archopoia?y=last';
const HEATMAP_ROWS = 7;

function formatMonth(date) {
    return date.toLocaleString('en-US', { month: 'short' });
}

function formatDateLabel(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function toISODateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addDays(date, daysToAdd) {
    const result = new Date(date);
    result.setDate(result.getDate() + daysToAdd);
    return result;
}

function buildCompleteCalendar(contributions) {
    const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length === 0) {
        return { days: [], weeks: 0 };
    }

    const byDate = new Map(sorted.map((entry) => [entry.date, entry]));
    const firstDate = new Date(`${sorted[0].date}T00:00:00`);
    const lastDate = new Date(`${sorted[sorted.length - 1].date}T00:00:00`);

    // GitHub-style layout: full weeks (Sun-Sat), column per week.
    const start = new Date(firstDate);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(lastDate);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const days = [];
    const cursor = new Date(start);

    while (cursor <= end) {
        const isoDate = toISODateLocal(cursor);
        const entry = byDate.get(isoDate) || { date: isoDate, count: 0, level: 0 };
        days.push(entry);
        cursor.setDate(cursor.getDate() + 1);
    }

    return {
        days,
        weeks: Math.ceil(days.length / HEATMAP_ROWS)
    };
}

function renderMonths(days, weeks, monthsContainer) {
    monthsContainer.innerHTML = '';
    monthsContainer.style.gridTemplateColumns = `repeat(${weeks}, var(--github-cell-size, 11px))`;

    let lastLabeledMonth = -1;

    for (let week = 0; week < weeks; week += 1) {
        const weekStartIndex = week * HEATMAP_ROWS;
        const monthItem = document.createElement('span');
        monthItem.className = 'github-heatmap-month';

        // Label first week, then week columns where month changes (first day-of-month within that week).
        for (let dayOffset = 0; dayOffset < HEATMAP_ROWS; dayOffset += 1) {
            const day = days[weekStartIndex + dayOffset];
            if (!day) {
                continue;
            }

            const dayDate = new Date(`${day.date}T00:00:00`);
            const dayMonth = dayDate.getMonth();
            const shouldLabelFirstWeek = week === 0 && dayOffset === 0;
            const shouldLabelMonthChange = dayDate.getDate() === 1 && dayMonth !== lastLabeledMonth;

            if (shouldLabelFirstWeek || shouldLabelMonthChange) {
                monthItem.textContent = formatMonth(dayDate);
                lastLabeledMonth = dayMonth;
                break;
            }
        }

        monthsContainer.appendChild(monthItem);
    }
}

function renderHeatmap(days, weeks, gridContainer) {
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${weeks}, var(--github-cell-size, 11px))`;
    gridContainer.style.gridTemplateRows = `repeat(${HEATMAP_ROWS}, var(--github-cell-size, 11px))`;

    days.forEach((day, index) => {
        const cell = document.createElement('div');
        const level = Number.isFinite(day.level) ? day.level : 0;
        cell.className = `github-cell level-${Math.max(0, Math.min(level, 4))}`;
        cell.title = `${day.count} contributions on ${formatDateLabel(day.date)}`;
        const column = Math.floor(index / HEATMAP_ROWS) + 1;
        const row = (index % HEATMAP_ROWS) + 1;
        cell.style.gridColumn = `${column}`;
        cell.style.gridRow = `${row}`;
        // Keep column index available for CSS-driven heatmap effects.
        cell.style.setProperty('--wave-col', `${column - 1}`);
        cell.dataset.col = `${column}`;
        cell.dataset.row = `${row}`;
        gridContainer.appendChild(cell);
    });

    setupCursorRipple(gridContainer);
}

function setupCursorRipple(gridContainer) {
    const cells = Array.from(gridContainer.querySelectorAll('.github-cell'));
    if (cells.length === 0) {
        return;
    }

    let lastOriginKey = '';
    let hoveredCell = null;
    const MIN_RIPPLE_DISTANCE = 1.5; // Excludes the 3x3 center area around cursor.
    const MAX_RIPPLE_DISTANCE = 12.0; // Slightly further propagation.

    function clearRipple() {
        cells.forEach((cell) => {
            cell.classList.remove('ripple-active');
            cell.classList.remove('ripple-clear');
            cell.classList.remove('hover-origin');
            cell.style.removeProperty('--ripple-delay');
            cell.style.removeProperty('--ripple-strength');
        });
        hoveredCell = null;
    }

    function applyRippleField(originCell) {
        const originCol = Number(originCell.dataset.col || 1);
        const originRow = Number(originCell.dataset.row || 1);
        const maxDistance = cells.reduce((max, cell) => {
            const col = Number(cell.dataset.col || 1);
            const row = Number(cell.dataset.row || 1);
            const deltaCol = col - originCol;
            const deltaRow = row - originRow;
            const distance = Math.sqrt(deltaCol * deltaCol + deltaRow * deltaRow);
            return Math.max(max, distance);
        }, 0);
        const effectiveMaxDistance = Math.min(maxDistance, MAX_RIPPLE_DISTANCE);
        const usableSpan = Math.max(0.001, effectiveMaxDistance - MIN_RIPPLE_DISTANCE);

        cells.forEach((cell) => {
            const col = Number(cell.dataset.col || 1);
            const row = Number(cell.dataset.row || 1);
            const deltaCol = col - originCol;
            const deltaRow = row - originRow;
            const distance = Math.sqrt(deltaCol * deltaCol + deltaRow * deltaRow);
            const isCenterCell = distance === 0;
            const isInnerRingCell = distance > 0 && distance <= MIN_RIPPLE_DISTANCE;

            if (isCenterCell) {
                // Center cell stays untouched: keep its original contribution color.
                cell.classList.remove('ripple-active');
                cell.classList.remove('ripple-clear');
                cell.style.removeProperty('--ripple-delay');
                cell.style.removeProperty('--ripple-strength');
            } else if (isInnerRingCell) {
                // Force the 8 surrounding cells in the 3x3 area to stay transparent.
                cell.classList.remove('ripple-active');
                cell.classList.add('ripple-clear');
                cell.style.removeProperty('--ripple-delay');
                cell.style.removeProperty('--ripple-strength');
            } else if (distance <= effectiveMaxDistance) {
                const normalized = Math.min(1, (distance - MIN_RIPPLE_DISTANCE) / usableSpan);
                const delay = Math.round(normalized * 360);
                // Radial profile: low near inner edge, brightest at midpoint, low at outer edge.
                const midpointFalloff = Math.abs(normalized - 0.5) * 2;
                const ringProfile = Math.max(0.2, 1 - midpointFalloff);
                // Additional attenuation: farther cells are dimmer.
                const attenuation = Math.max(0.12, 1 - Math.pow(normalized, 1.15));
                const strength = Math.max(0.1, ringProfile * attenuation);
                cell.style.setProperty('--ripple-delay', `${delay}ms`);
                cell.style.setProperty('--ripple-strength', strength.toFixed(3));
                cell.classList.remove('ripple-clear');
                cell.classList.add('ripple-active');
            } else {
                cell.classList.remove('ripple-active');
                cell.classList.remove('ripple-clear');
                cell.style.removeProperty('--ripple-delay');
                cell.style.removeProperty('--ripple-strength');
            }
        });
    }

    gridContainer.addEventListener('mousemove', (event) => {
        const targetCell = event.target.closest('.github-cell');
        if (!targetCell || !gridContainer.contains(targetCell)) {
            return;
        }

        if (hoveredCell !== targetCell) {
            if (hoveredCell) {
                hoveredCell.classList.remove('hover-origin');
            }
            hoveredCell = targetCell;
            hoveredCell.classList.add('hover-origin');
        }

        const originKey = `${targetCell.dataset.col}-${targetCell.dataset.row}`;
        if (originKey !== lastOriginKey) {
            lastOriginKey = originKey;
            applyRippleField(targetCell);
        }
    });

    gridContainer.addEventListener('mouseleave', () => {
        clearRipple();
        lastOriginKey = '';
    });
}

async function loadGitHubHeatmap() {
    const monthsContainer = document.getElementById('github-heatmap-months');
    const gridContainer = document.getElementById('github-heatmap-grid');

    if (!monthsContainer || !gridContainer) {
        return;
    }

    gridContainer.innerHTML = '<p class="github-heatmap-loading">Loading contributions...</p>';

    try {
        const response = await fetch(CONTRIBUTIONS_API_URL);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const contributions = Array.isArray(payload?.contributions) ? payload.contributions : [];

        if (contributions.length === 0) {
            throw new Error('No contributions found');
        }

        const { days, weeks } = buildCompleteCalendar(contributions);
        renderMonths(days, weeks, monthsContainer);
        renderHeatmap(days, weeks, gridContainer);
    } catch (error) {
        monthsContainer.innerHTML = '';
        gridContainer.innerHTML = '<p class="github-heatmap-error">Unable to load contribution data right now.</p>';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGitHubHeatmap);
} else {
    loadGitHubHeatmap();
}
