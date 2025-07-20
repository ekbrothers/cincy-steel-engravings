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
     * Check if browser supports WebP format
     * @returns {boolean} True if WebP is supported
     */
    supportsWebP() {
        if (this._webpSupport !== undefined) {
            return this._webpSupport;
        }
        
        // Create a small WebP image to test support
        const webpData = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        const img = new Image();
        
        return new Promise((resolve) => {
            img.onload = img.onerror = () => {
                this._webpSupport = img.height === 2;
                resolve(this._webpSupport);
            };
            img.src = webpData;
        });
    },

    /**
     * Get thumbnail image source path for engraving with WebP support
     * @param {string} engravingId - Engraving ID
     * @returns {Promise<string>} Thumbnail image source path
     */
    async getThumbnailSrc(engravingId) {
        const imageFileName = engravingId.replace('steel_engraving_', 'steel_engraving__');
        const supportsWebP = await this.supportsWebP();
        
        if (supportsWebP) {
            return `/engravings/thumbs/${imageFileName}_thumb.webp`;
        } else {
            return `/engravings/thumbs/${imageFileName}_thumb.jpg`;
        }
    },

    /**
     * Get thumbnail image source path synchronously (fallback method)
     * @param {string} engravingId - Engraving ID
     * @returns {string} Thumbnail image source path
     */
    getThumbnailSrcSync(engravingId) {
        // Fallback to JPEG for immediate use
        const imageFileName = engravingId.replace('steel_engraving_', 'steel_engraving__');
        return `/engravings/thumbs/${imageFileName}_thumb.jpg`;
    },

    /**
     * Get full-size image source path for engraving with WebP support
     * @param {string} engravingId - Engraving ID
     * @returns {Promise<string>} Full-size image source path
     */
    async getImageSrc(engravingId) {
        const imageFileName = engravingId.replace('steel_engraving_', 'steel_engraving__');
        const supportsWebP = await this.supportsWebP();
        
        if (supportsWebP) {
            return `/engravings/${imageFileName}.webp`;
        } else {
            // Fallback to original format based on engraving number
            const engravingNumber = engravingId.replace('steel_engraving_', '');
            const numericValue = parseInt(engravingNumber, 10);
            
            if (numericValue >= 10) {
                return `/engravings/${engravingId}.png`;
            } else {
                return `/engravings/${imageFileName}.jpg`;
            }
        }
    },

    /**
     * Get full-size image source path synchronously (fallback method)
     * @param {string} engravingId - Engraving ID
     * @returns {string} Full-size image source path
     */
    getImageSrcSync(engravingId) {
        // Fallback to original format for immediate use
        const engravingNumber = engravingId.replace('steel_engraving_', '');
        const numericValue = parseInt(engravingNumber, 10);
        
        if (numericValue >= 10) {
            return `/engravings/${engravingId}.png`;
        } else {
            const imageFileName = engravingId.replace('steel_engraving_', 'steel_engraving__');
            return `/engravings/${imageFileName}.jpg`;
        }
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
        const landmarksData = await this.loadLandmarks();
        return landmarksData.landmarks[landmarkId] || null;
    }
};
