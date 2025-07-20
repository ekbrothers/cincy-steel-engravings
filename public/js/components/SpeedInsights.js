/**
 * Vercel Speed Insights Integration
 * Vanilla JavaScript implementation for performance tracking
 */
const SpeedInsights = {
    /**
     * Initialize Vercel Speed Insights
     */
    init() {
        // Only initialize in production or when deployed on Vercel
        if (this.shouldTrack()) {
            this.loadSpeedInsights();
            console.log('📊 Vercel Speed Insights initialized');
        }
    },

    /**
     * Check if we should track performance
     */
    shouldTrack() {
        // Track if:
        // 1. Not in development mode (localhost)
        // 2. Or if explicitly enabled via environment
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        // Always track in production, optionally in development
        return !isLocalhost || window.location.search.includes('insights=true');
    },

    /**
     * Load Speed Insights script dynamically
     */
    loadSpeedInsights() {
        try {
            // Import and initialize Speed Insights from installed package
            import('@vercel/speed-insights')
                .then(module => {
                    if (module.speedInsights) {
                        module.speedInsights.init();
                        console.log('✅ Speed Insights loaded successfully');
                    } else if (module.inject) {
                        // Alternative API for newer versions
                        module.inject();
                        console.log('✅ Speed Insights injected successfully');
                    }
                })
                .catch(error => {
                    console.warn('⚠️ Failed to load Speed Insights:', error);
                    // Fallback to CDN version
                    this.loadSpeedInsightsFallback();
                });
        } catch (error) {
            console.warn('⚠️ Speed Insights not available:', error);
            this.loadSpeedInsightsFallback();
        }
    },

    /**
     * Fallback to CDN version if local package fails
     */
    loadSpeedInsightsFallback() {
        try {
            import('https://unpkg.com/@vercel/speed-insights@1.2.0/dist/index.js')
                .then(module => {
                    if (module.speedInsights) {
                        module.speedInsights.init();
                        console.log('✅ Speed Insights loaded from CDN');
                    } else if (module.inject) {
                        module.inject();
                        console.log('✅ Speed Insights injected from CDN');
                    }
                })
                .catch(error => {
                    console.warn('⚠️ CDN fallback also failed:', error);
                });
        } catch (error) {
            console.warn('⚠️ CDN fallback not available:', error);
        }
    },

    /**
     * Track custom performance metrics
     */
    trackCustomMetric(name, value, unit = 'ms') {
        if (window.speedInsights) {
            try {
                window.speedInsights.track(name, value, unit);
                console.log(`📊 Tracked metric: ${name} = ${value}${unit}`);
            } catch (error) {
                console.warn('⚠️ Failed to track custom metric:', error);
            }
        }
    },

    /**
     * Track image loading performance
     */
    trackImageLoad(imageName, loadTime) {
        this.trackCustomMetric(`image_load_${imageName}`, loadTime, 'ms');
    },

    /**
     * Track modal opening performance
     */
    trackModalOpen(modalType, openTime) {
        this.trackCustomMetric(`modal_open_${modalType}`, openTime, 'ms');
    },

    /**
     * Track map rendering performance
     */
    trackMapRender(renderTime) {
        this.trackCustomMetric('map_render', renderTime, 'ms');
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SpeedInsights.init());
} else {
    SpeedInsights.init();
}

// Make available globally for custom tracking
window.SpeedInsights = SpeedInsights;