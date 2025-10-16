// Medieval Character Sheet - Utility Functions
// Location: /home/hullivan/Hugues.W.B.dePingon/js/utils.js

// Performance: Debounce utility
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance: Throttle utility
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance: DOM Query Cache
export const DOMCache = {
    cache: new Map(),
    get(selector, parent = document) {
        const key = `${selector}_${parent === document ? 'doc' : 'custom'}`;
        if (!this.cache.has(key)) {
            this.cache.set(key, parent.querySelector(selector));
        }
        return this.cache.get(key);
    },
    getAll(selector, parent = document) {
        const key = `all_${selector}_${parent === document ? 'doc' : 'custom'}`;
        if (!this.cache.has(key)) {
            this.cache.set(key, parent.querySelectorAll(selector));
        }
        return this.cache.get(key);
    },
    clear() {
        this.cache.clear();
    }
};

// Performance: Helper to safely get element from event target
export function getElementFromTarget(target) {
    // If target is an Element, return it directly
    if (target.nodeType === 1) {
        return target;
    }
    // If target is a text node or other, get its parent element
    return target.parentElement;
}

// Performance: Memory management - track active timeouts and intervals
export const activeTimers = {
    timeouts: new Set(),
    intervals: new Set(),

    setTimeout(callback, delay) {
        const id = setTimeout(() => {
            callback();
            this.timeouts.delete(id);
        }, delay);
        this.timeouts.add(id);
        return id;
    },

    setInterval(callback, delay) {
        const id = setInterval(callback, delay);
        this.intervals.add(id);
        return id;
    },

    clearTimeout(id) {
        clearTimeout(id);
        this.timeouts.delete(id);
    },

    clearInterval(id) {
        clearInterval(id);
        this.intervals.delete(id);
    },

    clearAll() {
        this.timeouts.forEach(id => clearTimeout(id));
        this.intervals.forEach(id => clearInterval(id));
        this.timeouts.clear();
        this.intervals.clear();
    }
};

// Security: HTML Sanitization Helper
export function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Security: Create element safely with text content
export function createElementSafe(tag, content, className) {
    const elem = document.createElement(tag);
    if (className) elem.className = className;
    if (content) elem.textContent = content;
    return elem;
}

// Typing effect for character name (secure version)
export function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

