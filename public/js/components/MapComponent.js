/**
 * MapComponent
 * Handles map initialization and marker rendering
 */
const MapComponent = {
    /**
     * Initialize the Leaflet map
     */
    init() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            throw new Error('Map container not found');
        }

        // Create static map with no zoom controls
        AppState.map = L.map(mapContainer, {
            center: Config.CINCINNATI_CENTER,
            zoom: 12,
            zoomControl: false,           // Remove zoom buttons
            scrollWheelZoom: false,       // Disable scroll wheel zoom
            doubleClickZoom: false,       // Disable double-click zoom
            touchZoom: false,             // Disable touch zoom
            boxZoom: false,               // Disable box zoom
            keyboard: false,              // Disable keyboard navigation
            dragging: true,               // Keep dragging enabled for panning
            attributionControl: true
        });

        // Add default dark layer for dark mode
        this.addLayer('night');
        
        // Create markers layer group
        AppState.markersLayer = L.layerGroup().addTo(AppState.map);
        
        // Removed layer switching setup
        
        console.log('🗺️ Static map initialized');
    },

    /**
     * Add map layer
     * @param {string} layerType - 'modern' or 'historical'
     */
    addLayer(layerType) {
        const layerConfig = layerType === 'night'
            ? {
                url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
                maxZoom: 19
            }
            : Config.MAP_LAYERS[layerType];
        if (!layerConfig) return;

        L.tileLayer(layerConfig.url, {
            attribution: layerConfig.attribution,
            maxZoom: layerConfig.maxZoom
        }).addTo(AppState.map);
    },

    /**
     * Remove all tile layers
     */
    removeAllLayers() {
        AppState.map.eachLayer(layer => {
            if (layer instanceof L.TileLayer) {
                AppState.map.removeLayer(layer);
            }
        });
    },

    // Removed setupLayerSwitching method and layer switching functionality

    /**
     * Render markers on map with intelligent preloading and overlap handling
     */
    renderMarkers() {
        AppState.markersLayer.clearLayers();
        
        // Track used coordinates to handle overlaps
        const usedCoordinates = new Map();
        
        AppState.filteredEngravings.forEach(engraving => {
            let { lat, lng } = engraving.location.viewpoint.coordinates;
            
            // Create a coordinate key for overlap detection
            const coordKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
            
            // If this coordinate is already used, add a small offset
            if (usedCoordinates.has(coordKey)) {
                const offsetCount = usedCoordinates.get(coordKey);
                // Add small circular offset to prevent exact overlap
                const angle = (offsetCount * 60) * (Math.PI / 180); // 60 degrees apart
                const offsetDistance = 0.002; // Small offset in degrees
                lat += Math.cos(angle) * offsetDistance;
                lng += Math.sin(angle) * offsetDistance;
                usedCoordinates.set(coordKey, offsetCount + 1);
            } else {
                usedCoordinates.set(coordKey, 1);
            }
            
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `
                    <div class="marker-content">
                        <div class="marker-dot"></div>
                        <div class="marker-label">${engraving.dates.created}</div>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });
            
            const marker = L.marker([lat, lng], { icon: customIcon })
                .on('click', () => {
                    ModalComponent.showEngravingDetails(engraving.id);
                })
                .on('mouseover', () => {
                    this.startHoverPreload(engraving.id);
                })
                .on('mouseout', () => {
                    this.cancelHoverPreload(engraving.id);
                });
            
            AppState.markersLayer.addLayer(marker);
        });
        
        // Auto-zoom to fit all markers
        this.fitMapToMarkers();
        
        console.log(`📍 Rendered ${AppState.filteredEngravings.length} markers with intelligent preloading and overlap handling`);
    },

    /**
     * Start preloading image on hover with delay
     * @param {string} engravingId - Engraving ID to preload
     */
    startHoverPreload(engravingId) {
        // Clear any existing timeout
        if (this.preloadTimeout) {
            clearTimeout(this.preloadTimeout);
        }
        
        // Start preloading after 500ms hover delay
        this.preloadTimeout = setTimeout(() => {
            this.preloadImage(engravingId);
        }, 500);
    },

    /**
     * Cancel hover preload if user moves away quickly
     * @param {string} engravingId - Engraving ID
     */
    cancelHoverPreload(engravingId) {
        if (this.preloadTimeout) {
            clearTimeout(this.preloadTimeout);
            this.preloadTimeout = null;
        }
        
        // Cancel ongoing preload if it exists
        if (this.currentPreload && this.currentPreload.engravingId === engravingId) {
            this.currentPreload.img.src = '';
            this.currentPreload = null;
        }
    },

    /**
     * Preload full resolution image with WebP support
     * @param {string} engravingId - Engraving ID to preload
     */
    async preloadImage(engravingId) {
        // Don't preload if already loaded or currently loading
        if (this.preloadedImages?.has(engravingId) ||
            (this.currentPreload && this.currentPreload.engravingId === engravingId)) {
            return;
        }
        
        console.log('🔄 Preloading image for hover:', engravingId);
        
        const fullSrc = await DataLoader.getImageSrc(engravingId);
        const img = new Image();
        
        this.currentPreload = { img, engravingId };
        
        img.onload = () => {
            console.log('✅ Preloaded:', engravingId);
            
            // Initialize preloaded images set if needed
            if (!this.preloadedImages) {
                this.preloadedImages = new Set();
            }
            
            this.preloadedImages.add(engravingId);
            this.currentPreload = null;
        };
        
        img.onerror = () => {
            console.warn('❌ Failed to preload:', engravingId);
            this.currentPreload = null;
        };
        
        img.src = fullSrc;
    },

    /**
     * Auto-zoom map to fit all markers with padding
     */
    fitMapToMarkers() {
        if (AppState.filteredEngravings.length === 0) return;
        
        // Create array of coordinates
        const coordinates = AppState.filteredEngravings.map(engraving => {
            const { lat, lng } = engraving.location.viewpoint.coordinates;
            return [lat, lng];
        });
        
        // Create bounds from coordinates
        const bounds = L.latLngBounds(coordinates);
        
        // Fit map to bounds with much tighter framing
        AppState.map.fitBounds(bounds, {
            padding: [40, 40], // Reduced padding for tighter view
            maxZoom: 15,       // Allow even closer zoom
            animate: false     // No animation for static feel
        });
        
        // After fitting bounds, zoom in one more level for tighter framing
        setTimeout(() => {
            const currentZoom = AppState.map.getZoom();
            if (currentZoom < 15) {
                AppState.map.setZoom(currentZoom + 1, { animate: false });
            }
        }, 100);
        
        console.log('🎯 Map fitted to show all markers with tight framing');
    },

    /**
     * Focus map on specific engraving
     * @param {Object} engraving - Engraving metadata object
     */
    focusOnEngraving(engraving) {
        const { lat, lng } = engraving.location.viewpoint.coordinates;
        // For static map, just pan to the location without changing zoom
        AppState.map.panTo([lat, lng], { animate: true });
    }
};
