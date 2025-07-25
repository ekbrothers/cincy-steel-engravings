/**
 * ModalComponent
 * Sophisticated modal dialogs with smooth mobile interactions and polished animations
 */
const ModalComponent = {
    /**
     * Initialize modal component
     */
    init() {
        this.setupModalEventListeners();
        this.setupMobileGestures();
        this.setupSmoothAnimations();
        console.log('🖼️ Sophisticated modal component initialized');
    },

    /**
     * Setup modal event listeners
     */
    setupModalEventListeners() {
        // Close modal when clicking outside
        const engravingModal = document.getElementById('engraving-modal');
        if (engravingModal) {
            engravingModal.addEventListener('click', (e) => {
                if (e.target.id === 'engraving-modal') {
                    this.close();
                }
            });
        }

        // Close image modal when clicking outside
        const imageModal = document.getElementById('image-modal');
        if (imageModal) {
            imageModal.addEventListener('click', (e) => {
                // Only close if clicking outside the image
                if (e.target.id === 'image-modal' || 
                    e.target.classList.contains('image-modal-content')) {
                    this.closeImageModal();
                }
            });
        }

        // Ensure image modal is properly positioned and styled
        const imageZoomContainer = document.getElementById('image-zoom-container');
        if (imageZoomContainer) {
            imageZoomContainer.style.width = '100%';
            imageZoomContainer.style.height = '100%';
            imageZoomContainer.style.display = 'flex';
            imageZoomContainer.style.alignItems = 'center';
            imageZoomContainer.style.justifyContent = 'center';
        }

        // Enhanced keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeImageModal();
                this.close();
                this.triggerHapticFeedback('light');
            }
        });
    },

    /**
     * Setup mobile gesture handling
     */
    setupMobileGestures() {
        // Swipe down to close modal on mobile (only for regular modals, not image zoom)
        let startY = 0;
        let currentY = 0;
        let isSwipeGesture = false;

        document.addEventListener('touchstart', (e) => {
            const modal = document.getElementById('engraving-modal');
            const imageModal = document.getElementById('image-modal');
            const imageZoomContainer = document.getElementById('image-zoom-container');
            
            // Only handle swipe-to-close for regular modal, not when zooming images
            if ((modal && modal.style.display === 'flex' && !imageZoomContainer) || 
                (imageModal && imageModal.style.display === 'flex' && AppState.currentZoom <= 1)) {
                startY = e.touches[0].clientY;
                isSwipeGesture = false;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!startY) return;
            
            currentY = e.touches[0].clientY;
            const diffY = currentY - startY;
            
            // Check if it's a downward swipe and not in zoom mode
            if (diffY > 50 && AppState.currentZoom <= 1) {
                isSwipeGesture = true;
                
                // Add visual feedback for swipe gesture
                const modalContent = document.querySelector('.modal-content');
                if (modalContent && diffY < 200) {
                    const opacity = Math.max(0.3, 1 - (diffY / 300));
                    const scale = Math.max(0.9, 1 - (diffY / 1000));
                    modalContent.style.transform = `translateY(${diffY * 0.5}px) scale(${scale})`;
                    modalContent.style.opacity = opacity;
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (isSwipeGesture && currentY - startY > 100 && AppState.currentZoom <= 1) {
                this.closeImageModal();
                this.close();
                this.triggerHapticFeedback('medium');
            } else {
                // Reset modal position if swipe wasn't enough
                const modalContent = document.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.transform = '';
                    modalContent.style.opacity = '';
                }
            }
            
            startY = 0;
            currentY = 0;
            isSwipeGesture = false;
        }, { passive: true });
    },

    /**
     * Setup smooth animations
     */
    setupSmoothAnimations() {
        // Add CSS for smooth modal animations if not already present
        if (!document.querySelector('#modal-animations')) {
            const style = document.createElement('style');
            style.id = 'modal-animations';
            style.textContent = `
                .modal {
                    transition: opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                }
                
                .modal-content {
                    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), 
                               opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                }
                
                .engraving-img {
                    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                    cursor: pointer;
                }
                
                .engraving-img:hover {
                    transform: scale(1.02);
                }
                
                .engraving-img:active {
                    transform: scale(0.98);
                }
                
                .loading-spinner {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .image-placeholder {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 300px;
                    background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
                    border-radius: var(--radius-xl);
                    animation: shimmer 2s ease-in-out infinite;
                }
                
                @keyframes shimmer {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                .metadata-item {
                    transition: background-color 0.2s ease, transform 0.2s ease;
                }
                
                .metadata-item:hover {
                    background-color: rgba(0, 0, 0, 0.04);
                    transform: translateY(-1px);
                }
            `;
            document.head.appendChild(style);
        }
    },


    /**
     * Show engraving details in modal with progressive loading
     * @param {string} engravingId - Engraving ID to display
     */
    async showEngravingDetails(engravingId) {
        const startTime = performance.now();
        const engraving = AppState.engravingsData.find(e => e.id === engravingId);
        if (!engraving) {
            console.error('Engraving not found:', engravingId);
            return;
        }

        // Reset viewport zoom for mobile devices to prevent zoomed modals
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0');
        }

        console.log('📖 Showing engraving details with progressive loading:', engraving.title);

        const modal = document.getElementById('engraving-modal');
        const modalBody = document.getElementById('modal-body');
        
        // Get image sources - use WebP if supported, fallback to JPEG/PNG
        const thumbnailSrc = await DataLoader.getThumbnailSrc(engraving.id);
        const fullSrc = await DataLoader.getImageSrc(engraving.id);
        
        modalBody.innerHTML = `
            <div class="engraving-details">
                <div class="engraving-image-wrapper">
                    <div class="engraving-image-container">
                        <img src="${thumbnailSrc}"
                             alt="${engraving.title}"
                             class="engraving-img progressive-image"
                             data-full-src="${fullSrc}"
                             onclick="ModalComponent.showFullImage('${encodeURIComponent(fullSrc)}', '${engraving.title}')"
                             onload="ModalComponent.adjustModalSize(this)" />
                        <div class="image-loading-overlay" style="display: flex;">
                            <div class="loading-spinner"></div>
                            <div class="loading-text">Loading high-resolution image...</div>
                        </div>
                        <div class="image-quality-indicator">
                            <span class="quality-badge">Loading...</span>
                        </div>
                    </div>
                </div>
                <div class="engraving-info">
                    <h2 class="engraving-title">${engraving.title}</h2>
                    
                    <div class="metadata-grid">
                        <div class="metadata-item">
                            <strong>Artist:</strong>
                            <span>${DataLoader.getArtistName(engraving.creator)}</span>
                        </div>
                        <div class="metadata-item">
                            <strong>Publisher:</strong>
                            <span>${engraving.creator.publisher || 'Unknown'}</span>
                        </div>
                        <div class="metadata-item">
                            <strong>Published:</strong>
                            <span>${engraving.dates.published || engraving.dates.created || 'Unknown'}</span>
                        </div>
                        <div class="metadata-item">
                            <strong>Location:</strong>
                            <span>${engraving.location.neighborhood}</span>
                        </div>
                        <div class="metadata-item">
                            <strong>Viewpoint:</strong>
                            <span>${engraving.location.viewpoint.description}</span>
                        </div>
                    </div>
                    
                    <div class="description-section">
                        <h3>Description</h3>
                        <p>${engraving.description}</p>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="action-btn primary" onclick="ModalComponent.showFullImage('${encodeURIComponent(fullSrc)}', '${engraving.title}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
                            </svg>
                            View Full Size
                        </button>
                        <button class="action-btn secondary" onclick="ModalComponent.shareEngraving('${engraving.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                            Share
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Update URL
        window.history.pushState(null, '', `#engraving/${engraving.id}`);
        
        // Add to recently viewed
        if (typeof addToRecentlyViewed === 'function') {
            addToRecentlyViewed(engraving.id);
        }
        
        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Start progressive loading immediately
        this.startProgressiveLoading(engraving.id);
        
        // Add landmark overlay after full image loads
        setTimeout(async () => {
            const imageContainer = document.querySelector('.engraving-image-container');
            if (imageContainer) {
                await LandmarkOverlay.createOverlay(engraving, imageContainer);
            }
        }, 1000); // Increased delay to allow full image to load
        
        // Focus management
        modal.focus();
        
        // Track modal opening performance
        const endTime = performance.now();
        const modalOpenTime = endTime - startTime;
        if (window.SpeedInsights) {
            window.SpeedInsights.trackModalOpen('engraving_details', modalOpenTime);
        }
    },

    /**
     * Start progressive loading process with smart caching
     * @param {string} engravingId - Engraving ID
     */
    startProgressiveLoading(engravingId) {
        const img = document.querySelector('.progressive-image');
        const overlay = document.querySelector('.image-loading-overlay');
        const qualityIndicator = document.querySelector('.quality-badge');
        
        if (!img || !overlay) return;
        
        const fullSrc = img.dataset.fullSrc;
        
        // Check if image was already preloaded by hover
        const isPreloaded = MapComponent.preloadedImages?.has(engravingId);
        
        if (isPreloaded) {
            console.log('⚡ Using preloaded image for instant loading:', engravingId);
            
            // Image is already cached, load immediately
            img.src = fullSrc;
            overlay.style.display = 'none';
            
            if (qualityIndicator) {
                qualityIndicator.textContent = 'Full Quality';
                qualityIndicator.className = 'quality-badge full';
                
                // Hide quality indicator after 2 seconds
                setTimeout(() => {
                    qualityIndicator.style.opacity = '0';
                }, 2000);
            }
            
            this.adjustModalSize(img);
            return;
        }
        
        // Update quality indicator for progressive loading
        if (qualityIndicator) {
            qualityIndicator.textContent = 'Preview Quality';
            qualityIndicator.className = 'quality-badge preview';
        }
        
        console.log('🔄 Starting progressive load for:', engravingId);
        
        // Preload full resolution image
        const fullImg = new Image();
        
        fullImg.onload = () => {
            console.log('✅ Full resolution loaded, transitioning...');
            
            // Create smooth transition effect
            img.style.transition = 'opacity 0.5s ease-in-out';
            img.style.opacity = '0.7';
            
            setTimeout(() => {
                img.src = fullSrc;
                img.style.opacity = '1';
                
                // Hide loading overlay
                overlay.style.display = 'none';
                
                // Update quality indicator
                if (qualityIndicator) {
                    qualityIndicator.textContent = 'Full Quality';
                    qualityIndicator.className = 'quality-badge full';
                    
                    // Hide quality indicator after 3 seconds
                    setTimeout(() => {
                        qualityIndicator.style.opacity = '0';
                    }, 3000);
                }
                
                // Adjust modal size for full image
                this.adjustModalSize(img);
                
                // Mark as preloaded for future use
                if (!MapComponent.preloadedImages) {
                    MapComponent.preloadedImages = new Set();
                }
                MapComponent.preloadedImages.add(engravingId);
                
                console.log('🎉 Progressive loading complete');
            }, 100);
        };
        
        fullImg.onerror = () => {
            console.error('❌ Failed to load full resolution image');
            overlay.style.display = 'none';
            
            if (qualityIndicator) {
                qualityIndicator.textContent = 'Preview Only';
                qualityIndicator.className = 'quality-badge error';
            }
        };
        
        // Start loading full image
        fullImg.src = fullSrc;
    },

    /**
     * Adjust modal size based on image dimensions
     * @param {HTMLImageElement} img - The loaded image element
     */
    adjustModalSize(img) {
        const modal = document.querySelector('.modal-content');
        const container = img.closest('.engraving-details');
        
        if (!modal || !container) return;
        
        // Skip adjustment on mobile - let CSS handle it
        if (window.innerWidth <= 768) {
            return;
        }
        
        // Get image natural dimensions
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const isWide = aspectRatio > 1.5;
        const isTall = aspectRatio < 0.8;
        
        // Adjust modal layout based on image aspect ratio on desktop only
        if (isWide) {
            container.style.gridTemplateColumns = '1fr';
            container.style.maxWidth = '90vw';
            modal.style.maxWidth = '95vw';
        } else if (isTall) {
            container.style.gridTemplateColumns = '400px 1fr';
            container.style.maxWidth = '80vw';
            modal.style.maxWidth = '85vw';
        } else {
            container.style.gridTemplateColumns = '1fr 1fr';
            container.style.maxWidth = '85vw';
            modal.style.maxWidth = '90vw';
        }
    },

    /**
     * Load full resolution image
     * @param {string} engravingId - Engraving ID
     */
    loadFullResolution(engravingId) {
        const img = document.querySelector('.engraving-img');
        const overlay = document.querySelector('.image-loading-overlay');
        const fullSrc = DataLoader.getImageSrc(engravingId);
        
        if (!img || !overlay) return;
        
        // Show loading overlay
        overlay.style.display = 'flex';
        
        // Create new image to preload
        const fullImg = new Image();
        fullImg.onload = () => {
            img.src = fullSrc;
            overlay.style.display = 'none';
            this.adjustModalSize(img);
        };
        fullImg.onerror = () => {
            overlay.style.display = 'none';
            console.error('Failed to load full resolution image');
        };
        fullImg.src = fullSrc;
    },

    /**
     * Show full image in modal (called from thumbnail click)
     * @param {string} imageSrc - Image source URL
     * @param {string} title - Image title
     */
    showFullImage(imageSrc, title) {
        console.log('🖼️ Showing full image:', { imageSrc, title });
        
        const imageModal = document.getElementById('image-modal');
        const imageModalImg = document.getElementById('image-modal-img');
        const imageModalTitle = document.getElementById('image-modal-title');
        
        if (!imageModal || !imageModalImg) {
            console.warn('❌ Image modal elements not found');
            return;
        }

    // Set image with loading state
    console.log('🔄 Setting image properties...');
    imageModalImg.style.opacity = '0';
    imageModalImg.src = decodeURIComponent(imageSrc);
    imageModalImg.alt = title;
    
    if (imageModalTitle) {
        imageModalTitle.textContent = title;
    }
    
    console.log('📍 Displaying modal...');
    imageModal.style.display = 'flex';
    // Trigger reflow to ensure animation works
    imageModal.offsetHeight;
    imageModal.classList.add('visible');
        
        // Trigger haptic feedback
        this.triggerHapticFeedback('medium');
        
        // Reset zoom state
        this.resetZoom();
        
        // Animate image entrance
        imageModalImg.onload = () => {
            imageModalImg.style.transition = 'opacity 0.3s ease';
            imageModalImg.style.opacity = '1';
        };
        
        // Setup enhanced image interaction
        setTimeout(() => {
            this.setupImageInteraction();
        }, 100);
        
        // Announce to screen readers
        this.announceToScreenReader(`Viewing full size image: ${title}`);
    },

    /**
     * Close engraving details modal with smooth animation
     */
    close() {
        const modal = document.getElementById('engraving-modal');
        if (modal) {
            modal.classList.remove('fade-in');
            modal.classList.add('fade-out');
            
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('fade-out');
                
                // Restore viewport zoom settings after modal is closed
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=yes');
                }
            }, 300);
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Close any open Leaflet popups
        if (AppState.map) {
            AppState.map.closePopup();
        }
        
        // Trigger haptic feedback
        this.triggerHapticFeedback('light');
    },

    /**
     * Close full-screen image modal with smooth animation
     */
    closeImageModal() {
        const imageModal = document.getElementById('image-modal');
        if (imageModal) {
            imageModal.classList.remove('visible');
            
            setTimeout(() => {
                imageModal.style.display = 'none';
                // Clean up any inline styles
                imageModal.style.opacity = '';
            }, 300);
        }
        
        // Reset zoom when closing
        this.resetZoom();
        
        // Trigger haptic feedback
        this.triggerHapticFeedback('light');
    },

    /**
     * Enhanced zoom in with smooth animation
     */
    zoomIn() {
        AppState.currentZoom = Math.min(AppState.currentZoom * 1.5, 5);
        this.updateImageTransformSmooth();
        this.triggerHapticFeedback('light');
    },

    /**
     * Enhanced zoom out with smooth animation
     */
    zoomOut() {
        AppState.currentZoom = Math.max(AppState.currentZoom / 1.5, 1);
        if (AppState.currentZoom === 1) {
            AppState.translateX = 0;
            AppState.translateY = 0;
        }
        this.updateImageTransformSmooth();
        this.triggerHapticFeedback('light');
    },

    /**
     * Reset zoom with smooth animation
     */
    resetZoom() {
        AppState.currentZoom = 1;
        AppState.translateX = 0;
        AppState.translateY = 0;
        this.updateImageTransformSmooth();
    },

    /**
     * Update image transform with optimized performance
     */
    updateImageTransform() {
        const img = document.getElementById('image-modal-img');
        if (img) {
            // Use transform3d for hardware acceleration and better performance
            const transform = `translate3d(${AppState.translateX}px, ${AppState.translateY}px, 0) scale(${AppState.currentZoom})`;
            img.style.transform = transform;
            
            // Update cursor based on zoom level
            const container = document.getElementById('image-zoom-container');
            if (container) {
                container.style.cursor = AppState.currentZoom > 1 ? 'grab' : 'zoom-in';
            }
        }
    },

    /**
     * Update image transform with smooth transition (for zoom buttons)
     */
    updateImageTransformSmooth() {
        const img = document.getElementById('image-modal-img');
        if (img) {
            img.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            this.updateImageTransform();
            
            // Remove transition after animation for better drag performance
            setTimeout(() => {
                if (img) img.style.transition = 'none';
            }, 200);
        }
    },

    /**
     * Setup simple, intuitive image interaction
     */
    setupImageInteraction() {
        const container = document.getElementById('image-zoom-container');
        if (!container) return;

        // Remove existing listeners
        container.replaceWith(container.cloneNode(true));
        const newContainer = document.getElementById('image-zoom-container');

        // Mouse events for desktop
        newContainer.addEventListener('mousedown', (e) => this.startDrag(e));
        newContainer.addEventListener('mousemove', (e) => this.drag(e));
        newContainer.addEventListener('mouseup', () => this.endDrag());
        newContainer.addEventListener('mouseleave', () => this.endDrag());

        // Touch events for mobile
        newContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        newContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        newContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Wheel zoom for desktop
        newContainer.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

        // Double-tap zoom - simple approach
        let lastTapTime = 0;
        newContainer.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1 && !AppState.wasPinching) {
                const now = Date.now();
                const timeDiff = now - lastTapTime;
                
                if (timeDiff < 300) { // Double tap detected
                    e.preventDefault();
                    const touch = e.changedTouches[0];
                    const rect = newContainer.getBoundingClientRect();
                    const tapX = touch.clientX - rect.left;
                    const tapY = touch.clientY - rect.top;
                    this.handleDoubleTap(tapX, tapY, rect);
                }
                lastTapTime = now;
            }
        });
    },

    /**
     * Enhanced touch start with pinch detection
     * @param {Event} e - Touch event
     */
    handleTouchStart(e) {
        if (e.touches.length === 1 && AppState.currentZoom > 1) {
            const touch = e.touches[0];
            this.startDrag({ clientX: touch.clientX, clientY: touch.clientY });
        } else if (e.touches.length === 2) {
            // Pinch-to-zoom start
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            AppState.initialPinchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            AppState.initialZoom = AppState.currentZoom;
        }
    },

    /**
     * Simple touch move with smooth pinch-to-zoom
     * @param {Event} e - Touch event
     */
    handleTouchMove(e) {
        if (e.touches.length === 1 && AppState.isDragging && AppState.currentZoom > 1) {
            e.preventDefault();
            const touch = e.touches[0];
            this.drag({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
        } else if (e.touches.length === 2) {
            e.preventDefault();
            AppState.wasPinching = true;
            
            // Pinch-to-zoom - no limits, smooth scaling
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            if (AppState.initialPinchDistance > 0) {
                const scale = currentDistance / AppState.initialPinchDistance;
                AppState.currentZoom = Math.max(0.5, AppState.initialZoom * scale); // Allow zoom out below 1x
                this.updateImageTransform();
            }
        }
    },

    /**
     * Simple touch end
     */
    handleTouchEnd(e) {
        this.endDrag();
        
        // Reset pinch state after a short delay
        setTimeout(() => {
            AppState.wasPinching = false;
        }, 100);
        
        AppState.initialPinchDistance = 0;
        AppState.initialZoom = 1;
    },

    /**
     * Start drag operation with enhanced feedback
     * @param {Event} e - Mouse event
     */
    startDrag(e) {
        if (AppState.currentZoom > 1) {
            AppState.isDragging = true;
            AppState.startX = e.clientX - AppState.translateX;
            AppState.startY = e.clientY - AppState.translateY;
            
            const container = document.getElementById('image-zoom-container');
            if (container) {
                container.style.cursor = 'grabbing';
            }
        }
    },

    /**
     * Handle drag operation with smooth movement
     * @param {Event} e - Mouse event
     */
    drag(e) {
        if (AppState.isDragging && AppState.currentZoom > 1) {
            e.preventDefault();
            AppState.translateX = e.clientX - AppState.startX;
            AppState.translateY = e.clientY - AppState.startY;
            
            // Remove transition during drag for smooth movement
            const img = document.getElementById('image-modal-img');
            if (img) {
                img.style.transition = 'none';
            }
            
            this.updateImageTransform();
        }
    },

    /**
     * End drag operation with smooth restoration
     */
    endDrag() {
        AppState.isDragging = false;
        const container = document.getElementById('image-zoom-container');
        const img = document.getElementById('image-modal-img');
        
        if (container) {
            container.style.cursor = AppState.currentZoom > 1 ? 'grab' : 'zoom-in';
        }
        
        if (img) {
            img.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        }
    },

    /**
     * Handle wheel zoom with smooth animation
     * @param {Event} e - Wheel event
     */
    handleWheel(e) {
        e.preventDefault();
        
        // Get mouse position relative to container
        const container = document.getElementById('image-zoom-container');
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate zoom factor
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const newZoom = Math.max(1, Math.min(5, AppState.currentZoom * zoomFactor));
        
        if (newZoom !== AppState.currentZoom) {
            // Calculate new translation to zoom towards mouse position
            const zoomRatio = newZoom / AppState.currentZoom;
            
            // Adjust translation to keep the point under the mouse cursor fixed
            AppState.translateX = mouseX - (mouseX - AppState.translateX) * zoomRatio;
            AppState.translateY = mouseY - (mouseY - AppState.translateY) * zoomRatio;
            
            AppState.currentZoom = newZoom;
            
            // Reset translation if zooming out to 1x
            if (AppState.currentZoom === 1) {
                AppState.translateX = 0;
                AppState.translateY = 0;
            }
            
            this.updateImageTransformSmooth();
        }
    },

    /**
     * Handle double-click zoom
     * @param {number} clickX - X coordinate of click
     * @param {number} clickY - Y coordinate of click
     * @param {DOMRect} rect - Container bounding rect
     */
    handleDoubleClick(clickX, clickY, rect) {
        if (AppState.currentZoom === 1) {
            // Zoom in to 2.5x centered on click point
            AppState.currentZoom = 2.5;
            
            // Calculate translation to center on click point
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const offsetX = (centerX - clickX) * (AppState.currentZoom - 1);
            const offsetY = (centerY - clickY) * (AppState.currentZoom - 1);
            
            AppState.translateX = offsetX;
            AppState.translateY = offsetY;
            
            this.triggerHapticFeedback('medium');
        } else {
            // Zoom out to fit
            this.resetZoom();
            this.triggerHapticFeedback('light');
        }
        
        this.updateImageTransformSmooth();
    },

    /**
     * Handle Instagram-style single tap zoom
     * @param {number} tapX - X coordinate of tap
     * @param {number} tapY - Y coordinate of tap
     * @param {DOMRect} rect - Container bounding rect
     */
    handleSingleTap(tapX, tapY, rect) {
        if (AppState.currentZoom === 1) {
            // Zoom in to 2.5x centered on tap point
            AppState.currentZoom = 2.5;
            
            // Calculate translation to center on tap point
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const offsetX = (centerX - tapX) * (AppState.currentZoom - 1);
            const offsetY = (centerY - tapY) * (AppState.currentZoom - 1);
            
            AppState.translateX = offsetX;
            AppState.translateY = offsetY;
            
            this.triggerHapticFeedback('medium');
        } else {
            // Zoom out to fit
            this.resetZoom();
            this.triggerHapticFeedback('light');
        }
        
        this.updateImageTransform();
    },

    /**
     * Trigger haptic feedback
     */
    triggerHapticFeedback(intensity = 'light') {
        if ('vibrate' in navigator) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30]
            };
            
            if (patterns[intensity]) {
                navigator.vibrate(patterns[intensity]);
            }
        }
    },

    /**
     * Announce to screen readers for accessibility
     */
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    },

    /**
     * Share engraving functionality
     * @param {string} engravingId - Engraving ID to share
     */
    async shareEngraving(engravingId) {
        const engraving = AppState.engravingsData.find(e => e.id === engravingId);
        if (!engraving) {
            showToast('Engraving not found', 'error');
            return;
        }

        const shareUrl = generateShareUrl(engravingId);
        const shareText = `Check out this historical engraving: "${engraving.title}" from ${engraving.dates.created}`;

        // Try native Web Share API first (mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Cincinnati Steel Engraving: ${engraving.title}`,
                    text: shareText,
                    url: shareUrl
                });
                this.triggerHapticFeedback('success');
                return;
            } catch (error) {
                // User cancelled or error occurred, fall back to clipboard
                console.log('Native share cancelled or failed:', error);
            }
        }

        // Fallback to clipboard copy
        const success = await copyToClipboard(shareUrl);
        if (success) {
            showToast('Link copied to clipboard!', 'success');
            this.triggerHapticFeedback('success');
        } else {
            showToast('Failed to copy link', 'error');
            this.triggerHapticFeedback('error');
        }
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
