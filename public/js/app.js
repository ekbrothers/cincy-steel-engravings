/**
 * Cincinnati Steel Engravings - Main Application
 * Modular JavaScript architecture for better maintainability
 */

// Global application state
const AppState = {
    map: null,
    engravingsData: [],
    markersLayer: null,
    filteredEngravings: [],
    currentZoom: 1,
    isDragging: false,
    translateX: 0,
    translateY: 0,
    startX: 0,
    startY: 0,
    initialPinchDistance: 0,
    initialZoom: 1
};

// Configuration
const Config = {
    CINCINNATI_CENTER: [39.1031, -84.5120],
    ENGRAVING_IDS: [
        'steel_engraving_0001', 'steel_engraving_0002', 'steel_engraving_0003',
        'steel_engraving_0004', 'steel_engraving_0005', 'steel_engraving_0006',
        'steel_engraving_0007', 'steel_engraving_0008', 'steel_engraving_0009'
    ],
    MAP_LAYERS: {
        modern: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        },
        historical: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles © Esri — Source: USGS, Esri, TANA, DeLorme, and NPS',
            maxZoom: 16
        }
    }
};

/**
 * Initialize the application
 */
async function initApp() {
    console.log('🚀 Initializing Cincinnati Steel Engravings app...');
    
    try {
        // Load engraving data
        AppState.engravingsData = await DataLoader.loadAllEngravings();
        AppState.filteredEngravings = [...AppState.engravingsData];
        
        console.log(`📚 Loaded ${AppState.engravingsData.length} engravings`);
        
        // Debug: Log each engraving's data
        AppState.engravingsData.forEach((engraving, index) => {
            console.log(`📍 Engraving ${index + 1}:`, {
                id: engraving.id,
                title: engraving.title,
                coordinates: engraving.location?.viewpoint?.coordinates,
                hasCoordinates: !!(engraving.location?.viewpoint?.coordinates?.lat && engraving.location?.viewpoint?.coordinates?.lng)
            });
        });
        
        // Initialize components
        MapComponent.init();
        SearchComponent.init();
        ListComponent.init();
        ModalComponent.init();
        NavigationComponent.init();
        
        // Initialize URL routing
        initRouting();
        
        // Render initial content
        ListComponent.render();
        MapComponent.renderMarkers();
        
        // Handle deep linking
        handleDeepLink();
        
        console.log('✅ App initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        showError('Failed to load application. Please refresh the page.');
    }
}

/**
 * Initialize URL routing system
 */
function initRouting() {
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    console.log('🔗 URL routing initialized');
}

/**
 * Handle URL hash changes
 */
function handleHashChange() {
    const hash = window.location.hash;
    if (hash.startsWith('#engraving/')) {
        const engravingId = hash.replace('#engraving/', '');
        openEngravingFromUrl(engravingId);
    }
}

/**
 * Handle deep linking on initial page load
 */
function handleDeepLink() {
    const hash = window.location.hash;
    if (hash.startsWith('#engraving/')) {
        const engravingId = hash.replace('#engraving/', '');
        // Delay to ensure components are ready
        setTimeout(() => {
            openEngravingFromUrl(engravingId);
        }, 500);
    }
}

/**
 * Open engraving from URL
 * @param {string} engravingId - Engraving ID from URL
 */
function openEngravingFromUrl(engravingId) {
    const engraving = AppState.engravingsData.find(e => e.id === engravingId);
    if (engraving) {
        ModalComponent.showEngravingDetails(engravingId);
        MapComponent.focusOnEngraving(engraving);
        console.log(`🔗 Opened engraving from URL: ${engravingId}`);
    } else {
        console.warn(`🔗 Engraving not found for URL: ${engravingId}`);
    }
}

/**
 * Generate shareable URL for engraving
 * @param {string} engravingId - Engraving ID
 * @returns {string} Shareable URL
 */
function generateShareUrl(engravingId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#engraving/${engravingId}`;
}

/**
 * Convert text to title case
 * @param {string} text - Text to convert
 * @returns {string} Title case text
 */
function toTitleCase(text) {
    if (!text) return '';
    
    // Words that should remain lowercase (articles, prepositions, conjunctions)
    const lowercaseWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'];
    
    return text.toLowerCase().split(' ').map((word, index) => {
        // Always capitalize first and last word
        if (index === 0 || index === text.split(' ').length - 1) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        
        // Keep certain words lowercase unless they're the first/last word
        if (lowercaseWords.includes(word)) {
            return word;
        }
        
        // Capitalize other words
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

/**
 * Copy text to clipboard with fallback
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to show
 * @param {string} type - Toast type ('success', 'error', 'info')
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('toast-show'), 100);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

/**
 * Show error message to user
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
        }
    }, 5000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
