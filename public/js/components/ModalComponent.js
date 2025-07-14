/**
 * ModalComponent
 * Handles modal dialogs and image viewing functionality
 */
const ModalComponent = {
    /**
     * Initialize modal component
     */
    init() {
        this.setupModalEventListeners();
        console.log('🖼️ Modal component initialized');
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

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeImageModal();
                this.close();
            }
        });
    },

    /**
     * Show engraving details in modal
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
        
        // Show modal with loading state first
        modalBody.innerHTML = this.createLoadingState(engraving);
        modal.style.display = 'flex';
        
        // Load image and replace placeholder
        this.loadImageAsync(imageSrc, engraving, modalBody);
    },

    /**
     * Create loading state HTML
     * @param {Object} engraving - Engraving metadata object
     * @returns {string} Loading state HTML
     */
    createLoadingState(engraving) {
        const artist = DataLoader.getArtistName(engraving.creator);
        
        return `
            <div class="engraving-details">
                <div>
                    <div class="image-placeholder">
                        <div class="loading-spinner"></div>
                    </div>
                </div>
                <div>
                    ${this.createMetadataSection(engraving, artist)}
                </div>
            </div>
        `;
    },

    /**
     * Create metadata section HTML
     * @param {Object} engraving - Engraving metadata object
     * @param {string} artist - Artist name
     * @returns {string} Metadata HTML
     */
    createMetadataSection(engraving, artist) {
        return `
            <h2 style="font-family: var(--font-family-display); color: var(--color-primary); margin-bottom: 1.5rem;">
                ${this.escapeHtml(engraving.title)}
            </h2>
            <div class="metadata-grid">
                <div class="metadata-item">
                    <strong>Artist:</strong> ${this.escapeHtml(artist)}
                </div>
                <div class="metadata-item">
                    <strong>Publisher:</strong> ${this.escapeHtml(engraving.creator.publisher || 'Unknown')}
                </div>
                <div class="metadata-item">
                    <strong>Created:</strong> ${this.escapeHtml(engraving.dates.created)}
                </div>
                <div class="metadata-item">
                    <strong>Published:</strong> ${this.escapeHtml(engraving.dates.published || engraving.dates.created)}
                </div>
                <div class="metadata-item">
                    <strong>Location:</strong> ${this.escapeHtml(engraving.location.neighborhood)}
                </div>
                <div class="metadata-item">
                    <strong>Viewpoint:</strong> ${this.escapeHtml(engraving.location.viewpoint.description)}
                </div>
            </div>
            <div style="border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
                <h3 style="margin-bottom: 1rem;">Description</h3>
                <p style="line-height: 1.7;">${this.escapeHtml(engraving.description)}</p>
                <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--color-text-secondary); font-style: italic;">
                    💡 Click the image above to view it in full size
                </p>
            </div>
        `;
    },

    /**
     * Load image asynchronously and update modal
     * @param {string} imageSrc - Image source URL
     * @param {Object} engraving - Engraving metadata object
     * @param {HTMLElement} modalBody - Modal body element
     */
    loadImageAsync(imageSrc, engraving, modalBody) {
        const img = new Image();
        
        img.onload = () => {
            const imageContainer = modalBody.querySelector('.image-placeholder').parentElement;
            imageContainer.innerHTML = `
                <img src="${imageSrc}" 
                     alt="${this.escapeHtml(engraving.title)}" 
                     class="engraving-img" 
                     onclick="ModalComponent.showFullScreenImage('${imageSrc}', '${this.escapeHtml(engraving.title)}')"
                     title="Click to view full size" />
            `;
        };
        
        img.onerror = () => {
            const imageContainer = modalBody.querySelector('.image-placeholder').parentElement;
            imageContainer.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--color-text-secondary);">
                    <p>📷 Image not available</p>
                </div>
            `;
        };
        
        img.src = imageSrc;
    },

    /**
     * Show full-screen image modal
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

        imageModalImg.src = imageSrc;
        imageModalImg.alt = title;
        
        if (imageModalTitle) {
            imageModalTitle.textContent = title;
        }
        
        imageModal.style.display = 'flex';
        
        // Reset zoom state
        this.resetZoom();
        
        // Setup image interaction after modal is shown
        setTimeout(() => {
            this.setupImageInteraction();
        }, 100);
    },

    /**
     * Close engraving details modal
     */
    close() {
        const modal = document.getElementById('engraving-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    /**
     * Close full-screen image modal
     */
    closeImageModal() {
        const imageModal = document.getElementById('image-modal');
        if (imageModal) {
            imageModal.style.display = 'none';
        }
        // Reset zoom when closing
        this.resetZoom();
    },

    /**
     * Zoom in on image
     */
    zoomIn() {
        AppState.currentZoom = Math.min(AppState.currentZoom * 1.5, 5);
        this.updateImageTransform();
    },

    /**
     * Zoom out on image
     */
    zoomOut() {
        AppState.currentZoom = Math.max(AppState.currentZoom / 1.5, 1);
        if (AppState.currentZoom === 1) {
            AppState.translateX = 0;
            AppState.translateY = 0;
        }
        this.updateImageTransform();
    },

    /**
     * Reset zoom to default
     */
    resetZoom() {
        AppState.currentZoom = 1;
        AppState.translateX = 0;
        AppState.translateY = 0;
        this.updateImageTransform();
    },

    /**
     * Update image transform based on zoom and translation
     */
    updateImageTransform() {
        const img = document.getElementById('image-modal-img');
        if (img) {
            img.style.transform = `scale(${AppState.currentZoom}) translate(${AppState.translateX}px, ${AppState.translateY}px)`;
        }
    },

    /**
     * Setup image interaction (drag and zoom)
     */
    setupImageInteraction() {
        const container = document.getElementById('image-zoom-container');
        if (!container) return;

        // Remove existing listeners
        container.replaceWith(container.cloneNode(true));
        const newContainer = document.getElementById('image-zoom-container');

        // Mouse events
        newContainer.addEventListener('mousedown', (e) => this.startDrag(e));
        newContainer.addEventListener('mousemove', (e) => this.drag(e));
        newContainer.addEventListener('mouseup', () => this.endDrag());
        newContainer.addEventListener('mouseleave', () => this.endDrag());

        // Touch events
        newContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        newContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        newContainer.addEventListener('touchend', () => this.handleTouchEnd());

        // Wheel zoom
        newContainer.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    },

    /**
     * Start drag operation
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
     * Handle drag operation
     * @param {Event} e - Mouse event
     */
    drag(e) {
        if (AppState.isDragging && AppState.currentZoom > 1) {
            e.preventDefault();
            AppState.translateX = e.clientX - AppState.startX;
            AppState.translateY = e.clientY - AppState.startY;
            this.updateImageTransform();
        }
    },

    /**
     * End drag operation
     */
    endDrag() {
        AppState.isDragging = false;
        const container = document.getElementById('image-zoom-container');
        if (container) {
            container.style.cursor = AppState.currentZoom > 1 ? 'grab' : 'default';
        }
    },

    /**
     * Handle touch start
     * @param {Event} e - Touch event
     */
    handleTouchStart(e) {
        if (e.touches.length === 1 && AppState.currentZoom > 1) {
            const touch = e.touches[0];
            this.startDrag({ clientX: touch.clientX, clientY: touch.clientY });
        }
    },

    /**
     * Handle touch move
     * @param {Event} e - Touch event
     */
    handleTouchMove(e) {
        if (e.touches.length === 1 && AppState.isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            this.drag({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
        }
    },

    /**
     * Handle touch end
     */
    handleTouchEnd() {
        this.endDrag();
    },

    /**
     * Handle wheel zoom
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
