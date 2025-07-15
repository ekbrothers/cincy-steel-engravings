/**
 * MapComponent
 * Handles map initialization and marker rendering
 */
const MapComponent = {
    /**
     * Initialize the Leaflet map
     */
    init() {
        console.log('Initializing map...');
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('Map container not found!');
            throw new Error('Map container not found');
        }

        console.log('Map container found, dimensions:', mapContainer.offsetWidth, 'x', mapContainer.offsetHeight);
        
        try {
            // Create map with explicit dimensions
            mapContainer.style.height = '100%';
            mapContainer.style.width = '100%';
            
            // Create map
            AppState.map = L.map(mapContainer, {
                center: Config.CINCINNATI_CENTER,
                zoom: 12,
                zoomControl: true,
                attributionControl: true
            });
            
            console.log('Map object created:', AppState.map);

            // Add initial layer (modern)
            this.addLayer('modern');
            
            // Create markers layer group
            AppState.markersLayer = L.layerGroup().addTo(AppState.map);
            
            // Set up layer switching
            this.setupLayerSwitching();
            
            // Force a resize event to ensure map renders correctly
            setTimeout(() => {
                console.log('Triggering map resize event');
                AppState.map.invalidateSize();
            }, 100);
            
            console.log('🗺️ Map initialized successfully');
        } catch (error) {
            console.error('Error initializing map:', error);
            throw error;
        }
    },

    /**
     * Add map layer
     * @param {string} layerType - 'modern' or 'historical'
     */
    addLayer(layerType) {
        console.log(`Adding map layer: ${layerType}`);
        const layerConfig = Config.MAP_LAYERS[layerType];
        if (!layerConfig) {
            console.error(`Layer config not found for: ${layerType}`);
            return;
        }

        try {
            const tileLayer = L.tileLayer(layerConfig.url, {
                attribution: layerConfig.attribution,
                maxZoom: layerConfig.maxZoom
            });
            
            tileLayer.addTo(AppState.map);
            console.log(`✅ Added ${layerType} layer successfully`);
        } catch (error) {
            console.error(`Error adding ${layerType} layer:`, error);
        }
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

    /**
     * Setup layer switching functionality
     */
    setupLayerSwitching() {
        // This is now handled by the filter chips in initFilterChips() in app.js
        console.log('🔄 Layer switching setup - using filter chips');
    },
    
    /**
     * Switch map layer
     * @param {string} layerType - 'modern' or 'historical'
     */
    switchLayer(layerType) {
        console.log(`🔄 Switching map layer to: ${layerType}`);
        this.removeAllLayers();
        this.addLayer(layerType);
    },

    /**
     * Render markers on map
     */
    renderMarkers() {
        AppState.markersLayer.clearLayers();
        
        AppState.filteredEngravings.forEach(engraving => {
            const { lat, lng } = engraving.location.viewpoint.coordinates;
            
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
                });
            
            AppState.markersLayer.addLayer(marker);
        });
        
        // Auto-zoom to fit all markers
        this.fitMapToMarkers();
        
        console.log(`📍 Rendered ${AppState.filteredEngravings.length} markers`);
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
        
        // Fit map to bounds with padding
        AppState.map.fitBounds(bounds, {
            padding: [20, 20], // 20px padding on all sides
            maxZoom: 15 // Don't zoom in too close for single markers
        });
        
        console.log('🎯 Map auto-zoomed to fit all markers');
    },

    /**
     * Focus map on specific engraving
     * @param {Object} engraving - Engraving metadata object
     */
    focusOnEngraving(engraving) {
        const { lat, lng } = engraving.location.viewpoint.coordinates;
        AppState.map.setView([lat, lng], 15, { animate: true });
    }
};
