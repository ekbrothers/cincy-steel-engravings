/**
 * ListComponent
 * Handles rendering of the sidebar engraving list
 */
const ListComponent = {
    /**
     * Initialize list component
     */
    init() {
        this.listContainer = document.getElementById('engravings-list');
        if (!this.listContainer) {
            console.warn('Engravings list container not found');
            return;
        }
        console.log('📋 List component initialized');
    },

    /**
     * Render the list of engravings
     */
    render() {
        if (!this.listContainer) {
            console.warn('List container not available');
            return;
        }

        this.listContainer.innerHTML = '';
        
        if (AppState.filteredEngravings.length === 0) {
            this.renderEmptyState();
            return;
        }

        AppState.filteredEngravings.forEach(engraving => {
            const card = this.createEngravingCard(engraving);
            this.listContainer.appendChild(card);
        });

        console.log(`📋 Rendered ${AppState.filteredEngravings.length} engraving cards`);
    },

    /**
     * Create an engraving card element
     * @param {Object} engraving - Engraving metadata object
     * @returns {HTMLElement} Card element
     */
    createEngravingCard(engraving) {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-engraving-id', engraving.id);

        const artist = DataLoader.getArtistName(engraving.creator);
        const year = engraving.dates.created;
        const neighborhood = engraving.location?.neighborhood || 'Unknown location';
        const description = this.truncateText(engraving.description, 100);

        card.innerHTML = `
            <div class="card-title">${this.escapeHtml(engraving.title)}</div>
            <div class="card-subtitle">${this.escapeHtml(year)} • ${this.escapeHtml(artist)}</div>
            <p><strong>Location:</strong> ${this.escapeHtml(neighborhood)}</p>
            <p>${this.escapeHtml(description)}</p>
        `;

        // Add click event listener
        card.addEventListener('click', () => {
            this.handleCardClick(engraving);
        });

        return card;
    },

    /**
     * Handle card click event
     * @param {Object} engraving - Engraving metadata object
     */
    handleCardClick(engraving) {
        // Show engraving details in modal
        if (typeof ModalComponent !== 'undefined' && ModalComponent.showEngravingDetails) {
            ModalComponent.showEngravingDetails(engraving.id);
        }

        // Focus map on engraving location
        if (typeof MapComponent !== 'undefined' && MapComponent.focusOnEngraving) {
            MapComponent.focusOnEngraving(engraving);
        }

        // Close mobile sidebar if open
        if (typeof NavigationComponent !== 'undefined' && NavigationComponent.closeMobileSidebar) {
            NavigationComponent.closeMobileSidebar();
        }
    },

    /**
     * Render empty state when no engravings match filters
     */
    renderEmptyState() {
        this.listContainer.innerHTML = `
            <div class="empty-state">
                <div style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3 style="margin-bottom: 0.5rem;">No engravings found</h3>
                    <p>Try adjusting your search terms</p>
                    <button onclick="SearchComponent.clearSearch()" 
                            style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--color-primary); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Clear Search
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) {
            return text || '';
        }
        return text.substring(0, maxLength).trim() + '...';
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
    },

    /**
     * Highlight search terms in text
     * @param {string} text - Text to highlight
     * @param {string} query - Search query
     * @returns {string} Text with highlighted terms
     */
    highlightSearchTerms(text, query) {
        if (!query || !text) return this.escapeHtml(text);
        
        const escapedText = this.escapeHtml(text);
        const escapedQuery = this.escapeHtml(query);
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        
        return escapedText.replace(regex, '<mark>$1</mark>');
    },

    /**
     * Get engraving card element by ID
     * @param {string} engravingId - Engraving ID
     * @returns {HTMLElement|null} Card element
     */
    getCardById(engravingId) {
        return this.listContainer?.querySelector(`[data-engraving-id="${engravingId}"]`);
    },

    /**
     * Scroll to specific engraving card
     * @param {string} engravingId - Engraving ID
     */
    scrollToCard(engravingId) {
        const card = this.getCardById(engravingId);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Briefly highlight the card
            card.style.transform = 'scale(1.02)';
            card.style.borderColor = 'var(--color-primary)';
            
            setTimeout(() => {
                card.style.transform = '';
                card.style.borderColor = '';
            }, 1000);
        }
    }
};
