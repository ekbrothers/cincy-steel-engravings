/**
 * NavigationComponent
 * Handles mobile navigation and sidebar functionality
 */
const NavigationComponent = {
    /**
     * Initialize navigation component
     */
    init() {
        this.setupMobileNavigation();
        console.log('📱 Navigation component initialized');
    },

    /**
     * Setup mobile navigation event listeners
     */
    setupMobileNavigation() {
        // Mobile menu toggle button (legacy support)
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Bottom navigation buttons
        this.setupBottomNavigation();
    },

    /**
     * Setup bottom navigation buttons
     */
    setupBottomNavigation() {
        const navButtons = document.querySelectorAll('.mobile-nav-btn');
        navButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const actions = ['map', 'list', 'search', 'layers'];
                const action = actions[index];
                
                switch (action) {
                    case 'map':
                        this.showMap();
                        break;
                    case 'list':
                        this.showList();
                        break;
                    case 'search':
                        this.showSearch();
                        break;
                    case 'layers':
                        this.showLayers();
                        break;
                }
            });
        });
    },

    /**
     * Show map view (close sidebar)
     */
    showMap() {
        this.updateMobileNavActive('map');
        this.closeMobileSidebar();
    },

    /**
     * Show list view (open sidebar)
     */
    showList() {
        this.updateMobileNavActive('list');
        this.openMobileSidebar();
    },

    /**
     * Show search view (open sidebar and focus search)
     */
    showSearch() {
        this.updateMobileNavActive('search');
        this.openMobileSidebar();
        
        // Focus on search input after sidebar animation
        setTimeout(() => {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }, 300);
    },

    /**
     * Show layers view (open sidebar and scroll to layers)
     */
    showLayers() {
        this.updateMobileNavActive('layers');
        this.openMobileSidebar();
        
        // Scroll to layers section after sidebar animation
        setTimeout(() => {
            const filterSection = document.querySelector('.filter-section');
            if (filterSection) {
                filterSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 300);
    },

    /**
     * Update active state of mobile navigation buttons
     * @param {string} activeTab - Active tab name
     */
    updateMobileNavActive(activeTab) {
        const navButtons = document.querySelectorAll('.mobile-nav-btn');
        const tabMap = { map: 0, list: 1, search: 2, layers: 3 };
        
        navButtons.forEach((btn, index) => {
            btn.classList.remove('active');
            if (index === tabMap[activeTab]) {
                btn.classList.add('active');
            }
        });
    },

    /**
     * Open mobile sidebar
     */
    openMobileSidebar() {
        const sidebar = document.querySelector('.app-sidebar');
        if (sidebar) {
            sidebar.classList.add('mobile-open');
        }
    },

    /**
     * Close mobile sidebar
     */
    closeMobileSidebar() {
        const sidebar = document.querySelector('.app-sidebar');
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
        }
    },

    /**
     * Toggle mobile menu (legacy hamburger menu)
     */
    toggleMobileMenu() {
        const sidebar = document.querySelector('.app-sidebar');
        const toggleButton = document.getElementById('mobile-menu-toggle');
        
        if (!sidebar || !toggleButton) return;
        
        const isOpen = sidebar.classList.contains('mobile-open');
        
        if (isOpen) {
            this.closeMobileSidebar();
            toggleButton.innerHTML = '☰';
            toggleButton.classList.remove('menu-open');
        } else {
            this.openMobileSidebar();
            toggleButton.innerHTML = '✕';
            toggleButton.classList.add('menu-open');
        }
    },

    /**
     * Check if mobile sidebar is open
     * @returns {boolean} True if sidebar is open
     */
    isMobileSidebarOpen() {
        const sidebar = document.querySelector('.app-sidebar');
        return sidebar ? sidebar.classList.contains('mobile-open') : false;
    },

    /**
     * Handle window resize events
     */
    handleResize() {
        // Close mobile sidebar on desktop
        if (window.innerWidth > 768 && this.isMobileSidebarOpen()) {
            this.closeMobileSidebar();
            this.updateMobileNavActive('map');
        }
    },

    /**
     * Setup responsive behavior
     */
    setupResponsiveBehavior() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && this.isMobileSidebarOpen()) {
                const sidebar = document.querySelector('.app-sidebar');
                const bottomNav = document.querySelector('.mobile-bottom-nav');
                const toggleButton = document.getElementById('mobile-menu-toggle');
                
                // Check if click is outside sidebar and navigation elements
                if (sidebar && !sidebar.contains(e.target) && 
                    bottomNav && !bottomNav.contains(e.target) &&
                    toggleButton && !toggleButton.contains(e.target)) {
                    this.closeMobileSidebar();
                    this.updateMobileNavActive('map');
                }
            }
        });
    },

    /**
     * Get current active navigation tab
     * @returns {string} Active tab name
     */
    getCurrentActiveTab() {
        const activeButton = document.querySelector('.mobile-nav-btn.active');
        if (!activeButton) return 'map';
        
        const navButtons = Array.from(document.querySelectorAll('.mobile-nav-btn'));
        const index = navButtons.indexOf(activeButton);
        const tabs = ['map', 'list', 'search', 'layers'];
        
        return tabs[index] || 'map';
    },

    /**
     * Navigate to specific tab programmatically
     * @param {string} tabName - Tab name to navigate to
     */
    navigateToTab(tabName) {
        switch (tabName) {
            case 'map':
                this.showMap();
                break;
            case 'list':
                this.showList();
                break;
            case 'search':
                this.showSearch();
                break;
            case 'layers':
                this.showLayers();
                break;
            default:
                console.warn(`Unknown tab: ${tabName}`);
        }
    },

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when no input is focused
            if (document.activeElement.tagName === 'INPUT') return;
            
            switch (e.key) {
                case 'm':
                case 'M':
                    this.showMap();
                    break;
                case 'l':
                case 'L':
                    this.showList();
                    break;
                case 's':
                case 'S':
                    this.showSearch();
                    break;
                case 'f':
                case 'F':
                    this.showLayers();
                    break;
                case 'Escape':
                    if (this.isMobileSidebarOpen()) {
                        this.showMap();
                    }
                    break;
            }
        });
    }
};

// Initialize responsive behavior when component loads
if (typeof window !== 'undefined') {
    NavigationComponent.setupResponsiveBehavior();
    NavigationComponent.setupKeyboardShortcuts();
}
