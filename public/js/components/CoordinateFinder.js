/**
 * CoordinateFinder - Admin tool for finding landmark coordinates
 * Click on images to get percentage-based coordinates for landmarks
 */
const CoordinateFinder = {
    /**
     * Initialize coordinate finder
     */
    init() {
        this.setupStyles();
        this.setupToggleButton();
        this.isActive = false;
        this.coordinates = [];
        console.log('📍 Coordinate finder initialized');
    },

    /**
     * Setup CSS styles for coordinate finder
     */
    setupStyles() {
        if (!document.querySelector('#coordinate-finder-styles')) {
            const style = document.createElement('style');
            style.id = 'coordinate-finder-styles';
            style.textContent = `
                .coordinate-finder-toggle {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    z-index: 9999;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    transition: all 0.2s ease;
                }
                
                .coordinate-finder-toggle:hover {
                    background: #ff5252;
                    transform: translateY(-2px);
                }
                
                .coordinate-finder-toggle.active {
                    background: #4caf50;
                }
                
                .coordinate-finder-active {
                    cursor: crosshair !important;
                }
                
                .coordinate-marker {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background: #ff6b6b;
                    border: 2px solid white;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 100;
                    pointer-events: none;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    animation: pulse 1s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.2); }
                }
                
                .coordinate-info {
                    position: fixed;
                    top: 70px;
                    left: 20px;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 12px;
                    z-index: 9999;
                    max-width: 300px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    display: none;
                }
                
                .coordinate-info.show {
                    display: block;
                }
                
                .coordinate-info h4 {
                    margin: 0 0 10px 0;
                    color: #4caf50;
                }
                
                .coordinate-info pre {
                    background: #1a1a1a;
                    padding: 10px;
                    border-radius: 4px;
                    margin: 8px 0;
                    overflow-x: auto;
                    font-size: 11px;
                }
                
                .coordinate-info button {
                    background: #4caf50;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    margin: 4px 2px;
                }
                
                .coordinate-info button:hover {
                    background: #45a049;
                }
                
                .coordinate-info .clear-btn {
                    background: #f44336;
                }
                
                .coordinate-info .clear-btn:hover {
                    background: #da190b;
                }
            `;
            document.head.appendChild(style);
        }
    },

    /**
     * Setup toggle button for coordinate finder
     */
    setupToggleButton() {
        const toggleButton = document.createElement('button');
        toggleButton.id = 'coordinate-finder-toggle';
        toggleButton.className = 'coordinate-finder-toggle';
        toggleButton.textContent = 'Find Coordinates';
        toggleButton.onclick = () => this.toggle();
        document.body.appendChild(toggleButton);

        // Create info panel
        const infoPanel = document.createElement('div');
        infoPanel.id = 'coordinate-info';
        infoPanel.className = 'coordinate-info';
        document.body.appendChild(infoPanel);
    },

    /**
     * Toggle coordinate finder mode
     */
    toggle() {
        this.isActive = !this.isActive;
        const toggleButton = document.getElementById('coordinate-finder-toggle');
        const infoPanel = document.getElementById('coordinate-info');
        
        if (this.isActive) {
            toggleButton.textContent = 'Exit Coordinate Mode';
            toggleButton.classList.add('active');
            infoPanel.classList.add('show');
            this.enableFinder();
            this.updateInfoPanel();
        } else {
            toggleButton.textContent = 'Find Coordinates';
            toggleButton.classList.remove('active');
            infoPanel.classList.remove('show');
            this.disableFinder();
        }
    },

    /**
     * Enable coordinate finder
     */
    enableFinder() {
        // Add event listener to all images
        document.addEventListener('click', this.handleImageClick.bind(this));
        document.body.classList.add('coordinate-finder-active');
    },

    /**
     * Disable coordinate finder
     */
    disableFinder() {
        document.removeEventListener('click', this.handleImageClick.bind(this));
        document.body.classList.remove('coordinate-finder-active');
        this.clearMarkers();
    },

    /**
     * Handle image click to get coordinates
     */
    handleImageClick(e) {
        if (!this.isActive) return;
        
        const target = e.target;
        
        // Check if click is on an image within modal
        if (target.tagName === 'IMG' && target.closest('.engraving-image-container')) {
            e.preventDefault();
            e.stopPropagation();
            
            const rect = target.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            this.addCoordinate(x, y, target);
        }
    },

    /**
     * Add coordinate marker and data
     */
    addCoordinate(x, y, imageElement) {
        const coordinate = {
            x: Math.round(x * 10) / 10,
            y: Math.round(y * 10) / 10,
            timestamp: Date.now()
        };
        
        this.coordinates.push(coordinate);
        
        // Create visual marker
        const marker = document.createElement('div');
        marker.className = 'coordinate-marker';
        marker.style.left = `${x}%`;
        marker.style.top = `${y}%`;
        marker.setAttribute('data-coordinate-index', this.coordinates.length - 1);
        
        // Add marker to image container
        const container = imageElement.closest('.engraving-image-container');
        container.appendChild(marker);
        
        this.updateInfoPanel();
        
        // Copy to clipboard
        this.copyLastCoordinate();
    },

    /**
     * Update info panel with coordinates
     */
    updateInfoPanel() {
        const infoPanel = document.getElementById('coordinate-info');
        
        if (this.coordinates.length === 0) {
            infoPanel.innerHTML = `
                <h4>📍 Coordinate Finder</h4>
                <p>Click on an image to get coordinates for landmark placement.</p>
                <p>Coordinates are percentage-based (0-100% from top-left).</p>
            `;
            return;
        }
        
        const lastCoord = this.coordinates[this.coordinates.length - 1];
        const jsonOutput = this.generateJsonOutput();
        
        infoPanel.innerHTML = `
            <h4>📍 Coordinates Found (${this.coordinates.length})</h4>
            <p><strong>Latest:</strong> x: ${lastCoord.x}%, y: ${lastCoord.y}%</p>
            
            <h4>JSON Format:</h4>
            <pre>${jsonOutput}</pre>
            
            <button onclick="CoordinateFinder.copyAllCoordinates()">Copy All JSON</button>
            <button onclick="CoordinateFinder.copyLastCoordinate()">Copy Last</button>
            <button class="clear-btn" onclick="CoordinateFinder.clearCoordinates()">Clear All</button>
        `;
    },

    /**
     * Generate JSON output for coordinates
     */
    generateJsonOutput() {
        return JSON.stringify(this.coordinates.map((coord, index) => ({
            landmarkId: `landmark_${String(index + 1).padStart(3, '0')}`,
            x: coord.x,
            y: coord.y
        })), null, 2);
    },

    /**
     * Copy all coordinates to clipboard
     */
    async copyAllCoordinates() {
        const jsonOutput = this.generateJsonOutput();
        try {
            await navigator.clipboard.writeText(jsonOutput);
            this.showToast('All coordinates copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy coordinates:', err);
            this.showToast('Failed to copy coordinates');
        }
    },

    /**
     * Copy last coordinate to clipboard
     */
    async copyLastCoordinate() {
        if (this.coordinates.length === 0) return;
        
        const lastCoord = this.coordinates[this.coordinates.length - 1];
        const output = `{\n  "landmarkId": "landmark_id_here",\n  "x": ${lastCoord.x},\n  "y": ${lastCoord.y}\n}`;
        
        try {
            await navigator.clipboard.writeText(output);
            this.showToast(`Coordinate copied: ${lastCoord.x}%, ${lastCoord.y}%`);
        } catch (err) {
            console.error('Failed to copy coordinate:', err);
            this.showToast('Failed to copy coordinate');
        }
    },

    /**
     * Clear all coordinates and markers
     */
    clearCoordinates() {
        this.coordinates = [];
        this.clearMarkers();
        this.updateInfoPanel();
        this.showToast('All coordinates cleared');
    },

    /**
     * Clear visual markers
     */
    clearMarkers() {
        const markers = document.querySelectorAll('.coordinate-marker');
        markers.forEach(marker => marker.remove());
    },

    /**
     * Show toast notification
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
};

// Auto-initialize in development mode
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
    document.addEventListener('DOMContentLoaded', () => {
        CoordinateFinder.init();
    });
}
