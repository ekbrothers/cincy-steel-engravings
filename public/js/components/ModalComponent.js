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
                if (e.target.id === 'image-modal') {
                    this.closeImageModal();
                }
            });
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
     * Show engraving details in modal with enhanced animations
     * @param {string} engravingId - Engraving ID
     */
    showEngravingDetails(engravingId) {
        const engraving = AppState.engravingsData.find(e => e.id === engravingId);
        if (!engraving) {
            console.warn(`Engraving not found: ${engravingId}`);
            return;
        }

        const modal = document.getElementById('engraving-modal');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalBody) {
            console.warn('Modal elements not found');
            return;
        }

        const imageSrc = DataLoader.getImageSrc(engraving.id);
        
        // Show modal with enhanced entrance animation
        modalBody.innerHTML = this.createLoadingState(engraving);
        modal.style.display = 'flex';
        modal.classList.add('fade-in');
        
        // Trigger haptic feedback
        this.triggerHapticFeedback('light');
        
        // Load image and replace placeholder
        this.loadImageAsync(imageSrc, engraving, modalBody);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Announce to screen readers
        this.announceToScreenReader(`Viewing details for ${engraving.title}`);
    },

    /**
     * Create enhanced loading state HTML
     * @param {Object} engraving - Engraving metadata object
     * @returns {string} Loading state HTML
     */
    createLoadingState(engraving) {
        const artist = DataLoader.getArtistName(engraving.creator);
        
        return `
            <div class="engraving-details">
                <div class="engraving-image">
                    <div class="image-placeholder">
                        <div class="loading-spinner"></div>
                    </div>
                </div>
                <div class="engraving-info">
                    ${this.createMetadataSection(engraving, artist)}
                </div>
            </div>
        `;
    },

    /**
     * Create enhanced metadata section HTML
     * @param {Object} engraving - Engraving metadata object
     * @param {string} artist - Artist name
     * @returns {string} Metadata HTML
     */
    createMetadataSection(engraving, artist) {
        return `
            <h2>${this.escapeHtml(toTitleCase(engraving.title))}</h2>
            <div class="metadata-grid">
                <div class="metadata-item">
                    <strong>Artist</strong>
                    <span>${this.escapeHtml(artist)}</span>
                </div>
                <div class="metadata-item">
                    <strong>Publisher</strong>
                    <span>${this.escapeHtml(engraving.creator.publisher || 'Unknown')}</span>
                </div>
                <div class="metadata-item">
                    <strong>Created</strong>
                    <span>${this.escapeHtml(engraving.dates.created)}</span>
                </div>
                <div class="metadata-item">
                    <strong>Published</strong>
                    <span>${this.escapeHtml(engraving.dates.published || engraving.dates.created)}</span>
                </div>
                <div class="metadata-item">
                    <strong>Location</strong>
                    <span>${this.escapeHtml(engraving.location.neighborhood)}</span>
                </div>
                <div class="metadata-item">
                    <strong>Viewpoint</strong>
                    <span>${this.escapeHtml(engraving.location.viewpoint.description)}</span>
                </div>
            </div>
            <div class="description">
                <h3>Description</h3>
                <p>${this.escapeHtml(engraving.description)}</p>
                <div class="interaction-hint">
                    <p>💡 Tap the image to view it in full size</p>
                </div>
                <div class="share-section">
                    <button class="share-btn" onclick="ModalComponent.shareEngraving('${engraving.id}')" title="Share this engraving">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="18" cy="5" r="3"/>
                            <circle cx="6" cy="12" r="3"/>
                            <circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        Share this engraving
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Load image asynchronously with enhanced animations
     * @param {string} imageSrc - Image source URL
     * @param {Object} engraving - Engraving metadata object
     * @param {HTMLElement} modalBody - Modal body element
     */
    loadImageAsync(imageSrc, engraving, modalBody) {
        const img = new Image();
        
        img.onload = () => {
            const imageContainer = modalBody.querySelector('.image-placeholder').parentElement;
            
            // Create image with smooth fade-in
            imageContainer.innerHTML = `
                <img src="${imageSrc}" 
                     alt="${this.escapeHtml(engraving.title)}" 
                     class="engraving-img" 
                     onclick="ModalComponent.showFullScreenImage('${imageSrc}', '${this.escapeHtml(engraving.title)}')"
                     title="Tap to view full size"
                     style="opacity: 0; transform: scale(0.95);" />
            `;
            
            // Animate image entrance
            const newImg = imageContainer.querySelector('.engraving-img');
            setTimeout(() => {
                newImg.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                newImg.style.opacity = '1';
                newImg.style.transform = 'scale(1)';
            }, 100);
        };
        
        img.onerror = () => {
            const imageContainer = modalBody.querySelector('.image-placeholder').parentElement;
            imageContainer.innerHTML = `
                <div class="image-error">
                    <div class="error-icon">📷</div>
                    <p>Image not available</p>
                </div>
            `;
        };
        
        img.src = imageSrc;
    },

    /**
     * Show full-screen image modal with enhanced mobile experience
     * @param {string} imageSrc - Image source URL
     * @param {string} title - Image title
     */
    showFullScreenImage(imageSrc, title) {
        const imageModal = document.getElementById('image-modal');
        const imageModalImg = document.getElementById('image-modal-img');
        const imageModalTitle = document.getElementById('image-modal-title');
        
        if (!imageModal || !imageModalImg) {
            console.warn('Image modal elements not found');
            return;
        }

        // Set image with loading state
        imageModalImg.style.opacity = '0';
        imageModalImg.src = imageSrc;
        imageModalImg.alt = title;
        
        if (imageModalTitle) {
            imageModalTitle.textContent = title;
        }
        
        imageModal.style.display = 'flex';
        
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
            imageModal.style.opacity = '0';
            
            setTimeout(() => {
                imageModal.style.display = 'none';
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
     * Setup enhanced image interaction with mobile gestures
     */
    setupImageInteraction() {
        const container = document.getElementById('image-zoom-container');
        if (!container) return;

        // Remove existing listeners
        container.replaceWith(container.cloneNode(true));
        const newContainer = document.getElementById('image-zoom-container');

        // Enhanced mouse events
        newContainer.addEventListener('mousedown', (e) => this.startDrag(e));
        newContainer.addEventListener('mousemove', (e) => this.drag(e));
        newContainer.addEventListener('mouseup', () => this.endDrag());
        newContainer.addEventListener('mouseleave', () => this.endDrag());

        // Enhanced touch events with pinch-to-zoom
        newContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        newContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        newContainer.addEventListener('touchend', () => this.handleTouchEnd());

        // Enhanced wheel zoom
        newContainer.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

        // Instagram-style single-tap zoom
        let tapTimeout = null;
        newContainer.addEventListener('touchend', (e) => {
            // Only handle single finger taps
            if (e.changedTouches.length !== 1) return;
            
            const touch = e.changedTouches[0];
            const rect = newContainer.getBoundingClientRect();
            const tapX = touch.clientX - rect.left;
            const tapY = touch.clientY - rect.top;
            
            // Clear any existing timeout
            if (tapTimeout) {
                clearTimeout(tapTimeout);
                tapTimeout = null;
            }
            
            // Set timeout to handle tap
            tapTimeout = setTimeout(() => {
                this.handleSingleTap(tapX, tapY, rect);
                tapTimeout = null;
            }, 100);
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
     * Enhanced touch move with pinch-to-zoom
     * @param {Event} e - Touch event
     */
    handleTouchMove(e) {
        if (e.touches.length === 1 && AppState.isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            this.drag({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
        } else if (e.touches.length === 2) {
            e.preventDefault();
            // Pinch-to-zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            if (AppState.initialPinchDistance > 0) {
                const scale = currentDistance / AppState.initialPinchDistance;
                AppState.currentZoom = Math.max(1, Math.min(5, AppState.initialZoom * scale));
                this.updateImageTransform();
            }
        }
    },

    /**
     * Enhanced touch end
     */
    handleTouchEnd() {
        this.endDrag();
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
        if (e.deltaY < 0) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
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
