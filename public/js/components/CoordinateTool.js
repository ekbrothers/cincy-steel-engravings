/**
 * CoordinateTool Component
 * Interactive tool for finding and copying coordinates on the map
 */
const CoordinateTool = {
    isActive: false,
    currentMarker: null,
    
    /**
     * Initialize the coordinate tool (hidden from users)
     */
    init() {
        this.setupMapClickHandler();
        this.setupSecretActivation();
        console.log('🎯 Coordinate tool initialized (hidden)');
    },
    
    /**
     * Setup secret activation method for development use
     */
    setupSecretActivation() {
        // Secret key combination: Ctrl+Shift+C
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.createToolButton();
                this.showToast('🎯 Coordinate tool activated!', 'success');
            }
        });
    },
    
    /**
     * Create the coordinate tool button
     */
    createToolButton() {
        // Check if button already exists
        if (document.getElementById('coordinate-tool-btn')) {
            return;
        }
        
        const toolButton = document.createElement('button');
        toolButton.id = 'coordinate-tool-btn';
        toolButton.className = 'coordinate-tool-btn';
        toolButton.innerHTML = '📍 Find Coordinates';
        toolButton.title = 'Click to activate coordinate finder, then click on map to get coordinates';
        
        // Add button to the page
        const findCoordsBtn = document.getElementById('find-coordinates-btn');
        if (findCoordsBtn) {
            findCoordsBtn.parentNode.replaceChild(toolButton, findCoordsBtn);
        } else {
            // Fallback: add to body if find-coordinates-btn doesn't exist
            document.body.appendChild(toolButton);
        }
        
        toolButton.addEventListener('click', () => {
            this.toggle();
        });
    },
    
    /**
     * Toggle coordinate tool on/off
     */
    toggle() {
        this.isActive = !this.isActive;
        const button = document.getElementById('coordinate-tool-btn');
        
        if (this.isActive) {
            button.innerHTML = '❌ Stop Finding';
            button.classList.add('active');
            document.body.style.cursor = 'crosshair';
            this.showInstructions();
        } else {
            button.innerHTML = '📍 Find Coordinates';
            button.classList.remove('active');
            document.body.style.cursor = 'default';
            this.hideInstructions();
            this.clearMarker();
        }
    },
    
    /**
     * Setup map click handler for coordinate finding
     */
    setupMapClickHandler() {
        if (!AppState.map) return;
        
        AppState.map.on('click', (e) => {
            if (!this.isActive) return;
            
            const { lat, lng } = e.latlng;
            this.showCoordinate(lat, lng);
        });
    },
    
    /**
     * Show coordinate at clicked location
     */
    showCoordinate(lat, lng) {
        // Clear previous marker
        this.clearMarker();
        
        // Create new marker at clicked location
        this.currentMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'coordinate-marker',
                html: `
                    <div class="coordinate-marker-content">
                        <div class="coordinate-marker-dot"></div>
                        <div class="coordinate-marker-label">📍</div>
                    </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            })
        }).addTo(AppState.map);
        
        // Show coordinate popup
        this.showCoordinatePopup(lat, lng);
    },
    
    /**
     * Show coordinate popup with copy functionality
     */
    showCoordinatePopup(lat, lng) {
        const roundedLat = lat.toFixed(6);
        const roundedLng = lng.toFixed(6);
        
        // Create popup content
        const popupContent = `
            <div class="coordinate-popup">
                <h4>📍 Coordinates Found</h4>
                <div class="coordinate-display">
                    <strong>Latitude:</strong> ${roundedLat}<br>
                    <strong>Longitude:</strong> ${roundedLng}
                </div>
                <div class="coordinate-actions">
                    <button onclick="CoordinateTool.copyCoordinates(${roundedLat}, ${roundedLng})" class="copy-btn">
                        📋 Copy Coordinates
                    </button>
                    <button onclick="CoordinateTool.copyJSON(${roundedLat}, ${roundedLng})" class="copy-json-btn">
                        📄 Copy JSON Format
                    </button>
                </div>
                <div class="coordinate-help">
                    <small>Click anywhere else on the map to find new coordinates</small>
                </div>
            </div>
        `;
        
        this.currentMarker.bindPopup(popupContent, {
            maxWidth: 300,
            closeButton: false
        }).openPopup();
    },
    
    /**
     * Copy coordinates to clipboard
     */
    async copyCoordinates(lat, lng) {
        const coordText = `${lat}, ${lng}`;
        try {
            await navigator.clipboard.writeText(coordText);
            this.showToast('Coordinates copied to clipboard!', 'success');
        } catch (err) {
            this.fallbackCopy(coordText);
        }
    },
    
    /**
     * Copy coordinates in JSON format
     */
    async copyJSON(lat, lng) {
        const jsonText = `"coordinates": {\n  "lat": ${lat},\n  "lng": ${lng}\n}`;
        try {
            await navigator.clipboard.writeText(jsonText);
            this.showToast('JSON coordinates copied to clipboard!', 'success');
        } catch (err) {
            this.fallbackCopy(jsonText);
        }
    },
    
    /**
     * Fallback copy method for older browsers
     */
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showToast('Coordinates copied to clipboard!', 'success');
            } else {
                this.showToast('Failed to copy coordinates', 'error');
            }
        } catch (err) {
            this.showToast('Failed to copy coordinates', 'error');
        }
        
        document.body.removeChild(textArea);
    },
    
    /**
     * Clear current coordinate marker
     */
    clearMarker() {
        if (this.currentMarker) {
            AppState.map.removeLayer(this.currentMarker);
            this.currentMarker = null;
        }
    },
    
    /**
     * Show instructions overlay
     */
    showInstructions() {
        const instructions = document.createElement('div');
        instructions.id = 'coordinate-instructions';
        instructions.className = 'coordinate-instructions';
        instructions.innerHTML = `
            <div class="instructions-content">
                <h3>🎯 Coordinate Finder Active</h3>
                <p>Click anywhere on the map to get precise coordinates for that location.</p>
                <p>Use these coordinates to accurately place your steel engravings!</p>
            </div>
        `;
        
        document.body.appendChild(instructions);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (document.getElementById('coordinate-instructions')) {
                this.hideInstructions();
            }
        }, 5000);
    },
    
    /**
     * Hide instructions overlay
     */
    hideInstructions() {
        const instructions = document.getElementById('coordinate-instructions');
        if (instructions) {
            instructions.remove();
        }
    },
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `coordinate-toast coordinate-toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
};