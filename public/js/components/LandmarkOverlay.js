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
                
                /* Mobile-optimized landmark detail modal */
                .landmark-detail-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: none;
                    z-index: 1000;
                    overflow-y: auto;
                }
                
                .landmark-detail-content {
                    background: white;
                    margin: 20px;
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 600px;
                    margin: 40px auto;
                    position: relative;
                }
                
                @media (max-width: 768px) {
                    .landmark-detail-content {
                        margin: 0;
                        border-radius: 0;
                        height: 100%;
                        padding: 20px;
                        display: flex;
                        flex-direction: column;
                    }
                }
                
                .landmark-detail-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 8px;
                    line-height: 1;
                }
                
                .landmark-detail-close:hover {
                    color: #000;
                }
                
                .landmark-detail-header {
                    margin-bottom: 20px;
                }
                
                .landmark-detail-title {
                    font-size: 24px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                    color: #333;
                }
                
                .landmark-detail-category {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .landmark-detail-category.government {
                    background: #3b82f6;
                    color: white;
                }
                
                .landmark-detail-category.bridge {
                    background: #10b981;
                    color: white;
                }
                
                .landmark-detail-category.transportation {
                    background: #f59e0b;
                    color: white;
                }
                
                .landmark-detail-category.public_space {
                    background: #8b5cf6;
                    color: white;
                }
                
                .landmark-detail-category.religious {
                    background: #ef4444;
                    color: white;
                }
                
                .landmark-detail-description {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #555;
                    margin-bottom: 20px;
                }
                
                .landmark-detail-blip {
                    font-size: 15px;
                    line-height: 1.7;
                    color: #333;
                    margin-bottom: 20px;
                }
                
                .landmark-detail-context {
                    background: #f8f9fa;
                    padding: 16px;
                    border-radius: 8px;
                    font-style: italic;
                    color: #666;
                    margin-bottom: 20px;
                }
                
                .landmark-detail-links {
                    margin-top: 20px;
                }
                
                .landmark-detail-links h4 {
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    color: #333;
                }
                
                .landmark-detail-link {
                    display: block;
                    color: #3b82f6;
                    text-decoration: none;
                    padding: 8px 0;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .landmark-detail-link:hover {
                    color: #1d4ed8;
                }
                
                .landmark-detail-link:last-child {
                    border-bottom: none;
                }
                
                .landmark-appears-in {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                }
                
                .landmark-appears-in h4 {
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    color: #333;
                }
                
                .landmark-appears-in-item {
                    background: #f3f4f6;
                    padding: 8px 12px;
                    border-radius: 6px;
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #555;
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
    async createOverlay(engraving, imageContainer) {
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

        // Create markers for each landmark (async)
        const markerPromises = engraving.landmarks.map(landmark => 
            this.createMarker(landmark, engraving.id)
        );
        
        const markers = await Promise.all(markerPromises);
        markers.forEach(marker => {
            if (marker) {
                overlay.appendChild(marker);
            }
        });

        // Add toggle button to container
        imageContainer.style.position = 'relative';
        imageContainer.appendChild(toggleButton);
        imageContainer.appendChild(overlay);

        return overlay;
    },

    /**
     * Create a landmark marker
     * @param {Object} landmarkRef - Landmark reference with landmarkId and coordinates
     * @param {string} engravingId - ID of the engraving
     * @returns {HTMLElement} Marker element
     */
    async createMarker(landmarkRef, engravingId) {
        const landmarkData = await DataLoader.getLandmark(landmarkRef.landmarkId);
        if (!landmarkData) {
            console.warn(`Landmark not found: ${landmarkRef.landmarkId}`);
            return null;
        }

        const marker = document.createElement('div');
        marker.className = `landmark-marker category-${landmarkData.category}`;
        marker.style.left = `${landmarkRef.x}%`;
        marker.style.top = `${landmarkRef.y}%`;
        marker.setAttribute('data-landmark-id', landmarkRef.landmarkId);
        marker.setAttribute('data-engraving-id', engravingId);

        // Add hover events for desktop
        marker.addEventListener('mouseenter', (e) => {
            this.showTooltip(e, landmarkData);
        });

        marker.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });

        // Add click event for mobile detail modal
        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showLandmarkDetail(landmarkData);
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
     * Show landmark detail modal (mobile-optimized)
     * @param {Object} landmark - Landmark data
     */
    showLandmarkDetail(landmark) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('landmark-detail-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'landmark-detail-modal';
            modal.className = 'landmark-detail-modal';
            document.body.appendChild(modal);
        }

        // Build modal content
        const appearsInList = landmark.appearsIn.map(engravingId => {
            const engraving = AppState.engravingsData.find(e => e.id === engravingId);
            return engraving ? engraving.title : engravingId;
        }).join(', ');

        modal.innerHTML = `
            <div class="landmark-detail-content">
                <button class="landmark-detail-close" onclick="LandmarkOverlay.closeLandmarkDetail()">&times;</button>
                
                <div class="landmark-detail-header">
                    <h2 class="landmark-detail-title">${landmark.name}</h2>
                    <span class="landmark-detail-category ${landmark.category}">${landmark.category}</span>
                </div>
                
                <div class="landmark-detail-description">
                    ${landmark.description}
                </div>
                
                <div class="landmark-detail-blip">
                    ${landmark.blip}
                </div>
                
                <div class="landmark-detail-context">
                    ${landmark.historicalContext}
                </div>
                
                ${landmark.links && landmark.links.length > 0 ? `
                    <div class="landmark-detail-links">
                        <h4>Learn More</h4>
                        ${landmark.links.map(link => `
                            <a href="${link}" target="_blank" rel="noopener noreferrer" class="landmark-detail-link">
                                ${this.getDomainFromUrl(link)}
                            </a>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="landmark-appears-in">
                    <h4>Appears in Engravings</h4>
                    <div class="landmark-appears-in-item">
                        ${appearsInList}
                    </div>
                </div>
            </div>
        `;

        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeLandmarkDetail();
            }
        });
    },

    /**
     * Close landmark detail modal
     */
    closeLandmarkDetail() {
        const modal = document.getElementById('landmark-detail-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    /**
     * Get domain from URL for display
     * @param {string} url - URL to extract domain from
     * @returns {string} Domain name
     */
    getDomainFromUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch (e) {
            return url;
        }
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
