/**
 * LandmarkOverlay Component
 * Clean, container-based approach for landmark positioning
 */
const LandmarkOverlay = {
    /**
     * Initialize the landmark overlay system
     */
    init() {
        this.setupStyles();
        console.log('🏛️ Clean landmark overlay component initialized');
    },

    /**
     * Setup CSS styles for landmarks
     */
    setupStyles() {
        if (!document.querySelector('#landmark-styles')) {
            const style = document.createElement('style');
            style.id = 'landmark-styles';
            style.textContent = `
                /* Clean container-based landmark overlay */
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
                    width: 20px;
                    height: 20px;
                    background: rgba(255, 68, 68, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    border-radius: 50%;
                    cursor: pointer;
                    pointer-events: auto;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
                    transition: all 0.2s ease;
                    z-index: 11;
                    opacity: 0.8;
                }
                
                .landmark-marker:hover {
                    transform: translate(-50%, -50%) scale(1.15);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    opacity: 1;
                }
                
                .landmark-marker.category-government {
                    background: rgba(59, 130, 246, 0.6);
                }
                
                .landmark-marker.category-bridge {
                    background: rgba(16, 185, 129, 0.6);
                }
                
                .landmark-marker.category-transportation {
                    background: rgba(245, 158, 11, 0.6);
                }
                
                .landmark-marker.category-building {
                    background: rgba(139, 92, 246, 0.6);
                }
                
                .landmark-marker.category-church {
                    background: rgba(239, 68, 68, 0.6);
                }
                
                .landmark-marker.category-religious {
                    background: rgba(239, 68, 68, 0.6);
                }
                
                .landmark-marker.category-public_space {
                    background: rgba(139, 92, 246, 0.6);
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
                    background: rgba(59, 130, 246, 0.4);
                    color: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    padding: 6px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: 400;
                    transition: all 0.2s ease;
                    z-index: 13;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
                    backdrop-filter: blur(8px);
                    opacity: 0.7;
                }
                
                .landmark-toggle:hover {
                    background: rgba(29, 78, 216, 0.6);
                    opacity: 1;
                    transform: scale(1.02);
                }
                
                .landmark-toggle.active {
                    background: rgba(16, 185, 129, 0.5);
                    border-color: rgba(16, 185, 129, 0.5);
                    opacity: 0.8;
                }
                
                .landmark-overlay.hidden {
                    display: none;
                }
                
                /* Mobile-optimized landmark detail modal - DARK MODE */
                .landmark-detail-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    height: 100vh;
                    height: 100dvh; /* Dynamic viewport height for mobile */
                    background: rgba(0, 0, 0, 0.95);
                    display: none;
                    z-index: 2000;
                    overflow: hidden;
                }
                
                .landmark-detail-content {
                    background: #1a1a1a;
                    color: #e5e5e5;
                    margin: 0;
                    height: 100%;
                    height: 100vh;
                    height: 100dvh;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                
                .landmark-detail-header {
                    background: #2d2d2d;
                    padding: env(safe-area-inset-top, 0px) 20px 16px 20px;
                    padding-top: max(env(safe-area-inset-top, 0px), 16px);
                    border-bottom: 1px solid #404040;
                    flex-shrink: 0;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                
                .landmark-detail-close {
                    position: absolute;
                    top: max(env(safe-area-inset-top, 0px), 16px);
                    top: calc(max(env(safe-area-inset-top, 0px), 16px) + 8px);
                    right: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    cursor: pointer;
                    color: #e5e5e5;
                    transition: all 0.2s ease;
                    z-index: 11;
                }
                
                .landmark-detail-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                    color: #ffffff;
                    transform: scale(1.1);
                }
                
                .landmark-detail-title {
                    font-size: 20px;
                    font-weight: 600;
                    margin: 0 50px 8px 0;
                    color: #ffffff;
                    line-height: 1.3;
                }
                
                .landmark-detail-category {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 400;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    opacity: 0.6;
                }
                
                .landmark-detail-category.government {
                    background: rgba(59, 130, 246, 0.8);
                    color: white;
                    border: 1px solid rgba(59, 130, 246, 0.4);
                }
                
                .landmark-detail-category.bridge {
                    background: rgba(16, 185, 129, 0.8);
                    color: white;
                    border: 1px solid rgba(16, 185, 129, 0.4);
                }
                
                .landmark-detail-category.transportation {
                    background: rgba(245, 158, 11, 0.8);
                    color: white;
                    border: 1px solid rgba(245, 158, 11, 0.4);
                }
                
                .landmark-detail-category.public_space {
                    background: rgba(139, 92, 246, 0.8);
                    color: white;
                    border: 1px solid rgba(139, 92, 246, 0.4);
                }
                
                .landmark-detail-category.religious {
                    background: rgba(239, 68, 68, 0.8);
                    color: white;
                    border: 1px solid rgba(239, 68, 68, 0.4);
                }
                
                .landmark-detail-status {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 400;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-left: 8px;
                    opacity: 0.8;
                }
                
                .landmark-detail-status.extant {
                    background: var(--color-extant);
                    color: white;
                    border: 1px solid var(--color-extant);
                    box-shadow: 0 2px 8px rgba(79, 121, 66, 0.3);
                }
                
                .landmark-detail-status.razed {
                    background: var(--color-razed);
                    color: white;
                    border: 1px solid var(--color-razed);
                    box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
                }
                
                .landmark-detail-status.altered {
                    background: var(--color-altered);
                    color: white;
                    border: 1px solid var(--color-altered);
                    box-shadow: 0 2px 8px rgba(205, 133, 63, 0.3);
                }
                
                .landmark-detail-body {
                    flex: 1;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                    padding: 20px;
                }
                
                .landmark-detail-description {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #d1d5db;
                    margin-bottom: 20px;
                }
                
                .landmark-detail-blip {
                    font-size: 15px;
                    line-height: 1.7;
                    color: #e5e5e5;
                    margin-bottom: 20px;
                }
                
                .landmark-detail-context {
                    background: #2d2d2d;
                    padding: 16px;
                    border-radius: 8px;
                    font-style: italic;
                    color: #a1a1a1;
                    margin-bottom: 20px;
                    border-left: 3px solid #3b82f6;
                }
                
                .landmark-detail-links {
                    margin-top: 20px;
                }
                
                .landmark-detail-links h4 {
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    color: #ffffff;
                }
                
                .landmark-detail-link {
                    display: block;
                    color: #60a5fa;
                    text-decoration: none;
                    padding: 12px 0;
                    border-bottom: 1px solid #404040;
                    transition: color 0.2s ease;
                }
                
                .landmark-detail-link:hover {
                    color: #93c5fd;
                }
                
                .landmark-detail-link:last-child {
                    border-bottom: none;
                }
                
                .landmark-appears-in {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #404040;
                }
                
                .landmark-appears-in h4 {
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    color: #ffffff;
                }
                
                .landmark-appears-in-item {
                    background: #2d2d2d;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #d1d5db;
                    border-left: 3px solid #10b981;
                }
                
                /* Desktop styles */
                @media (min-width: 769px) {
                    .landmark-detail-content {
                        background: #1a1a1a;
                        margin: 40px auto;
                        max-width: 600px;
                        border-radius: 12px;
                        height: auto;
                        max-height: 80vh;
                        border: 1px solid #404040;
                    }
                    
                    .landmark-detail-header {
                        border-radius: 12px 12px 0 0;
                        position: relative;
                    }
                    
                    .landmark-detail-title {
                        font-size: 24px;
                    }
                    
                    .landmark-detail-close {
                        top: 16px;
                        right: 16px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },

    /**
     * Create landmark overlay for an image using clean container approach
     * @param {Object} engraving - Engraving data with landmarks
     * @param {HTMLElement} imageContainer - Container element for the image
     * @returns {HTMLElement} Overlay element
     */
    async createOverlay(engraving, imageContainer) {
        console.log('🏛️ Creating clean landmark overlay for:', engraving.id);
        
        if (!engraving.landmarks || engraving.landmarks.length === 0) {
            console.log('🏛️ No landmarks found for engraving:', engraving.id);
            return null;
        }

        // Wait for image to load to get accurate dimensions
        const img = imageContainer.querySelector('img');
        if (!img) {
            console.warn('🏛️ No image found in container');
            return null;
        }

        // Wait for image to load if it hasn't already
        if (!img.complete) {
            await new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; // Resolve anyway to avoid hanging
            });
        }

        const overlay = document.createElement('div');
        overlay.className = 'landmark-overlay';
        overlay.id = `landmark-overlay-${engraving.id}`;

        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'landmark-toggle active';
        toggleButton.textContent = 'Hide Landmarks';
        toggleButton.onclick = () => this.toggleOverlay(engraving.id);

        console.log('🏛️ Creating markers for', engraving.landmarks.length, 'landmarks');

        // Create markers for each landmark
        const markerPromises = engraving.landmarks.map(landmark => 
            this.createMarker(landmark, engraving.id)
        );
        
        const markers = await Promise.all(markerPromises);
        const validMarkers = markers.filter(m => m);
        
        console.log('🏛️ Created', validMarkers.length, 'valid markers');
        
        validMarkers.forEach(marker => overlay.appendChild(marker));

        // Add components to container
        imageContainer.appendChild(toggleButton);
        imageContainer.appendChild(overlay);

        console.log('🏛️ Clean landmark overlay created successfully');
        console.log('🏛️ Container dimensions:', {
            width: imageContainer.offsetWidth,
            height: imageContainer.offsetHeight
        });
        console.log('🏛️ Image dimensions:', {
            width: img.offsetWidth,
            height: img.offsetHeight
        });
        
        return overlay;
    },

    /**
     * Create a landmark marker
     * @param {Object} landmarkRef - Landmark reference with landmarkId and coordinates
     * @param {string} engravingId - ID of the engraving
     * @returns {HTMLElement} Marker element
     */
    async createMarker(landmarkRef, engravingId) {
        console.log('🏛️ Creating marker for landmark:', landmarkRef.landmarkId);
        
        const landmarkData = await DataLoader.getLandmark(landmarkRef.landmarkId);
        console.log('🏛️ Landmark data loaded:', landmarkData);
        
        if (!landmarkData) {
            console.warn(`🚨 Landmark not found: ${landmarkRef.landmarkId}`);
            return null;
        }

        const marker = document.createElement('div');
        marker.className = `landmark-marker category-${landmarkData.category}`;
        marker.style.left = `${landmarkRef.x}%`;
        marker.style.top = `${landmarkRef.y}%`;
        marker.setAttribute('data-landmark-id', landmarkRef.landmarkId);
        marker.setAttribute('data-engraving-id', engravingId);

        console.log('🏛️ Marker created with styles:', {
            left: `${landmarkRef.x}%`,
            top: `${landmarkRef.y}%`,
            className: marker.className
        });

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
        console.log('🏛️ TOGGLE: toggleOverlay called with engravingId:', engravingId);
        
        const overlay = document.getElementById(`landmark-overlay-${engravingId}`);
        const toggleButton = overlay ? overlay.previousElementSibling : null;
        
        console.log('🏛️ TOGGLE: Found overlay:', overlay);
        console.log('🏛️ TOGGLE: Found button:', toggleButton);
        
        if (!overlay || !toggleButton) {
            console.log('🏛️ TOGGLE: Missing overlay or button, returning');
            return;
        }

        const isHidden = overlay.classList.contains('hidden');
        console.log('🏛️ TOGGLE: Overlay is hidden:', isHidden);
        console.log('🏛️ TOGGLE: Overlay classes:', overlay.classList.toString());
        
        if (isHidden) {
            console.log('🏛️ TOGGLE: Showing overlay');
            overlay.classList.remove('hidden');
            toggleButton.textContent = 'Hide Landmarks';
            toggleButton.classList.add('active');
            console.log('🏛️ TOGGLE: Overlay classes after show:', overlay.classList.toString());
            console.log('🏛️ TOGGLE: Overlay display style:', overlay.style.display);
            console.log('🏛️ TOGGLE: Number of markers in overlay:', overlay.children.length);
        } else {
            console.log('🏛️ TOGGLE: Hiding overlay');
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

        // Build modal content with clickable engraving links
        const appearsInItems = landmark.appearsIn.map(engravingId => {
            const engraving = AppState.engravingsData.find(e => e.id === engravingId);
            return engraving ? {
                id: engravingId,
                title: engraving.title
            } : {
                id: engravingId,
                title: engravingId
            };
        });

        // Generate status CSS class
        const statusClass = landmark.status ? landmark.status.toLowerCase().replace(' ', '-') : '';
        
        modal.innerHTML = `
            <div class="landmark-detail-content">
                <div class="landmark-detail-header">
                    <button class="landmark-detail-close" onclick="LandmarkOverlay.closeLandmarkDetail()">&times;</button>
                    <h2 class="landmark-detail-title">${landmark.name}</h2>
                    <span class="landmark-detail-category ${landmark.category}">${landmark.category}</span>
                    ${landmark.status ? `<span class="landmark-detail-status ${statusClass}">${landmark.status}</span>` : ''}
                </div>
                
                <div class="landmark-detail-body">
                    <div class="landmark-detail-description">
                        ${landmark.description}
                    </div>
                    
                    <div class="landmark-detail-blip">
                        ${landmark.blip}
                    </div>
                    
                    <div class="landmark-detail-context">
                        ${landmark.historicalContext}
                    </div>
                    
                    <div class="landmark-appears-in">
                        <h4>Appears in Engravings</h4>
                        ${appearsInItems.map(item => `
                            <div class="landmark-appears-in-item">
                                <a href="#" onclick="LandmarkOverlay.openEngraving('${item.id}'); return false;" class="landmark-detail-link">
                                    ${item.title}
                                </a>
                            </div>
                        `).join('')}
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
     * Open an engraving from the landmark modal
     * @param {string} engravingId - ID of the engraving to open
     */
    openEngraving(engravingId) {
        // Close the landmark detail modal first
        this.closeLandmarkDetail();
        
        // Close the current engraving modal if it's open
        const currentModal = document.getElementById('engraving-modal');
        if (currentModal) {
            currentModal.style.display = 'none';
        }
        
        // Open the new engraving modal
        setTimeout(() => {
            if (typeof ModalComponent !== 'undefined' && ModalComponent.showEngravingDetails) {
                ModalComponent.showEngravingDetails(engravingId);
            }
        }, 100);
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
