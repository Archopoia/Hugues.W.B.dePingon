/**
 * ARCHIVED (2026-07-23): GitHub contributions heatmap + snake easter egg.
 * No longer loaded by script.js. Restore by importing this file and putting
 * the former .github-contributions markup back in index.html.
 */
const CONTRIBUTIONS_API_URL = 'https://github-contributions-api.jogruber.de/v4/Archopoia?y=last';
const HEATMAP_ROWS = 7;
const SNAKE_START_DELAY_MS = 900;
const SNAKE_TICK_MS = 170;
const SNAKE_WAVE_STEP_MS = 24;
const SNAKE_WAVE_DURATION_MS = 680;
const SNAKE_ENDLESS_FOOD_INTERVAL_MS = 5000;
const SNAKE_ENDLESS_MAX_FOOD = 25;
const SNAKE_ENDLESS_COVERAGE_RATIO = 2 / 3;
const SNAKE_WALL_SPAWN_INTERVAL_MS = 10000;
const SNAKE_WALL_PULSE_MS = 750;
const SNAKE_ROW_BLADE_INTERVAL_MS = 15000;
/** Slow ramp: 10s to reach max intensity, then cut. */
const SNAKE_ROW_BLADE_PULSE_MS = 10000;
const SNAKE_ROW_BLADE_CUT_AT_MS = 10000;
/** Length required to push N contiguous walls: N × this (e.g. 2 walls need 10 segments). */
const SNAKE_PUSH_LENGTH_PER_WALL = 5;
/** Push moves use interval = SNAKE_TICK_MS / ratio; ratio scales between these with snake length. */
const SNAKE_PUSH_SPEED_MIN_RATIO = 0.5;
const SNAKE_PUSH_SPEED_MAX_RATIO = 0.8;
const SNAKE_PUSH_SPEED_LEN_RANGE = 40;
/**
 * Only the three weekday rows shown beside the grid (.github-heatmap-weekdays span grid-row 2 / 4 / 6 in header.css).
 * Blade must never use rows 1,3,5,7 (unlabeled bands).
 */
const SNAKE_BLADE_WEEKDAY_ROWS = Object.freeze([2, 4, 6]);
const SNAKE_STATS_CACHE_KEY = 'githubHeatmapSnakeStats_v1';
let lastHeatmapData = null;

const HEATMAP_TEXT = {
    en: {
        title: 'GITHUB PORTFOLIO &amp; CONTRIBUTIONS',
        weekdays: ['Mon', 'Wed', 'Fri'],
        aria: 'GitHub contribution squares with month and weekday axes',
        loading: 'Loading contributions...',
        error: 'Unable to load contribution data right now.',
        tooltipSuffix: 'contributions on'
    },
    fr: {
        title: 'PORTFOLIO GITHUB &amp; CONTRIBUTIONS',
        weekdays: ['Lun', 'Mer', 'Ven'],
        aria: 'Grille des contributions GitHub avec axes des mois et des jours',
        loading: 'Chargement des contributions...',
        error: 'Impossible de charger les contributions pour le moment.',
        tooltipSuffix: 'contributions le'
    }
};

function getHeatmapLang() {
    return document.documentElement.lang && document.documentElement.lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

function formatMonth(date) {
    const locale = getHeatmapLang() === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleString(locale, { month: 'short' });
}

function formatDateLabel(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    const locale = getHeatmapLang() === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function applyHeatmapLanguage() {
    const lang = getHeatmapLang();
    const ui = HEATMAP_TEXT[lang];

    const title = document.querySelector('.github-contributions-title');
    if (title) {
        title.innerHTML = `<i class="fab fa-github" aria-hidden="true"></i> ${ui.title}`;
    }

    const weekdays = document.querySelectorAll('.github-heatmap-weekdays span');
    ui.weekdays.forEach((label, index) => {
        if (weekdays[index]) {
            weekdays[index].textContent = label;
        }
    });

    const grid = document.getElementById('github-heatmap-grid');
    if (grid) {
        grid.setAttribute('aria-label', ui.aria);

        const cells = grid.querySelectorAll('.github-cell');
        cells.forEach((cell) => {
            const count = Number(cell.dataset.count || 0);
            const date = cell.dataset.date;
            if (date) {
                cell.title = `${count} ${ui.tooltipSuffix} ${formatDateLabel(date)}`;
            }
        });
    }

    if (lastHeatmapData) {
        const monthsContainer = document.getElementById('github-heatmap-months');
        if (monthsContainer) {
            renderMonths(lastHeatmapData.days, lastHeatmapData.weeks, monthsContainer);
        }
    }
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

/** Week columns where the month header shows a new label (first column + month boundaries). */
function buildMonthStartColumnSet(days, weeks) {
    const cols = new Set();
    if (!days?.length || weeks < 1) {
        return cols;
    }
    let lastLabeledMonth = -1;
    for (let week = 0; week < weeks; week += 1) {
        const weekStartIndex = week * HEATMAP_ROWS;
        for (let dayOffset = 0; dayOffset < HEATMAP_ROWS; dayOffset += 1) {
            const day = days[weekStartIndex + dayOffset];
            if (!day) {
                continue;
            }
            const dayDate = new Date(`${day.date}T00:00:00`);
            if (Number.isNaN(dayDate.getTime())) {
                continue;
            }
            const dayMonth = dayDate.getMonth();
            const shouldLabelFirstWeek = week === 0 && dayOffset === 0;
            const shouldLabelMonthChange = dayDate.getDate() === 1 && dayMonth !== lastLabeledMonth;

            if (shouldLabelFirstWeek || shouldLabelMonthChange) {
                cols.add(week + 1);
                lastLabeledMonth = dayMonth;
                break;
            }
        }
    }
    return cols;
}

function renderHeatmap(days, weeks, gridContainer) {
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${weeks}, var(--github-cell-size, 11px))`;
    gridContainer.style.gridTemplateRows = `repeat(${HEATMAP_ROWS}, var(--github-cell-size, 11px))`;

    days.forEach((day, index) => {
        const cell = document.createElement('div');
        const level = Number.isFinite(day.level) ? day.level : 0;
        cell.className = `github-cell level-${Math.max(0, Math.min(level, 4))}`;
        const tooltipSuffix = HEATMAP_TEXT[getHeatmapLang()].tooltipSuffix;
        cell.title = `${day.count} ${tooltipSuffix} ${formatDateLabel(day.date)}`;
        const column = Math.floor(index / HEATMAP_ROWS) + 1;
        const row = (index % HEATMAP_ROWS) + 1;
        cell.style.gridColumn = `${column}`;
        cell.style.gridRow = `${row}`;
        // Keep column index available for CSS-driven heatmap effects.
        cell.style.setProperty('--wave-col', `${column - 1}`);
        cell.dataset.col = `${column}`;
        cell.dataset.row = `${row}`;
        cell.dataset.count = `${Number.isFinite(day.count) ? day.count : 0}`;
        cell.dataset.date = day.date;
        gridContainer.appendChild(cell);
    });

    setupCursorRipple(gridContainer);
    setupSnakeGame(gridContainer, weeks, days);
}

function setupCursorRipple(gridContainer) {
    const cells = Array.from(gridContainer.querySelectorAll('.github-cell'));
    if (cells.length === 0) {
        return;
    }

    let lastOriginKey = '';
    let hoveredCell = null;
    let ripplePhaseA = false;
    const MIN_RIPPLE_DISTANCE = 1.5; // Excludes the 3x3 center area around cursor.
    const MAX_RIPPLE_DISTANCE = 6.0; // Slightly further propagation.

    function clearRipple() {
        cells.forEach((cell) => {
            cell.classList.remove('ripple-active');
            cell.classList.remove('ripple-fading');
            cell.classList.remove('ripple-clear');
            cell.classList.remove('hover-origin');
            cell.style.removeProperty('--ripple-delay');
            cell.style.removeProperty('--ripple-strength');
        });
        gridContainer.classList.remove('ripple-phase-a', 'ripple-phase-b');
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
                cell.classList.add('ripple-fading');
                cell.classList.remove('ripple-clear');
                cell.style.removeProperty('--ripple-delay');
                cell.style.removeProperty('--ripple-strength');
            } else if (isInnerRingCell) {
                // Force the 8 surrounding cells in the 3x3 area to stay transparent.
                cell.classList.remove('ripple-active');
                cell.classList.add('ripple-fading');
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
                cell.classList.remove('ripple-fading');
                cell.classList.remove('ripple-clear');
                cell.classList.add('ripple-active');
            } else {
                cell.classList.remove('ripple-active');
                cell.classList.add('ripple-fading');
                cell.classList.remove('ripple-clear');
                cell.style.removeProperty('--ripple-delay');
                cell.style.removeProperty('--ripple-strength');
            }
        });
    }

    gridContainer.addEventListener('mousemove', (event) => {
        if (gridContainer.classList.contains('snake-game-active')) {
            return;
        }

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
            // Reset ripple phase on each newly hovered cell to avoid ripple collisions.
            ripplePhaseA = !ripplePhaseA;
            gridContainer.classList.toggle('ripple-phase-a', ripplePhaseA);
            gridContainer.classList.toggle('ripple-phase-b', !ripplePhaseA);
            applyRippleField(targetCell);
        }
    });

    gridContainer.addEventListener('mouseleave', () => {
        if (gridContainer.classList.contains('snake-game-active')) {
            return;
        }
        clearRipple();
        lastOriginKey = '';
    });
}

function cellKey(col, row) {
    return `${col}-${row}`;
}

function setupSnakeGame(gridContainer, weeks, days) {
    const cells = Array.from(gridContainer.querySelectorAll('.github-cell'));
    if (cells.length === 0) {
        return;
    }

    const byKey = new Map();
    cells.forEach((cell) => {
        byKey.set(cellKey(Number(cell.dataset.col), Number(cell.dataset.row)), cell);
    });

    const triggerCol = Math.ceil(weeks / 2);
    const triggerRow = Math.ceil(HEATMAP_ROWS / 2);
    const triggerKey = cellKey(triggerCol, triggerRow);
    const triggerCell = byKey.get(triggerKey);
    if (!triggerCell) {
        return;
    }

    triggerCell.classList.add('snake-trigger-cell');
    triggerCell.setAttribute('title', 'Click to start');

    const SNAKE_DOOR_SVG_MARKUP = `<svg class="snake-exit-door-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22V10a7 7 0 0 1 14 0v12"/><path d="M5 22h14"/><circle cx="15.5" cy="15" r="1.35" fill="currentColor" stroke="none"/></svg>`;

    let startDoorIcon = triggerCell.querySelector('.snake-trigger-icon');
    if (!startDoorIcon) {
        startDoorIcon = document.createElement('span');
        startDoorIcon.className = 'snake-trigger-icon';
        startDoorIcon.setAttribute('aria-hidden', 'true');
        triggerCell.appendChild(startDoorIcon);
    }
    startDoorIcon.innerHTML = SNAKE_DOOR_SVG_MARKUP;

    if (!triggerCell.querySelector('.snake-exit-door-icon')) {
        const door = document.createElement('span');
        door.className = 'snake-exit-door-icon';
        door.setAttribute('aria-hidden', 'true');
        door.innerHTML = SNAKE_DOOR_SVG_MARKUP;
        triggerCell.appendChild(door);
    }

    /** 3×3 around exit door: no food/wall spawn; walls may be pushed through ring cells. */
    function isDoorSpawnExclusionCell(col, row) {
        return Math.abs(col - triggerCol) <= 1 && Math.abs(row - triggerRow) <= 1;
    }

    /** Center exit cell only: immovable - pushed chains cannot occupy or slide through it. */
    function isDoorImmovableCell(col, row) {
        return col === triggerCol && row === triggerRow;
    }

    function buildMonthColumnPlan() {
        const colToMonthId = new Array(weeks + 1).fill('');
        const columnsByMonthId = new Map();
        for (let c = 1; c <= weeks; c++) {
            const cell = byKey.get(cellKey(c, 1));
            const dateStr = cell?.dataset?.date;
            let mid = `week-${c}`;
            if (dateStr) {
                const dt = new Date(`${dateStr}T00:00:00`);
                if (!Number.isNaN(dt.getTime())) {
                    mid = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
                }
            }
            colToMonthId[c] = mid;
            if (!columnsByMonthId.has(mid)) {
                columnsByMonthId.set(mid, []);
            }
            columnsByMonthId.get(mid).push(c);
        }
        return { colToMonthId, columnsByMonthId };
    }

    const monthColumnPlan = buildMonthColumnPlan();
    const monthStartColumnSet = buildMonthStartColumnSet(Array.isArray(days) ? days : [], weeks);
    if (monthStartColumnSet.size === 0) {
        for (let c = 1; c <= weeks; c++) {
            monthStartColumnSet.add(c);
        }
    }

    const monthsContainer = document.getElementById('github-heatmap-months');
    const weekdaysContainer = gridContainer.parentElement?.querySelector('.github-heatmap-weekdays') || null;

    function clearMonthLabelPulses() {
        if (!monthsContainer) {
            return;
        }
        monthsContainer.querySelectorAll('.github-heatmap-month.snake-column-label-pulse').forEach((el) => {
            el.classList.remove('snake-column-label-pulse');
        });
    }

    function clearWeekdayLabelPulses() {
        if (!weekdaysContainer) {
            return;
        }
        weekdaysContainer.querySelectorAll('span.snake-weekday-label-pulse').forEach((el) => {
            el.classList.remove('snake-weekday-label-pulse');
        });
    }

    let game = null;
    let startTimeout = null;
    let snakeAudioContext = null;
    let isSnakeTransitioning = false;
    let statusPopup = null;
    let scoreDisplay = null;
    let snakeStats = readSnakeStats();

    function readSnakeStats() {
        try {
            const raw = window.localStorage.getItem(SNAKE_STATS_CACHE_KEY);
            if (!raw) {
                return { totalFoodEaten: 0, endlessUnlocked: false };
            }
            const parsed = JSON.parse(raw);
            if (typeof parsed?.totalFoodEaten === 'number' && typeof parsed?.endlessUnlocked === 'boolean') {
                return {
                    totalFoodEaten: Math.max(0, parsed.totalFoodEaten),
                    endlessUnlocked: parsed.endlessUnlocked
                };
            }
            const wins = Number.isFinite(parsed?.wins) ? parsed.wins : 0;
            return {
                totalFoodEaten: 0,
                endlessUnlocked: wins >= 1
            };
        } catch (error) {
            return { totalFoodEaten: 0, endlessUnlocked: false };
        }
    }

    function persistSnakeStats() {
        try {
            window.localStorage.setItem(SNAKE_STATS_CACHE_KEY, JSON.stringify(snakeStats));
        } catch (error) {
            // Ignore storage errors (e.g. private browsing).
        }
    }

    function ensureScoreDisplay() {
        if (scoreDisplay) {
            return;
        }
        const contributionsCard = gridContainer.closest('.github-contributions');
        const header = contributionsCard?.querySelector('.github-contributions-header');
        if (!header) {
            return;
        }
        scoreDisplay = document.createElement('span');
        scoreDisplay.className = 'github-snake-score';
        scoreDisplay.setAttribute('aria-live', 'polite');
        header.appendChild(scoreDisplay);
        renderScoreDisplay();
    }

    function renderScoreDisplay() {
        if (!scoreDisplay) {
            return;
        }
        if (!scoreDisplay.querySelector('.github-snake-score-value')) {
            scoreDisplay.innerHTML =
                '<span class="github-snake-score-dot" aria-hidden="true"></span><span class="github-snake-score-value">0</span>';
            scoreDisplay.setAttribute('aria-label', 'Total food eaten');
        }
        const valueEl = scoreDisplay.querySelector('.github-snake-score-value');
        if (valueEl) {
            valueEl.textContent = String(snakeStats.totalFoodEaten);
        }
    }

    function addFoodEatenTally(length) {
        const n = Math.max(0, Math.floor(Number(length)) || 0);
        snakeStats.totalFoodEaten += n;
        persistSnakeStats();
        renderScoreDisplay();
    }

    function showStatusPopup(message, tone = 'neutral') {
        if (!statusPopup) {
            statusPopup = document.createElement('div');
            statusPopup.className = 'snake-status-popup';
            gridContainer.appendChild(statusPopup);
        }
        statusPopup.classList.remove('is-win', 'is-loss', 'is-showing');
        if (tone === 'win') {
            statusPopup.classList.add('is-win');
        } else if (tone === 'loss') {
            statusPopup.classList.add('is-loss');
        }
        statusPopup.textContent = message;
        // Restart animation
        void statusPopup.offsetWidth;
        statusPopup.classList.add('is-showing');
    }

    function getSnakeAudioContext() {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor) {
            return null;
        }
        if (!snakeAudioContext) {
            snakeAudioContext = new AudioContextCtor();
        }
        if (snakeAudioContext.state === 'suspended') {
            snakeAudioContext.resume().catch(() => {});
        }
        return snakeAudioContext;
    }

    function playSnakeTone({ frequency = 440, duration = 0.1, type = 'sine', volume = 0.06, slideTo = null }) {
        const ctx = getSnakeAudioContext();
        if (!ctx) {
            return;
        }

        const now = ctx.currentTime;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);
        if (slideTo) {
            oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + duration);
        }

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(now);
        oscillator.stop(now + duration + 0.01);
    }

    function playSnakeStartSfx() {
        playSnakeTone({ frequency: 330, duration: 0.09, type: 'triangle', volume: 0.05, slideTo: 420 });
        setTimeout(() => {
            playSnakeTone({ frequency: 420, duration: 0.12, type: 'triangle', volume: 0.055, slideTo: 560 });
        }, 90);
    }

    function playSnakeEatSfx() {
        playSnakeTone({ frequency: 620, duration: 0.08, type: 'square', volume: 0.05, slideTo: 820 });
    }

    function playSnakeGameOverSfx() {
        playSnakeTone({ frequency: 320, duration: 0.2, type: 'sawtooth', volume: 0.055, slideTo: 140 });
        setTimeout(() => {
            playSnakeTone({ frequency: 180, duration: 0.24, type: 'sawtooth', volume: 0.045, slideTo: 90 });
        }, 120);
    }

    function playSnakeWinSfx() {
        playSnakeTone({ frequency: 520, duration: 0.12, type: 'triangle', volume: 0.055, slideTo: 700 });
        setTimeout(() => {
            playSnakeTone({ frequency: 700, duration: 0.14, type: 'triangle', volume: 0.06, slideTo: 880 });
        }, 100);
        setTimeout(() => {
            playSnakeTone({ frequency: 880, duration: 0.18, type: 'sine', volume: 0.055, slideTo: 1120 });
        }, 220);
    }

    function playSnakeFoodSpawnSfx() {
        playSnakeTone({ frequency: 920, duration: 0.055, type: 'sine', volume: 0.042, slideTo: 1240 });
        setTimeout(() => {
            playSnakeTone({ frequency: 1100, duration: 0.04, type: 'triangle', volume: 0.035, slideTo: 1400 });
        }, 45);
    }

    function playSnakeWallAppearSfx() {
        playSnakeTone({ frequency: 165, duration: 0.1, type: 'square', volume: 0.05, slideTo: 95 });
        setTimeout(() => {
            playSnakeTone({ frequency: 120, duration: 0.14, type: 'sine', volume: 0.055, slideTo: 80 });
        }, 70);
    }

    function playSnakeWallPushSfx() {
        playSnakeTone({ frequency: 210, duration: 0.08, type: 'triangle', volume: 0.048, slideTo: 95 });
        setTimeout(() => {
            playSnakeTone({ frequency: 140, duration: 0.1, type: 'sine', volume: 0.05, slideTo: 70 });
        }, 55);
    }

    function playSnakeBladeChargeSfx() {
        playSnakeTone({ frequency: 200, duration: 0.22, type: 'sine', volume: 0.038, slideTo: 340 });
        setTimeout(() => {
            playSnakeTone({ frequency: 260, duration: 0.18, type: 'triangle', volume: 0.032, slideTo: 420 });
        }, 120);
    }

    function playSnakeBladeActivatedSfx() {
        playSnakeTone({ frequency: 380, duration: 0.07, type: 'square', volume: 0.05, slideTo: 1400 });
        setTimeout(() => {
            playSnakeTone({ frequency: 720, duration: 0.05, type: 'sawtooth', volume: 0.04, slideTo: 180 });
        }, 35);
    }

    function playSnakeBladeCutSnakeSfx() {
        playSnakeTone({ frequency: 480, duration: 0.06, type: 'square', volume: 0.048, slideTo: 900 });
        setTimeout(() => {
            playSnakeTone({ frequency: 240, duration: 0.09, type: 'triangle', volume: 0.045, slideTo: 70 });
        }, 40);
        setTimeout(() => {
            playSnakeTone({ frequency: 180, duration: 0.08, type: 'sawtooth', volume: 0.035, slideTo: 55 });
        }, 95);
    }

    function playSnakeBladeWallBreakSfx() {
        playSnakeTone({ frequency: 340, duration: 0.055, type: 'square', volume: 0.05, slideTo: 95 });
        setTimeout(() => {
            playSnakeTone({ frequency: 200, duration: 0.1, type: 'triangle', volume: 0.048, slideTo: 65 });
        }, 45);
        setTimeout(() => {
            playSnakeTone({ frequency: 110, duration: 0.12, type: 'sawtooth', volume: 0.04, slideTo: 45 });
        }, 100);
    }

    function clearSnakeClasses() {
        cells.forEach((cell) => {
            cell.classList.remove(
                'snake-wave-clearing',
                'snake-cleared',
                'snake-food-cell',
                'snake-segment-head',
                'snake-segment-body',
                'snake-game-over-cell',
                'snake-win-cell',
                'snake-wall-cell',
                'snake-column-pulse',
                'snake-row-pulse'
            );
            cell.style.removeProperty('--snake-wave-delay');
            cell.style.removeProperty('--snake-shade');
        });
        gridContainer.classList.remove(
            'snake-game-active',
            'snake-wave-running',
            'snake-wave-start',
            'snake-wave-end',
            'snake-game-over',
            'snake-game-won'
        );
        triggerCell.classList.remove(
            'snake-trigger-fading',
            'snake-exit-cell',
            'snake-exit-door-near',
            'snake-trigger-door-near'
        );
        triggerCell.setAttribute('title', 'Click to start');
        isSnakeTransitioning = false;
        clearMonthLabelPulses();
        clearWeekdayLabelPulses();
    }

    function getFoodKeys(excludeKeys) {
        const candidates = cells
            .filter((cell) => {
                const col = Number(cell.dataset.col || 1);
                const row = Number(cell.dataset.row || 1);
                const k = cellKey(col, row);
                return !excludeKeys.has(k) && !isDoorSpawnExclusionCell(col, row);
            })
            .map((cell) => ({
                key: cellKey(Number(cell.dataset.col), Number(cell.dataset.row)),
                count: Number(cell.dataset.count || 0),
                col: Number(cell.dataset.col || 1),
                row: Number(cell.dataset.row || 1)
            }))
            .sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                if (a.col !== b.col) {
                    return a.col - b.col;
                }
                return a.row - b.row;
            });

        const desiredFoodCount = Math.min(12, Math.max(6, Math.floor(cells.length / 35)));
        const hasRealContributionSignal = candidates.some((item) => item.count > 0);

        if (!hasRealContributionSignal) {
            const shuffled = [...candidates];
            for (let i = shuffled.length - 1; i > 0; i -= 1) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return new Set(shuffled.slice(0, desiredFoodCount).map((item) => item.key));
        }

        return new Set(candidates.slice(0, desiredFoodCount).map((item) => item.key));
    }

    function buildSpawnSnake() {
        // Spawn at the trigger cell (center), facing and moving to the right.
        const head = { col: triggerCol, row: triggerRow };
        const body1 = { col: Math.max(1, triggerCol - 1), row: triggerRow };
        const body2 = { col: Math.max(1, triggerCol - 2), row: triggerRow };
        return [head, body1, body2];
    }

    function stripFoodOnWalls() {
        if (!game) {
            return;
        }
        for (const key of [...game.foodKeys]) {
            if (game.wallKeys.has(key)) {
                game.foodKeys.delete(key);
            }
        }
    }

    function renderSnake() {
        stripFoodOnWalls();
        cells.forEach((cell) => {
            cell.classList.remove(
                'snake-cleared',
                'snake-food-cell',
                'snake-segment-head',
                'snake-segment-body',
                'snake-game-over-cell',
                'snake-segment-enter',
                'snake-conn-up',
                'snake-conn-right',
                'snake-conn-down',
                'snake-conn-left',
                'snake-wall-cell'
            );
            cell.style.removeProperty('--snake-shade');
            const key = cellKey(Number(cell.dataset.col), Number(cell.dataset.row));
            if (!game) {
                return;
            }
            if (game.wallKeys.has(key)) {
                cell.classList.add('snake-wall-cell');
            } else if (game.foodKeys.has(key)) {
                cell.classList.add('snake-food-cell');
            } else if (!triggerCell.isSameNode(cell)) {
                cell.classList.add('snake-cleared');
            }
        });

        if (!game) {
            return;
        }

        const snakeLen = game.snake.length;
        game.snake.forEach((segment, index) => {
            const segmentCell = byKey.get(cellKey(segment.col, segment.row));
            if (!segmentCell) {
                return;
            }
            const shade = snakeLen <= 1 ? 1 : 1 - index / (snakeLen - 1);
            segmentCell.style.setProperty('--snake-shade', String(shade));
            segmentCell.classList.remove('snake-cleared');
            segmentCell.classList.add(index === 0 ? 'snake-segment-head' : 'snake-segment-body', 'snake-segment-enter');

            const neighbors = [game.snake[index - 1], game.snake[index + 1]].filter(Boolean);
            neighbors.forEach((neighbor) => {
                const deltaCol = neighbor.col - segment.col;
                const deltaRow = neighbor.row - segment.row;
                if (deltaCol === 1) {
                    segmentCell.classList.add('snake-conn-right');
                } else if (deltaCol === -1) {
                    segmentCell.classList.add('snake-conn-left');
                } else if (deltaRow === 1) {
                    segmentCell.classList.add('snake-conn-down');
                } else if (deltaRow === -1) {
                    segmentCell.classList.add('snake-conn-up');
                }
            });
        });

        if (game.rowBladePulseRow != null) {
            refreshRowBladePulseVisuals(game.rowBladePulseRow);
        }

        updateExitDoorProximity();
    }

    function updateExitDoorProximity() {
        if (!game || !triggerCell.classList.contains('snake-exit-cell')) {
            triggerCell.classList.remove('snake-exit-door-near');
            return;
        }
        const head = game.snake[0];
        const dist = Math.abs(head.col - triggerCol) + Math.abs(head.row - triggerRow);
        const near = dist <= 3;
        triggerCell.classList.toggle('snake-exit-door-near', near);
    }

    function spawnRandomFoodPiece() {
        if (!game?.endlessMode) {
            return;
        }
        if (game.foodKeys.size >= SNAKE_ENDLESS_MAX_FOOD) {
            return;
        }
        const blocked = new Set(game.snake.map((segment) => cellKey(segment.col, segment.row)));
        for (const key of game.foodKeys) {
            blocked.add(key);
        }
        for (const key of game.wallKeys) {
            blocked.add(key);
        }
        const open = cells.filter((cell) => {
            const col = Number(cell.dataset.col || 1);
            const row = Number(cell.dataset.row || 1);
            const k = cellKey(col, row);
            return !blocked.has(k) && !isDoorSpawnExclusionCell(col, row);
        });
        if (open.length === 0) {
            return;
        }
        const cell = open[Math.floor(Math.random() * open.length)];
        game.foodKeys.add(cellKey(Number(cell.dataset.col), Number(cell.dataset.row)));
        playSnakeFoodSpawnSfx();
        renderSnake();
    }

    function pickRowForBladeSpawn() {
        const candidates = SNAKE_BLADE_WEEKDAY_ROWS;
        const rowsWithoutBlade = candidates.filter((r) => game.bladeCountByRow[r] === 0);
        if (rowsWithoutBlade.length > 0) {
            return rowsWithoutBlade[Math.floor(Math.random() * rowsWithoutBlade.length)];
        }
        let total = 0;
        const weighted = [];
        for (const r of candidates) {
            const weight = 1 / (1 + game.bladeCountByRow[r] * 0.92);
            weighted.push({ row: r, weight });
            total += weight;
        }
        let roll = Math.random() * total;
        for (const { row, weight } of weighted) {
            roll -= weight;
            if (roll <= 0) {
                return row;
            }
        }
        return candidates[candidates.length - 1];
    }

    function isShownWeekdayBladeRow(row) {
        return SNAKE_BLADE_WEEKDAY_ROWS.includes(row);
    }

    /**
     * Blade sweeps from the left: the leftmost wall on the row blocks it first.
     * Everything strictly to the right of that wall is protected (no cut).
     * Cut zone is [1 .. cutZoneMaxCol inclusive]; the blocking wall is destroyed.
     * If there is no wall on the row, the full row is in the cut zone (cutZoneMaxCol = weeks).
     */
    function getRowBladeCutZone(bladeRow) {
        let leftmostWallCol = null;
        for (let col = 1; col <= weeks; col += 1) {
            if (game.wallKeys.has(cellKey(col, bladeRow))) {
                leftmostWallCol = col;
                break;
            }
        }
        const cutZoneMaxCol = leftmostWallCol !== null ? leftmostWallCol : weeks;
        return { cutZoneMaxCol, leftmostWallCol };
    }

    function refreshRowBladePulseVisuals(row) {
        if (!game || row == null || !isShownWeekdayBladeRow(row)) {
            return;
        }
        const { cutZoneMaxCol } = getRowBladeCutZone(row);
        if (game.rowBladePulseCutZoneMax === cutZoneMaxCol) {
            return;
        }
        game.rowBladePulseCutZoneMax = cutZoneMaxCol;
        for (let col = 1; col <= weeks; col += 1) {
            const cell = byKey.get(cellKey(col, row));
            if (cell) {
                cell.classList.remove('snake-row-pulse');
            }
        }
        for (let col = 1; col <= cutZoneMaxCol; col += 1) {
            const cell = byKey.get(cellKey(col, row));
            if (cell) {
                cell.classList.add('snake-row-pulse');
            }
        }
    }

    function applyRowBladeCut(bladeRow) {
        if (!game?.endlessMode) {
            return;
        }
        if (!isShownWeekdayBladeRow(bladeRow)) {
            return;
        }

        game.rowBladePulseRow = null;
        game.rowBladePulseCutZoneMax = null;
        for (let col = 1; col <= weeks; col += 1) {
            const cell = byKey.get(cellKey(col, bladeRow));
            if (cell) {
                cell.classList.remove('snake-row-pulse');
            }
        }

        const { cutZoneMaxCol, leftmostWallCol } = getRowBladeCutZone(bladeRow);

        if (leftmostWallCol !== null) {
            const wk = cellKey(leftmostWallCol, bladeRow);
            game.wallKeys.delete(wk);
            game.wallCountByCol[leftmostWallCol] -= 1;
        }

        for (let col = 1; col <= cutZoneMaxCol; col += 1) {
            game.foodKeys.delete(cellKey(col, bladeRow));
        }

        playSnakeBladeActivatedSfx();
        if (leftmostWallCol !== null) {
            playSnakeBladeWallBreakSfx();
        }

        const onRow = [];
        game.snake.forEach((segment, index) => {
            if (segment.row === bladeRow && segment.col <= cutZoneMaxCol) {
                onRow.push(index);
            }
        });
        if (onRow.length === 0) {
            renderSnake();
            if (game.foodKeys.size === 0) {
                gameWin();
            }
            return;
        }
        if (onRow.includes(0)) {
            playSnakeBladeCutSnakeSfx();
            gameOver();
            return;
        }
        const cutFrom = Math.min(...onRow);
        const tail = game.snake.splice(cutFrom);
        tail.forEach((segment) => {
            game.foodKeys.add(cellKey(segment.col, segment.row));
        });
        playSnakeBladeCutSnakeSfx();
        renderSnake();
        if (game.endlessMode) {
            if (game.snake.length >= game.coverageWinThreshold) {
                gameWin();
            } else if (game.foodKeys.size === 0) {
                gameWin();
            }
        }
    }

    function pulseRowBladeAndCut() {
        if (!game?.endlessMode) {
            return;
        }
        if (game.rowBladeCutTimeout) {
            clearTimeout(game.rowBladeCutTimeout);
            game.rowBladeCutTimeout = null;
        }
        if (game.rowBladePulseFinishTimeout) {
            clearTimeout(game.rowBladePulseFinishTimeout);
            game.rowBladePulseFinishTimeout = null;
        }
        cells.forEach((cell) => {
            cell.classList.remove('snake-row-pulse');
        });
        clearWeekdayLabelPulses();

        const row = pickRowForBladeSpawn();
        if (!isShownWeekdayBladeRow(row)) {
            return;
        }
        game.bladeCountByRow[row] += 1;
        game.rowBladePulseRow = row;
        game.rowBladePulseCutZoneMax = null;

        const weekdaySpanIndex = SNAKE_BLADE_WEEKDAY_ROWS.indexOf(row);
        const weekdaySpan = weekdaySpanIndex >= 0 ? weekdaysContainer?.children[weekdaySpanIndex] : null;
        if (weekdaySpan) {
            weekdaySpan.classList.add('snake-weekday-label-pulse');
        }

        refreshRowBladePulseVisuals(row);

        playSnakeBladeChargeSfx();

        game.rowBladeCutTimeout = window.setTimeout(() => {
            game.rowBladeCutTimeout = null;
            applyRowBladeCut(row);
        }, SNAKE_ROW_BLADE_CUT_AT_MS);

        game.rowBladePulseFinishTimeout = window.setTimeout(() => {
            game.rowBladePulseFinishTimeout = null;
            game.rowBladePulseRow = null;
            game.rowBladePulseCutZoneMax = null;
            for (let col = 1; col <= weeks; col++) {
                const cell = byKey.get(cellKey(col, row));
                if (cell) {
                    cell.classList.remove('snake-row-pulse');
                }
            }
            clearWeekdayLabelPulses();
        }, SNAKE_ROW_BLADE_PULSE_MS);
    }

    function countWallsInColumn(col) {
        let n = 0;
        for (let row = 1; row <= HEATMAP_ROWS; row++) {
            if (game.wallKeys.has(cellKey(col, row))) {
                n++;
            }
        }
        return n;
    }

    function getEligibleWallCellsInColumn(col) {
        if (countWallsInColumn(col) >= HEATMAP_ROWS - 1) {
            return [];
        }
        const snakeKeys = new Set(game.snake.map((s) => cellKey(s.col, s.row)));
        const eligible = [];
        for (let row = 1; row <= HEATMAP_ROWS; row++) {
            const k = cellKey(col, row);
            if (
                game.wallKeys.has(k) ||
                game.foodKeys.has(k) ||
                snakeKeys.has(k) ||
                isDoorSpawnExclusionCell(col, row)
            ) {
                continue;
            }
            eligible.push(k);
        }
        return eligible;
    }

    function getWallPoolColumns() {
        const pool = [];
        for (let c = 1; c <= weeks; c++) {
            if (!monthStartColumnSet.has(c)) {
                continue;
            }
            if (countWallsInColumn(c) >= HEATMAP_ROWS - 1) {
                continue;
            }
            if (getEligibleWallCellsInColumn(c).length === 0) {
                continue;
            }
            pool.push(c);
        }
        return pool;
    }

    function pickColumnForWallSpawn() {
        const pool = getWallPoolColumns();
        if (pool.length === 0) {
            return null;
        }
        const { columnsByMonthId } = monthColumnPlan;
        const monthsWithoutWall = [...columnsByMonthId.keys()].filter((mid) => !game.monthsWithWall.has(mid));
        const colsPhase1 = [];
        for (const mid of monthsWithoutWall) {
            const colsInMonth = columnsByMonthId.get(mid) || [];
            for (const c of colsInMonth) {
                if (pool.includes(c)) {
                    colsPhase1.push(c);
                }
            }
        }
        if (colsPhase1.length > 0) {
            return colsPhase1[Math.floor(Math.random() * colsPhase1.length)];
        }
        let total = 0;
        const weighted = [];
        for (const c of pool) {
            const weight = 1 / (1 + game.wallCountByCol[c] * 0.92);
            weighted.push({ col: c, weight });
            total += weight;
        }
        let roll = Math.random() * total;
        for (const { col, weight } of weighted) {
            roll -= weight;
            if (roll <= 0) {
                return col;
            }
        }
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function pulseColumnAndMaybePlaceWall() {
        if (!game?.endlessMode) {
            return;
        }
        if (game.wallPulseFinishTimeout) {
            clearTimeout(game.wallPulseFinishTimeout);
            game.wallPulseFinishTimeout = null;
        }
        cells.forEach((cell) => {
            cell.classList.remove('snake-column-pulse');
        });
        clearMonthLabelPulses();

        const col = pickColumnForWallSpawn();
        if (col === null) {
            return;
        }
        const eligibleAtStart = getEligibleWallCellsInColumn(col);
        if (eligibleAtStart.length === 0) {
            return;
        }
        const committedWallKey = eligibleAtStart[Math.floor(Math.random() * eligibleAtStart.length)];

        const monthEl = monthsContainer?.children[col - 1];
        if (monthEl?.classList?.contains('github-heatmap-month')) {
            monthEl.classList.add('snake-column-label-pulse');
        }
        for (let row = 1; row <= HEATMAP_ROWS; row++) {
            const cell = byKey.get(cellKey(col, row));
            if (cell) {
                cell.classList.add('snake-column-pulse');
            }
        }

        game.wallPulseFinishTimeout = window.setTimeout(() => {
            game.wallPulseFinishTimeout = null;
            for (let row = 1; row <= HEATMAP_ROWS; row++) {
                const cell = byKey.get(cellKey(col, row));
                if (cell) {
                    cell.classList.remove('snake-column-pulse');
                }
            }
            clearMonthLabelPulses();
            const snakeOccupiesCommitted = game.snake.some(
                (s) => cellKey(s.col, s.row) === committedWallKey
            );
            if (snakeOccupiesCommitted) {
                return;
            }
            game.wallKeys.add(committedWallKey);
            game.foodKeys.delete(committedWallKey);
            game.wallCountByCol[col] += 1;
            game.monthsWithWall.add(monthColumnPlan.colToMonthId[col]);
            playSnakeWallAppearSfx();
            renderSnake();
        }, SNAKE_WALL_PULSE_MS);
    }

    function stopGame() {
        if (startTimeout) {
            clearTimeout(startTimeout);
            startTimeout = null;
        }
        if (game?.tickInterval) {
            clearInterval(game.tickInterval);
        }
        if (game?.foodSpawnInterval) {
            clearInterval(game.foodSpawnInterval);
        }
        if (game?.wallSpawnInterval) {
            clearInterval(game.wallSpawnInterval);
        }
        if (game?.wallPulseFinishTimeout) {
            clearTimeout(game.wallPulseFinishTimeout);
        }
        if (game?.rowBladeSpawnInterval) {
            clearInterval(game.rowBladeSpawnInterval);
        }
        if (game?.rowBladeCutTimeout) {
            clearTimeout(game.rowBladeCutTimeout);
        }
        if (game?.rowBladePulseFinishTimeout) {
            clearTimeout(game.rowBladePulseFinishTimeout);
        }
        game = null;
        clearSnakeClasses();
    }

    function runSnakeClearingWave(waveKind, onComplete) {
        gridContainer.classList.add('snake-wave-running');
        if (waveKind === 'end') {
            gridContainer.classList.add('snake-wave-end');
            gridContainer.classList.remove('snake-wave-start');
        } else {
            gridContainer.classList.add('snake-wave-start');
            gridContainer.classList.remove('snake-wave-end');
        }
        cells.forEach((cell) => {
            const col = Number(cell.dataset.col || 1);
            cell.style.setProperty('--snake-wave-delay', `${(col - 1) * SNAKE_WAVE_STEP_MS}ms`);
            cell.classList.add('snake-wave-clearing');
        });

        const waveTotalMs = SNAKE_WAVE_DURATION_MS + Math.max(0, (weeks - 1) * SNAKE_WAVE_STEP_MS);
        window.setTimeout(() => {
            cells.forEach((cell) => {
                cell.classList.remove('snake-wave-clearing');
                cell.style.removeProperty('--snake-wave-delay');
            });
            gridContainer.classList.remove('snake-wave-running', 'snake-wave-start', 'snake-wave-end');
            if (onComplete) {
                onComplete();
            }
        }, waveTotalMs + 20);
    }

    function gameOver() {
        if (!game) {
            return;
        }
        showStatusPopup('Game Over', 'loss');
        playSnakeGameOverSfx();
        clearInterval(game.tickInterval);
        game.tickInterval = null;
        if (game.foodSpawnInterval) {
            clearInterval(game.foodSpawnInterval);
            game.foodSpawnInterval = null;
        }
        if (game.wallSpawnInterval) {
            clearInterval(game.wallSpawnInterval);
            game.wallSpawnInterval = null;
        }
        if (game.wallPulseFinishTimeout) {
            clearTimeout(game.wallPulseFinishTimeout);
            game.wallPulseFinishTimeout = null;
        }
        if (game.rowBladeSpawnInterval) {
            clearInterval(game.rowBladeSpawnInterval);
            game.rowBladeSpawnInterval = null;
        }
        if (game.rowBladeCutTimeout) {
            clearTimeout(game.rowBladeCutTimeout);
            game.rowBladeCutTimeout = null;
        }
        if (game.rowBladePulseFinishTimeout) {
            clearTimeout(game.rowBladePulseFinishTimeout);
            game.rowBladePulseFinishTimeout = null;
        }
        game.rowBladePulseRow = null;
        game.rowBladePulseCutZoneMax = null;
        clearMonthLabelPulses();
        clearWeekdayLabelPulses();
        gridContainer.classList.add('snake-game-over');
        game.snake.forEach((segment) => {
            const segmentCell = byKey.get(cellKey(segment.col, segment.row));
            if (segmentCell) {
                segmentCell.classList.add('snake-game-over-cell');
            }
        });

        setTimeout(() => {
            isSnakeTransitioning = true;
            runSnakeClearingWave('end', () => {
                stopGame();
            });
        }, 700);
    }

    function keyToColRow(key) {
        const [col, row] = key.split('-').map(Number);
        return { col, row };
    }

    function getWallChainFromHead(headCol, headRow, dCol, dRow) {
        const wallKeys = [];
        let col = headCol + dCol;
        let row = headRow + dRow;
        while (game.wallKeys.has(cellKey(col, row))) {
            wallKeys.push(cellKey(col, row));
            col += dCol;
            row += dRow;
        }
        return { wallKeys, destCol: col, destRow: row };
    }

    function canPushWallChain(headCol, headRow, dCol, dRow) {
        const chain = getWallChainFromHead(headCol, headRow, dCol, dRow);
        if (chain.wallKeys.length === 0) {
            return null;
        }
        const required = SNAKE_PUSH_LENGTH_PER_WALL * chain.wallKeys.length;
        if (game.snake.length < required) {
            return null;
        }
        const { destCol, destRow } = chain;
        if (destCol < 1 || destCol > weeks || destRow < 1 || destRow > HEATMAP_ROWS) {
            return null;
        }
        if (isDoorImmovableCell(destCol, destRow)) {
            return null;
        }
        for (let i = 0; i < chain.wallKeys.length; i += 1) {
            const nc = headCol + (i + 2) * dCol;
            const nr = headRow + (i + 2) * dRow;
            if (isDoorImmovableCell(nc, nr)) {
                return null;
            }
        }
        const destKey = cellKey(destCol, destRow);
        if (game.wallKeys.has(destKey)) {
            return null;
        }
        for (const seg of game.snake) {
            if (seg.col === destCol && seg.row === destRow) {
                return null;
            }
        }
        return chain;
    }

    function applyWallPush(head, dCol, dRow, chain) {
        const { wallKeys: wKeys } = chain;
        for (const wk of wKeys) {
            game.wallKeys.delete(wk);
            const { col } = keyToColRow(wk);
            game.wallCountByCol[col] -= 1;
        }
        for (let i = 0; i < wKeys.length; i += 1) {
            const nc = head.col + (i + 2) * dCol;
            const nr = head.row + (i + 2) * dRow;
            const nk = cellKey(nc, nr);
            game.wallKeys.add(nk);
            game.wallCountByCol[nc] += 1;
        }
        game.foodKeys.delete(cellKey(chain.destCol, chain.destRow));
        const nextHead = { col: head.col + dCol, row: head.row + dRow };
        game.snake.unshift(nextHead);
        game.snake.pop();
    }

    function getSnakePushSpeedRatio(snakeLength) {
        const t = Math.min(
            1,
            Math.max(0, (snakeLength - SNAKE_PUSH_LENGTH_PER_WALL) / SNAKE_PUSH_SPEED_LEN_RANGE)
        );
        return SNAKE_PUSH_SPEED_MIN_RATIO + (SNAKE_PUSH_SPEED_MAX_RATIO - SNAKE_PUSH_SPEED_MIN_RATIO) * t;
    }

    function setSnakeTickIntervalIfNeeded(ms) {
        if (!game) {
            return;
        }
        if (game.activeTickMs === ms && game.tickInterval) {
            return;
        }
        game.activeTickMs = ms;
        if (game.tickInterval) {
            clearInterval(game.tickInterval);
        }
        game.tickInterval = setInterval(tickSnake, ms);
    }

    const movementByDirectionSnake = {
        up: { col: 0, row: -1 },
        down: { col: 0, row: 1 },
        left: { col: -1, row: 0 },
        right: { col: 1, row: 0 }
    };

    const oppositeDirectionSnake = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left'
    };

    function canMoveInDirection(direction) {
        if (!game) {
            return false;
        }
        const head = game.snake[0];
        const movement = movementByDirectionSnake[direction];
        const nextCol = head.col + movement.col;
        const nextRow = head.row + movement.row;

        if (nextCol < 1 || nextCol > weeks || nextRow < 1 || nextRow > HEATMAP_ROWS) {
            return false;
        }

        const nextHeadKey = cellKey(nextCol, nextRow);
        if (game.wallKeys.has(nextHeadKey)) {
            return canPushWallChain(head.col, head.row, movement.col, movement.row) !== null;
        }
        const willEat = game.foodKeys.has(nextHeadKey);
        const bodyToCheck = willEat ? game.snake : game.snake.slice(0, -1);
        return !bodyToCheck.some((segment) => segment.col === nextCol && segment.row === nextRow);
    }

    function snakeHasNoLegalMove() {
        if (!game) {
            return false;
        }
        const directions = ['up', 'down', 'left', 'right'].filter(
            (d) => d !== oppositeDirectionSnake[game.direction]
        );
        return !directions.some((d) => canMoveInDirection(d));
    }

    function endSnakeSessionSuccess(message, tone, { unlockEndless = false } = {}) {
        if (!game) {
            return;
        }
        addFoodEatenTally(game.snake.length);
        if (unlockEndless) {
            snakeStats.endlessUnlocked = true;
            persistSnakeStats();
        }
        showStatusPopup(message, tone);
        playSnakeWinSfx();
        clearInterval(game.tickInterval);
        game.tickInterval = null;
        if (game.foodSpawnInterval) {
            clearInterval(game.foodSpawnInterval);
            game.foodSpawnInterval = null;
        }
        if (game.wallSpawnInterval) {
            clearInterval(game.wallSpawnInterval);
            game.wallSpawnInterval = null;
        }
        if (game.wallPulseFinishTimeout) {
            clearTimeout(game.wallPulseFinishTimeout);
            game.wallPulseFinishTimeout = null;
        }
        if (game.rowBladeSpawnInterval) {
            clearInterval(game.rowBladeSpawnInterval);
            game.rowBladeSpawnInterval = null;
        }
        if (game.rowBladeCutTimeout) {
            clearTimeout(game.rowBladeCutTimeout);
            game.rowBladeCutTimeout = null;
        }
        if (game.rowBladePulseFinishTimeout) {
            clearTimeout(game.rowBladePulseFinishTimeout);
            game.rowBladePulseFinishTimeout = null;
        }
        game.rowBladePulseRow = null;
        game.rowBladePulseCutZoneMax = null;
        clearMonthLabelPulses();
        clearWeekdayLabelPulses();
        gridContainer.classList.add('snake-game-won');
        game.snake.forEach((segment) => {
            const segmentCell = byKey.get(cellKey(segment.col, segment.row));
            if (segmentCell) {
                segmentCell.style.removeProperty('--snake-shade');
                segmentCell.classList.add('snake-win-cell');
            }
        });

        setTimeout(() => {
            isSnakeTransitioning = true;
            runSnakeClearingWave('end', () => {
                stopGame();
            });
        }, 900);
    }

    function gameWin() {
        if (!game) {
            return;
        }
        const message = game.endlessMode ? 'Grid conquered!' : 'Victory!';
        endSnakeSessionSuccess(message, 'win', { unlockEndless: !game.endlessMode });
    }

    function snakeSaveExit() {
        if (!game) {
            return;
        }
        endSnakeSessionSuccess('Saving', 'win', { unlockEndless: false });
    }

    function updateDirectionTowardTarget(targetCol, targetRow) {
        if (!game) {
            return;
        }
        function isDirectionSafe(direction) {
            return canMoveInDirection(direction);
        }

        const candidateDirections = ['up', 'down', 'left', 'right']
            .filter((direction) => direction !== oppositeDirectionSnake[game.direction])
            .map((direction) => {
                const head = game.snake[0];
                const movement = movementByDirectionSnake[direction];
                const nextCol = head.col + movement.col;
                const nextRow = head.row + movement.row;
                const safe = isDirectionSafe(direction);
                const distance = Math.abs(targetCol - nextCol) + Math.abs(targetRow - nextRow);
                const keepDirectionBonus = direction === game.direction ? -0.12 : 0;
                return {
                    direction,
                    safe,
                    score: distance + keepDirectionBonus
                };
            })
            .sort((a, b) => {
                if (a.safe !== b.safe) {
                    return a.safe ? -1 : 1;
                }
                return a.score - b.score;
            });

        if (candidateDirections.length > 0 && candidateDirections[0].safe) {
            game.nextDirection = candidateDirections[0].direction;
        }
    }

    function updateDirectionFromCursor(targetCell) {
        if (!game) {
            return;
        }
        const targetCol = Number(targetCell.dataset.col || 1);
        const targetRow = Number(targetCell.dataset.row || 1);
        game.targetCol = targetCol;
        game.targetRow = targetRow;
        updateDirectionTowardTarget(targetCol, targetRow);
    }

    function tickSnake() {
        if (!game) {
            return;
        }

        updateDirectionTowardTarget(game.targetCol, game.targetRow);

        if (snakeHasNoLegalMove()) {
            gameOver();
            return;
        }

        game.direction = game.nextDirection;
        const head = game.snake[0];
        const movement = movementByDirectionSnake[game.direction];

        const nextHead = {
            col: head.col + movement.col,
            row: head.row + movement.row
        };

        if (nextHead.col < 1 || nextHead.col > weeks || nextHead.row < 1 || nextHead.row > HEATMAP_ROWS) {
            gameOver();
            return;
        }

        const nextHeadKey = cellKey(nextHead.col, nextHead.row);
        if (nextHeadKey === triggerKey) {
            const bodyToCheckExit = game.snake.slice(0, -1);
            if (
                bodyToCheckExit.some(
                    (segment) => segment.col === nextHead.col && segment.row === nextHead.row
                )
            ) {
                gameOver();
                return;
            }
            setSnakeTickIntervalIfNeeded(SNAKE_TICK_MS);
            game.snake.unshift(nextHead);
            game.snake.pop();
            renderSnake();
            snakeSaveExit();
            return;
        }
        if (game.wallKeys.has(nextHeadKey)) {
            const chain = canPushWallChain(head.col, head.row, movement.col, movement.row);
            if (!chain) {
                setSnakeTickIntervalIfNeeded(SNAKE_TICK_MS);
                return;
            }
            const lenBefore = game.snake.length;
            applyWallPush(head, movement.col, movement.row, chain);
            playSnakeWallPushSfx();
            setSnakeTickIntervalIfNeeded(SNAKE_TICK_MS / getSnakePushSpeedRatio(lenBefore));
            renderSnake();

            if (game.endlessMode) {
                if (game.snake.length >= game.coverageWinThreshold) {
                    gameWin();
                } else if (game.foodKeys.size === 0) {
                    gameWin();
                }
            } else if (game.foodKeys.size === 0) {
                gameWin();
            }
            return;
        }
        const willEat = game.foodKeys.has(nextHeadKey);
        const bodyToCheck = willEat ? game.snake : game.snake.slice(0, -1);
        const bodyHit = bodyToCheck.some((segment) => segment.col === nextHead.col && segment.row === nextHead.row);
        if (bodyHit) {
            gameOver();
            return;
        }

        setSnakeTickIntervalIfNeeded(SNAKE_TICK_MS);

        game.snake.unshift(nextHead);
        if (willEat) {
            game.foodKeys.delete(nextHeadKey);
            playSnakeEatSfx();
        } else {
            game.snake.pop();
        }

        renderSnake();

        if (game.endlessMode) {
            if (game.snake.length >= game.coverageWinThreshold) {
                gameWin();
            } else if (game.foodKeys.size === 0) {
                gameWin();
            }
        } else if (game.foodKeys.size === 0) {
            gameWin();
        }
    }

    const START_DOOR_CURSOR_GLOW_PX = 88;

    function updateStartDoorCursorProximity(clientX, clientY) {
        if (game || isSnakeTransitioning) {
            triggerCell.classList.remove('snake-trigger-door-near');
            return;
        }
        const r = triggerCell.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(clientX - cx, clientY - cy);
        triggerCell.classList.toggle('snake-trigger-door-near', dist <= START_DOOR_CURSOR_GLOW_PX);
    }

    function startGame() {
        stopGame();
        playSnakeStartSfx();
        isSnakeTransitioning = true;
        triggerCell.classList.remove('snake-trigger-door-near');
        gridContainer.classList.add('snake-game-active', 'snake-wave-running');
        triggerCell.classList.add('snake-trigger-fading');

        cells.forEach((cell) => {
            cell.classList.remove('ripple-active', 'ripple-fading', 'ripple-clear', 'hover-origin');
            cell.style.removeProperty('--ripple-delay');
            cell.style.removeProperty('--ripple-strength');
        });
        runSnakeClearingWave('start', () => {
            const snake = buildSpawnSnake();
            const excluded = new Set([triggerKey, ...snake.map((segment) => cellKey(segment.col, segment.row))]);
            const foodKeys = getFoodKeys(excluded);
            const endlessMode = snakeStats.endlessUnlocked;
            const coverageWinThreshold = Math.max(2, Math.ceil(cells.length * SNAKE_ENDLESS_COVERAGE_RATIO));

            game = {
                snake,
                foodKeys,
                direction: 'right',
                nextDirection: 'right',
                targetCol: triggerCol + 1,
                targetRow: triggerRow,
                tickInterval: null,
                endlessMode,
                coverageWinThreshold,
                foodSpawnInterval: null,
                wallKeys: new Set(),
                wallCountByCol: new Array(weeks + 1).fill(0),
                monthsWithWall: new Set(),
                wallSpawnInterval: null,
                wallPulseFinishTimeout: null,
                bladeCountByRow: new Array(HEATMAP_ROWS + 1).fill(0),
                rowBladeSpawnInterval: null,
                rowBladeCutTimeout: null,
                rowBladePulseFinishTimeout: null,
                rowBladePulseRow: null,
                rowBladePulseCutZoneMax: null,
                activeTickMs: SNAKE_TICK_MS
            };

            isSnakeTransitioning = false;
            triggerCell.classList.remove('snake-trigger-fading');
            triggerCell.classList.add('snake-exit-cell');
            triggerCell.setAttribute('title', 'Exit: return here to save (tallies snake length as food eaten)');
            renderSnake();
            setSnakeTickIntervalIfNeeded(SNAKE_TICK_MS);
            if (endlessMode) {
                game.foodSpawnInterval = setInterval(spawnRandomFoodPiece, SNAKE_ENDLESS_FOOD_INTERVAL_MS);
                game.wallSpawnInterval = setInterval(pulseColumnAndMaybePlaceWall, SNAKE_WALL_SPAWN_INTERVAL_MS);
                game.rowBladeSpawnInterval = setInterval(pulseRowBladeAndCut, SNAKE_ROW_BLADE_INTERVAL_MS);
            }
        });
    }

    triggerCell.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (game || isSnakeTransitioning) {
            return;
        }
        getSnakeAudioContext();
        startGame();
    });

    gridContainer.addEventListener('mousemove', (event) => {
        if (game) {
            const targetCell = event.target.closest('.github-cell');
            if (!targetCell || !gridContainer.contains(targetCell)) {
                return;
            }
            updateDirectionFromCursor(targetCell);
        } else if (!isSnakeTransitioning) {
            updateStartDoorCursorProximity(event.clientX, event.clientY);
        }
    });

    gridContainer.addEventListener('mouseleave', () => {
        if (!game && !isSnakeTransitioning) {
            triggerCell.classList.remove('snake-trigger-door-near');
        }
    });

    ensureScoreDisplay();
}

async function loadGitHubHeatmap() {
    const monthsContainer = document.getElementById('github-heatmap-months');
    const gridContainer = document.getElementById('github-heatmap-grid');

    if (!monthsContainer || !gridContainer) {
        return;
    }

    const ui = HEATMAP_TEXT[getHeatmapLang()];
    gridContainer.innerHTML = `<p class="github-heatmap-loading">${ui.loading}</p>`;

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
        lastHeatmapData = { days, weeks };
        renderMonths(days, weeks, monthsContainer);
        renderHeatmap(days, weeks, gridContainer);
        applyHeatmapLanguage();
    } catch (error) {
        monthsContainer.innerHTML = '';
        const errorText = HEATMAP_TEXT[getHeatmapLang()].error;
        gridContainer.innerHTML = `<p class="github-heatmap-error">${errorText}</p>`;
    }
}

function bindHeatmapLanguageUpdates() {
    const htmlElement = document.documentElement;
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
                applyHeatmapLanguage();
            }
        }
    });
    observer.observe(htmlElement, { attributes: true, attributeFilter: ['lang'] });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadGitHubHeatmap();
        bindHeatmapLanguageUpdates();
    });
} else {
    loadGitHubHeatmap();
    bindHeatmapLanguageUpdates();
}
