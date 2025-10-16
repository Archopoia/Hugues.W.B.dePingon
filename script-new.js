// Medieval Character Sheet - Main Entry Point
// Location: /home/hullivan/Hugues.W.B.dePingon/script.js

// MUST BE FIRST: Reset scroll position immediately
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Suppress browser extension/PDF viewer console errors IMMEDIATELY
// This needs to run before any other code to catch all PDF-related errors
(function() {
    const originalError = console.error;
    console.error = function(...args) {
        const message = String(args[0] || '');
        // Suppress PDF-related and CSP frame errors
        if (message.includes('message port closed before a response was received') ||
            message.includes('runtime.lastError') ||
            message.includes('Extension context invalidated') ||
            message.includes('Unchecked runtime.lastError') ||
            message.includes('Refused to frame') ||
            message.includes('Content Security Policy directive')) {
            return; // Don't log these errors
        }
        // Log all other errors normally
        originalError.apply(console, args);
    };

    const originalWarn = console.warn;
    console.warn = function(...args) {
        const message = String(args[0] || '');
        // Suppress PDF-related warnings
        if (message.includes('runtime.lastError') ||
            message.includes('message port closed') ||
            message.includes('Extension context invalidated') ||
            message.includes('Unchecked runtime.lastError') ||
            message.includes('Refused to frame')) {
            return; // Don't log these warnings
        }
        // Log all other warnings normally
        originalWarn.apply(console, args);
    };

    // Also intercept the global error event for runtime errors
    window.addEventListener('error', function(event) {
        const message = event.message || '';
        if (message.includes('runtime.lastError') ||
            message.includes('message port closed') ||
            message.includes('Refused to frame')) {
            event.stopImmediatePropagation();
            event.preventDefault();
            return false;
        }
    }, true);
})();

// Import all modules - Initialize when DOM is ready
import './js/init.js';

// Export modal functions globally (called from HTML onclick handlers)
import { openFullVideo, openFullPDF, openImageGallery, openFullImage, closeModal, toggleExpCard } from './js/modals.js';

window.openFullVideo = openFullVideo;
window.openFullPDF = openFullPDF;
window.openImageGallery = openImageGallery;
window.openFullImage = openFullImage;
window.closeModal = closeModal;
window.toggleExpCard = toggleExpCard;

