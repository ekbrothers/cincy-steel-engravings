/**
 * LandmarkOverlay Component
 * Displays interactive landmark markers on steel engravings
 */
const LandmarkOverlay = {
    /**
     * Initialize the landmark overlay system
     */
    init() {
        this.setupStyles();
        console.log('🏛️ Landmark overlay component initialized');
    },

    /**
     * Setup CSS styles for landmarks
     */
    setupStyles() {
        if (!document.querySelector('#landmark-styles')) {
            const style = document.createElement('style');
            style.id = 'landmark-styles';
            style.textContent = `
                .landmark-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 10;
                }
                
                .landmark-marker {
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    background: #ff4444;
                    border: 2px solid white;
                    border-radius: 50%;
                    cursor: pointer;
                    pointer-events: auto;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    transition: all 0.2s ease;
                    z-index: 11;
                }
                
                .landmark-marker:hover {
                    transform: translate(-50%, -50%) scale(1.2);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                }
                
                .landmark-marker.category-government {
                    background: #3b82f6;
                }
                
                .landmark-marker.category-bridge {
                    background: #10b981;
                }
                
                .landmark-marker.category-transportation {
                    background: #f59e0b;
                }
                
                .landmark-marker.category-building {
                    background: #8b5cf6;
                }
                
                .landmark-marker.category-church {
                    background: #ef4444;
                }
                
                .landmark-tooltip {
                    position: absolute;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 14px;
                    line-height: 1.4;
                    max-width: 250px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 12;
                    pointer-events: none;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.2s ease;
                }
                
                .landmark-tooltip.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .landmark-tooltip h4 {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .landmark-tooltip p {
                    margin: 0 0 8px 0;
                }
                
                .landmark-tooltip .historical-context {
                    font-style: italic;
                    color: #ccc;
                    margin: 0;
                }
                
                .landmark-toggle {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    z-index: 13;
                }
                
                .landmark-toggle:hover {
                    background: rgba(0, 0, 0, 0.9);
                }
                
                .landmark-toggle.active {
                    background: #3b82f6;
                }
                
                .landmark-overlay.hidden {
                    display: none;
                }
            `;
            document.head.appendChild(style);
        }
    },

    /**
     * Create landmark overlay for an image
     * @param {Object} engraving - Engraving data with landmarks
     * @param {HTMLElement} imageContainer - Container element for the image
     * @returns {HTMLElement} Overlay element
     */
    createOverlay(engraving, imageContainer) {
        if (!engraving.landmarks || engraving.landmarks.length === 0) {
            return null;
        }

        const overlay = document.createElement('div');
        overlay.className = 'landmark-overlay hidden';
        overlay.id = `landmark-overlay-${engraving.id}`;

        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'landmark-toggle';
        toggleButton.textContent = 'Show Landmarks';
        toggleButton.onclick = () => this.toggleOverlay(engraving.id);

        // Create markers for each landmark
        engraving.landmarks.forEach(landmark => {
            const marker = this.createMarker(landmark, engraving.id);
            overlay.appendChild(marker);
        });

        // Add toggle button to container
        imageContainer.style.position = 'relative';
        imageContainer.appendChild(toggleButton);
        imageContainer.appendChild(overlay);

        return overlay;
    },

    /**
     * Create a landmark marker
     * @param {Object} landmark - Landmark data
     * @param {string} engravingId - ID of the engraving
     * @returns {HTMLElement} Marker element
     */
    createMarker(landmark, engravingId) {
        const marker = document.createElement('div');
        marker.className = `landmark-marker category-${landmark.category}`;
        marker.style.left = `${landmark.x}%`;
        marker.style.top = `${landmark.y}%`;
        marker.setAttribute('data-landmark-id', landmark.id);
        marker.setAttribute('data-engraving-id', engravingId);

        // Add hover events
        marker.addEventListener('mouseenter', (e) => {
            this.showTooltip(e, landmark);
        });

        marker.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });

        // Add click event for mobile
        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTooltip(e, landmark);
        });

        return marker;
    },

    /**
     * Toggle landmark overlay visibility
     * @param {string} engravingId - ID of the engraving
     */
    toggleOverlay(engravingId) {
        const overlay = document.getElementById(`landmark-overlay-${engravingId}`);
        const toggleButton = document.querySelector(`[onclick="LandmarkOverlay.toggleOverlay('${engravingId}')"]`);
        
        if (!overlay || !toggleButton) return;

        const isHidden = overlay.classList.contains('hidden');
        
        if (isHidden) {
            overlay.classList.remove('hidden');
            toggleButton.textContent = 'Hide Landmarks';
            toggleButton.classList.add('active');
        } else {
            overlay.classList.add('hidden');
            toggleButton.textContent = 'Show Landmarks';
            toggleButton.classList.remove('active');
            this.hideTooltip();
        }
    },

    /**
     * Show tooltip for a landmark
     * @param {Event} e - Mouse event
     * @param {Object} landmark - Landmark data
     */
    showTooltip(e, landmark) {
        this.hideTooltip(); // Hide any existing tooltip

        const tooltip = document.createElement('div');
        tooltip.className = 'landmark-tooltip';
        tooltip.innerHTML = `
            <h4>${landmark.name}</h4>
            <p>${landmark.description}</p>
            <p class="historical-context">${landmark.historicalContext}</p>
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = e.target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 10;

        // Adjust if tooltip goes off screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) {
            top = rect.bottom + 10;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;

        // Show tooltip with animation
        setTimeout(() => {
            tooltip.classList.add('show');
        }, 10);

        // Store reference for cleanup
        this.currentTooltip = tooltip;
    },

    /**
     * Hide current tooltip
     */
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.classList.remove('show');
            setTimeout(() => {
                if (this.currentTooltip && this.currentTooltip.parentNode) {
                    this.currentTooltip.parentNode.removeChild(this.currentTooltip);
                }
                this.currentTooltip = null;
            }, 200);
        }
    },

    /**
     * Toggle tooltip for mobile (click event)
     * @param {Event} e - Click event
     * @param {Object} landmark - Landmark data
     */
    toggleTooltip(e, landmark) {
        if (this.currentTooltip) {
            this.hideTooltip();
        } else {
            this.showTooltip(e, landmark);
        }
    },

    /**
     * Get landmarks for an engraving
     * @param {string} engravingId - ID of the engraving
     * @returns {Array} Array of landmarks
     */
    getLandmarks(engravingId) {
        const engraving = AppState.engravingsData.find(e => e.id === engravingId);
        return engraving && engraving.landmarks ? engraving.landmarks : [];
    },

    /**
     * Filter landmarks by category
     * @param {string} engravingId - ID of the engraving
     * @param {string} category - Category to filter by
     */
    filterByCategory(engravingId, category) {
        const overlay = document.getElementById(`landmark-overlay-${engravingId}`);
        if (!overlay) return;

        const markers = overlay.querySelectorAll('.landmark-marker');
        markers.forEach(marker => {
            const landmarkId = marker.getAttribute('data-landmark-id');
            const landmark = this.getLandmarks(engravingId).find(l => l.id === landmarkId);
            
            if (category === 'all' || landmark.category === category) {
                marker.style.display = 'block';
            } else {
                marker.style.display = 'none';
            }
        });
    }
};
