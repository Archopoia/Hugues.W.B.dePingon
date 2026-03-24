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
    monthsContainer.style.gridTemplateColumns = `repeat(${weeks}, 1fr)`;

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
    gridContainer.style.gridTemplateColumns = `repeat(${weeks}, 11px)`;
    gridContainer.style.gridTemplateRows = `repeat(${HEATMAP_ROWS}, 11px)`;

    days.forEach((day, index) => {
        const cell = document.createElement('div');
        const level = Number.isFinite(day.level) ? day.level : 0;
        cell.className = `github-cell level-${Math.max(0, Math.min(level, 4))}`;
        cell.title = `${day.count} contributions on ${formatDateLabel(day.date)}`;
        cell.style.gridColumn = `${Math.floor(index / HEATMAP_ROWS) + 1}`;
        cell.style.gridRow = `${(index % HEATMAP_ROWS) + 1}`;
        gridContainer.appendChild(cell);
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
