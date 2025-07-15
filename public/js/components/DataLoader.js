/**
 * DataLoader Component
 * Handles loading and caching of engraving metadata
 */
const DataLoader = {
    /**
     * Load all engraving data from JSON files
     * @returns {Promise<Array>} Array of engraving metadata objects
     */
    async loadAllEngravings() {
        console.log('🔄 Loading engraving data from JSON files...');
        
        const promises = Config.ENGRAVING_IDS.map(async (id) => {
            try {
                console.log(`📄 Fetching ${id}.json...`);
                const response = await fetch(`/metadata/${id}.json`);
                console.log(`📄 Response for ${id}:`, response.status, response.ok);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Loaded ${id}:`, data.title);
                    return data;
                } else {
                    console.error(`❌ Failed to load ${id}: ${response.status}`);
                    return null;
                }
            } catch (error) {
                console.error(`❌ Error loading ${id}:`, error);
                return null;
            }
        });

        const results = await Promise.all(promises);
        const validResults = results.filter(result => result !== null);
        
        console.log(`📊 Successfully loaded ${validResults.length} out of ${Config.ENGRAVING_IDS.length} engravings`);
        return validResults;
    },

    /**
     * Get artist name from creator object
     * @param {Object} creator - Creator object from metadata
     * @returns {string} Artist name
     */
    getArtistName(creator) {
        return creator?.artist || creator?.engraver || creator?.publisher || 'Unknown';
    },

    /**
     * Validate engraving data structure
     * @param {Object} engraving - Engraving metadata object
     * @returns {boolean} True if valid
     */
    validateEngraving(engraving) {
        const required = ['id', 'title', 'location', 'dates', 'creator'];
        return required.every(field => engraving.hasOwnProperty(field));
    },

    /**
     * Get thumbnail image source path for engraving (for faster loading)
     * @param {string} engravingId - Engraving ID
     * @returns {string} Thumbnail image source path
     */
    getThumbnailSrc(engravingId) {
        // Convert steel_engraving_0001 to steel_engraving__0001_thumb.jpg
        const imageFileName = engravingId.replace('steel_engraving_', 'steel_engraving__');
        return `/engravings/thumbs/${imageFileName}_thumb.jpg`;
    },

    /**
     * Get full-size image source path for engraving
     * @param {string} engravingId - Engraving ID
     * @returns {string} Full-size image source path
     */
    getImageSrc(engravingId) {
        // Convert steel_engraving_0001 to steel_engraving__0001.jpg
        const imageFileName = engravingId.replace('steel_engraving_', 'steel_engraving__');
        return `/engravings/${imageFileName}.jpg`;
    },

    /**
     * Load landmarks database
     * @returns {Promise<Object>} Landmarks database object
     */
    async loadLandmarks() {
        if (this.landmarksCache) {
            return this.landmarksCache;
        }

        try {
            console.log('🏛️ Loading landmarks database...');
            const response = await fetch('/data/landmarks.json');
            if (response.ok) {
                this.landmarksCache = await response.json();
                console.log(`✅ Loaded ${Object.keys(this.landmarksCache.landmarks).length} landmarks`);
                return this.landmarksCache;
            } else {
                console.error('❌ Failed to load landmarks database');
                return { landmarks: {} };
            }
        } catch (error) {
            console.error('❌ Error loading landmarks:', error);
            return { landmarks: {} };
        }
    },

    /**
     * Get landmark details by ID
     * @param {string} landmarkId - Landmark ID
     * @returns {Promise<Object>} Landmark details object
     */
    async getLandmark(landmarkId) {
        console.log('🏛️ DataLoader.getLandmark called with:', landmarkId);
        
        const landmarksData = await this.loadLandmarks();
        console.log('🏛️ Landmarks data loaded:', landmarksData);
        console.log('🏛️ Available landmark IDs:', Object.keys(landmarksData.landmarks));
        
        const landmark = landmarksData.landmarks[landmarkId];
        console.log('🏛️ Found landmark:', landmark);
        
        return landmark || null;
    }
};
