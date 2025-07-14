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

        // Create map
        AppState.map = L.map(mapContainer, {
            center: Config.CINCINNATI_CENTER,
            zoom: 12,
            zoomControl: true,
            attributionControl: true
        });

        // Add initial layer (modern)
        this.addLayer('modern');
        
        // Create markers layer group
        AppState.markersLayer = L.layerGroup().addTo(AppState.map);
        
        // Set up layer switching
        this.setupLayerSwitching();
        
        console.log('🗺️ Map initialized');
    },

    /**
     * Add map layer
     * @param {string} layerType - 'modern' or 'historical'
     */
    addLayer(layerType) {
        const layerConfig = Config.MAP_LAYERS[layerType];
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

    /**
     * Setup layer switching functionality
     */
    setupLayerSwitching() {
        const mapLayerRadios = document.querySelectorAll('input[name="map-layer"]');
        mapLayerRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.removeAllLayers();
                this.addLayer(e.target.value);
            });
        });
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
        
        console.log(`📍 Rendered ${AppState.filteredEngravings.length} markers`);
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
