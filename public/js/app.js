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
        'steel_engraving_0007', 'steel_engraving_0008', 'steel_engraving_0009',
        'steel_engraving_0010', 'steel_engraving_0011', 'steel_engraving_0012',
        'steel_engraving_0013', 'steel_engraving_0014'
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
        LandmarkOverlay.init();
        ModalComponent.init();
        NavigationComponent.init();
        
        // Initialize URL routing
        initRouting();
        
        // Render initial content
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

// UI State Management
const UIState = {
    sidebarCollapsed: false,
    currentView: 'grid',
    recentlyViewed: JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
};

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key) {
            case '?':
                e.preventDefault();
                showKeyboardShortcuts();
                break;
            case 'Escape':
                e.preventDefault();
                hideKeyboardShortcuts();
                ModalComponent.closeImageModal();
                ModalComponent.close();
                break;
            case 'ArrowLeft':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    navigateEngravings('prev');
                }
                break;
            case 'ArrowRight':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    navigateEngravings('next');
                }
                break;
        }
    });
}

// Sidebar Management
function toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const main = document.querySelector('.app-main');
    
    // For mobile, just toggle the sidebar visibility
    if (window.innerWidth <= 1024) {
        sidebar.classList.toggle('open');
        return;
    }
    
    // For desktop, toggle collapsed state
    UIState.sidebarCollapsed = !UIState.sidebarCollapsed;
    
    if (UIState.sidebarCollapsed) {
        main.classList.add('sidebar-collapsed');
    } else {
        main.classList.remove('sidebar-collapsed');
    }
    
    // Save state
    localStorage.setItem('sidebarCollapsed', UIState.sidebarCollapsed);
}

// View Mode Management
function toggleViewMode() {
    const engravingsList = document.getElementById('engravings-list');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    UIState.currentView = UIState.currentView === 'grid' ? 'list' : 'grid';
    
    // Update UI
    engravingsList.className = `engravings-${UIState.currentView}`;
    
    viewBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === UIState.currentView);
    });
    
    // Re-render list with new view
    ListComponent.render();
    
    // Save state
    localStorage.setItem('viewMode', UIState.currentView);
}

// Recently Viewed Management
function addToRecentlyViewed(engravingId) {
    const engraving = AppState.engravingsData.find(e => e.id === engravingId);
    if (!engraving) return;
    
    // Remove if already exists
    UIState.recentlyViewed = UIState.recentlyViewed.filter(item => item.id !== engravingId);
    
    // Add to beginning
    UIState.recentlyViewed.unshift({
        id: engravingId,
        title: engraving.title,
        timestamp: Date.now()
    });
    
    // Keep only last 5
    UIState.recentlyViewed = UIState.recentlyViewed.slice(0, 5);
    
    // Save to localStorage
    localStorage.setItem('recentlyViewed', JSON.stringify(UIState.recentlyViewed));
    
    // Update UI
    updateRecentlyViewedUI();
}

function updateRecentlyViewedUI() {
    const recentSection = document.getElementById('recently-viewed');
    const recentItems = document.getElementById('recent-items');
    
    // Check if elements exist (they might not be in all versions)
    if (!recentSection || !recentItems) {
        return;
    }
    
    if (UIState.recentlyViewed.length === 0) {
        recentSection.style.display = 'none';
        return;
    }
    
    recentSection.style.display = 'block';
    
    recentItems.innerHTML = UIState.recentlyViewed.map(item => {
        const timeAgo = getTimeAgo(item.timestamp);
        return `
            <div class="recent-item" onclick="openRecentItem('${item.id}')">
                <div class="recent-item-thumb">📷</div>
                <div class="recent-item-info">
                    <div class="recent-item-title">${toTitleCase(item.title)}</div>
                    <div class="recent-item-time">${timeAgo}</div>
                </div>
            </div>
        `;
    }).join('');
}

function openRecentItem(engravingId) {
    ModalComponent.showEngravingDetails(engravingId);
    const engraving = AppState.engravingsData.find(e => e.id === engravingId);
    if (engraving) {
        MapComponent.focusOnEngraving(engraving);
    }
}

function clearRecentlyViewed() {
    UIState.recentlyViewed = [];
    localStorage.removeItem('recentlyViewed');
    updateRecentlyViewedUI();
    showToast('Recently viewed cleared', 'info');
}

function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

// Keyboard Shortcuts Overlay
function showKeyboardShortcuts() {
    const overlay = document.getElementById('shortcuts-overlay');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideKeyboardShortcuts() {
    const overlay = document.getElementById('shortcuts-overlay');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

// Navigation between engravings
function navigateEngravings(direction) {
    const currentModal = document.getElementById('engraving-modal');
    if (currentModal.style.display !== 'flex') return;
    
    const currentId = getCurrentEngravingId();
    if (!currentId) return;
    
    const currentIndex = AppState.filteredEngravings.findIndex(e => e.id === currentId);
    if (currentIndex === -1) return;
    
    let nextIndex;
    if (direction === 'next') {
        nextIndex = (currentIndex + 1) % AppState.filteredEngravings.length;
    } else {
        nextIndex = currentIndex === 0 ? AppState.filteredEngravings.length - 1 : currentIndex - 1;
    }
    
    const nextEngraving = AppState.filteredEngravings[nextIndex];
    ModalComponent.showEngravingDetails(nextEngraving.id);
    MapComponent.focusOnEngraving(nextEngraving);
}

function getCurrentEngravingId() {
    // Extract from modal content or URL hash
    const hash = window.location.hash;
    if (hash.startsWith('#engraving/')) {
        return hash.replace('#engraving/', '');
    }
    return null;
}

// Filter Chips Management
function initFilterChips() {
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Remove active from all chips
            filterChips.forEach(c => c.classList.remove('active'));
            // Add active to clicked chip
            chip.classList.add('active');
            
            // Update map layer
            const layer = chip.dataset.layer;
            if (typeof MapComponent !== 'undefined' && MapComponent.switchLayer) {
                MapComponent.switchLayer(layer);
            }
        });
    });
}

// View Toggle Management
function initViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            UIState.currentView = btn.dataset.view;
            const engravingsList = document.getElementById('engravings-list');
            engravingsList.className = `engravings-${UIState.currentView}`;
            
            ListComponent.render();
            localStorage.setItem('viewMode', UIState.currentView);
        });
    });
}

// Load UI State from localStorage
function loadUIState() {
    // Load recently viewed
    updateRecentlyViewedUI();
}

// Initialize all UI enhancements
function initUIEnhancements() {
    initKeyboardShortcuts();
    initFilterChips();
    initViewToggle();
    loadUIState();
    
    // Update total engravings count
    const totalEl = document.getElementById('total-engravings');
    if (totalEl) {
        totalEl.textContent = AppState.engravingsData.length;
    }
    
    console.log('🎨 UI enhancements initialized');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp().then(() => {
        initUIEnhancements();
    });
});
