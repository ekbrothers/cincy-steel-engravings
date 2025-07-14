/**
 * SearchComponent
 * Handles search and filtering functionality
 */
const SearchComponent = {
    /**
     * Initialize search functionality
     */
    init() {
        this.setupSearchInput();
        console.log('🔍 Search component initialized');
    },

    /**
     * Setup search input event listener
     */
    setupSearchInput() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) {
            console.warn('Search input not found');
            return;
        }

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            this.performSearch(query);
        });
    },

    /**
     * Perform search and update filtered results
     * @param {string} query - Search query string
     */
    performSearch(query) {
        if (query) {
            AppState.filteredEngravings = AppState.engravingsData.filter(engraving => {
                return this.matchesQuery(engraving, query);
            });
        } else {
            AppState.filteredEngravings = [...AppState.engravingsData];
        }

        // Update UI components
        this.updateResults();
    },

    /**
     * Check if engraving matches search query
     * @param {Object} engraving - Engraving metadata object
     * @param {string} query - Search query string
     * @returns {boolean} True if matches
     */
    matchesQuery(engraving, query) {
        const searchFields = [
            engraving.title?.toLowerCase() || '',
            engraving.description?.toLowerCase() || '',
            DataLoader.getArtistName(engraving.creator).toLowerCase(),
            engraving.location?.neighborhood?.toLowerCase() || '',
            engraving.location?.subject?.toLowerCase() || '',
            engraving.dates?.created?.toLowerCase() || '',
            engraving.creator?.publisher?.toLowerCase() || ''
        ];

        return searchFields.some(field => field.includes(query));
    },

    /**
     * Update UI components with filtered results
     */
    updateResults() {
        // Update list component
        if (typeof ListComponent !== 'undefined' && ListComponent.render) {
            ListComponent.render();
        }

        // Update map markers
        if (typeof MapComponent !== 'undefined' && MapComponent.renderMarkers) {
            MapComponent.renderMarkers();
        }

        console.log(`🔍 Search results: ${AppState.filteredEngravings.length} engravings`);
    },

    /**
     * Clear search and reset results
     */
    clearSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
            this.performSearch('');
        }
    },

    /**
     * Get current search query
     * @returns {string} Current search query
     */
    getCurrentQuery() {
        const searchInput = document.getElementById('search-input');
        return searchInput ? searchInput.value.toLowerCase().trim() : '';
    }
};
