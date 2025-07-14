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
    startY: 0
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
        
        // Render initial content
        ListComponent.render();
        MapComponent.renderMarkers();
        
        console.log('✅ App initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        showError('Failed to load application. Please refresh the page.');
    }
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
