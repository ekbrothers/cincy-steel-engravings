/**
 * NavigationComponent
 * Sophisticated mobile navigation with smooth animations and polished interactions
 */
const NavigationComponent = {
    /**
     * Initialize navigation component
     */
    init() {
        this.setupMobileNavigation();
        this.setupGestureHandling();
        this.setupHapticFeedback();
        this.setupSmoothTransitions();
        console.log('📱 Sophisticated navigation component initialized');
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

        // Bottom navigation buttons with enhanced interactions
        this.setupBottomNavigation();
    },

    /**
     * Setup sophisticated bottom navigation buttons
     */
    setupBottomNavigation() {
        const navButtons = document.querySelectorAll('.mobile-nav-btn');
        navButtons.forEach((button, index) => {
            // Enhanced touch interactions
            this.setupButtonInteractions(button);
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.triggerHapticFeedback('light');
                
                const actions = ['map', 'list', 'search', 'layers'];
                const action = actions[index];
                
                // Add ripple effect
                this.createRippleEffect(button, e);
                
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
     * Setup enhanced button interactions
     */
    setupButtonInteractions(button) {
        // Touch start - immediate visual feedback
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.style.transform = 'scale(0.95)';
            button.style.transition = 'transform 0.1s cubic-bezier(0.4, 0.0, 0.2, 1)';
        }, { passive: false });

        // Touch end - restore state
        button.addEventListener('touchend', () => {
            setTimeout(() => {
                button.style.transform = '';
                button.style.transition = 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
            }, 100);
        });

        // Touch cancel - restore state
        button.addEventListener('touchcancel', () => {
            button.style.transform = '';
            button.style.transition = 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        });
    },

    /**
     * Create ripple effect on button tap
     */
    createRippleEffect(button, event) {
        const ripple = document.createElement('div');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
            pointer-events: none;
            z-index: 1;
        `;

        // Add ripple keyframes if not already added
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    },

    /**
     * Setup gesture handling for swipe interactions
     */
    setupGestureHandling() {
        let startX = 0;
        let startY = 0;
        let isSwipeGesture = false;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipeGesture = false;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;

            // Check if it's a horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                isSwipeGesture = true;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!isSwipeGesture || !startX) return;

            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            // Swipe left to open sidebar
            if (diffX < -100 && !this.isMobileSidebarOpen()) {
                this.showList();
                this.triggerHapticFeedback('medium');
            }
            // Swipe right to close sidebar
            else if (diffX > 100 && this.isMobileSidebarOpen()) {
                this.showMap();
                this.triggerHapticFeedback('light');
            }

            startX = 0;
            startY = 0;
            isSwipeGesture = false;
        }, { passive: true });
    },

    /**
     * Setup haptic feedback simulation
     */
    setupHapticFeedback() {
        // Check if device supports haptic feedback
        this.hasHapticSupport = 'vibrate' in navigator;
    },

    /**
     * Trigger haptic feedback
     */
    triggerHapticFeedback(intensity = 'light') {
        if (!this.hasHapticSupport) return;

        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 50, 10],
            error: [50, 100, 50]
        };

        if (patterns[intensity]) {
            navigator.vibrate(patterns[intensity]);
        }
    },

    /**
     * Setup smooth transitions and animations
     */
    setupSmoothTransitions() {
        // Add CSS for smooth transitions if not already present
        if (!document.querySelector('#smooth-transitions')) {
            const style = document.createElement('style');
            style.id = 'smooth-transitions';
            style.textContent = `
                .app-sidebar {
                    will-change: transform;
                }
                
                .mobile-nav-btn {
                    will-change: transform, background-color;
                }
                
                .card {
                    will-change: transform, box-shadow;
                }
                
                /* Smooth scroll for iOS */
                .app-sidebar {
                    -webkit-overflow-scrolling: touch;
                    scroll-behavior: smooth;
                }
                
                /* Prevent overscroll bounce */
                body {
                    overscroll-behavior: none;
                }
            `;
            document.head.appendChild(style);
        }
    },

    /**
     * Show map view with smooth animation
     */
    showMap() {
        this.updateMobileNavActive('map');
        this.closeMobileSidebar();
        
        // Announce to screen readers
        this.announceToScreenReader('Map view');
    },

    /**
     * Show list view with smooth animation
     */
    showList() {
        this.updateMobileNavActive('list');
        this.openMobileSidebar();
        
        // Smooth scroll to top of list
        setTimeout(() => {
            const sidebar = document.querySelector('.app-sidebar');
            if (sidebar) {
                sidebar.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);
        
        this.announceToScreenReader('Engravings list');
    },

    /**
     * Show search view with enhanced focus management
     */
    showSearch() {
        this.updateMobileNavActive('search');
        this.openMobileSidebar();
        
        // Enhanced focus management
        setTimeout(() => {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                // Smooth scroll to search input
                searchInput.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Focus with slight delay for better UX
                setTimeout(() => {
                    searchInput.focus();
                    // Select all text for easy replacement
                    searchInput.select();
                }, 200);
            }
        }, 300);
        
        this.announceToScreenReader('Search engravings');
    },

    /**
     * Show layers view with smooth scrolling
     */
    showLayers() {
        this.updateMobileNavActive('layers');
        this.openMobileSidebar();
        
        // Enhanced scroll to layers section
        setTimeout(() => {
            const filterSection = document.querySelector('.filter-section');
            if (filterSection) {
                filterSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 300);
        
        this.announceToScreenReader('Map layers');
    },

    /**
     * Update active state with smooth animations
     */
    updateMobileNavActive(activeTab) {
        const navButtons = document.querySelectorAll('.mobile-nav-btn');
        const tabMap = { map: 0, list: 1, search: 2, layers: 3 };
        
        navButtons.forEach((btn, index) => {
            const isActive = index === tabMap[activeTab];
            
            // Smooth transition for active state
            if (isActive && !btn.classList.contains('active')) {
                btn.style.transform = 'translateY(-2px) scale(1.05)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 200);
            }
            
            btn.classList.toggle('active', isActive);
        });
    },

    /**
     * Open mobile sidebar with enhanced animation
     */
    openMobileSidebar() {
        const sidebar = document.querySelector('.app-sidebar');
        if (sidebar) {
            // Add opening class for enhanced animation
            sidebar.classList.add('opening');
            sidebar.classList.add('mobile-open');
            
            // Remove opening class after animation
            setTimeout(() => {
                sidebar.classList.remove('opening');
            }, 400);
            
            // Prevent body scroll when sidebar is open
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Close mobile sidebar with enhanced animation
     */
    closeMobileSidebar() {
        const sidebar = document.querySelector('.app-sidebar');
        if (sidebar) {
            sidebar.classList.add('closing');
            
            setTimeout(() => {
                sidebar.classList.remove('mobile-open', 'closing');
                // Restore body scroll
                document.body.style.overflow = '';
            }, 400);
        }
    },

    /**
     * Enhanced toggle mobile menu
     */
    toggleMobileMenu() {
        const sidebar = document.querySelector('.app-sidebar');
        const toggleButton = document.getElementById('mobile-menu-toggle');
        
        if (!sidebar || !toggleButton) return;
        
        const isOpen = sidebar.classList.contains('mobile-open');
        
        if (isOpen) {
            this.closeMobileSidebar();
            this.updateMobileNavActive('map');
            toggleButton.innerHTML = '☰';
            toggleButton.classList.remove('menu-open');
        } else {
            this.openMobileSidebar();
            this.updateMobileNavActive('list');
            toggleButton.innerHTML = '✕';
            toggleButton.classList.add('menu-open');
        }
        
        this.triggerHapticFeedback('light');
    },

    /**
     * Check if mobile sidebar is open
     */
    isMobileSidebarOpen() {
        const sidebar = document.querySelector('.app-sidebar');
        return sidebar ? sidebar.classList.contains('mobile-open') : false;
    },

    /**
     * Enhanced resize handling
     */
    handleResize() {
        // Close mobile sidebar on desktop with smooth transition
        if (window.innerWidth > 768 && this.isMobileSidebarOpen()) {
            this.closeMobileSidebar();
            this.updateMobileNavActive('map');
            document.body.style.overflow = '';
        }
    },

    /**
     * Setup enhanced responsive behavior
     */
    setupResponsiveBehavior() {
        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 100);
        });

        // Enhanced outside click handling
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
                    this.triggerHapticFeedback('light');
                }
            }
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 500);
        });
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
     * Get current active navigation tab
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
     * Setup enhanced keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when no input is focused
            if (document.activeElement.tagName === 'INPUT') return;
            
            switch (e.key) {
                case 'm':
                case 'M':
                    this.showMap();
                    this.triggerHapticFeedback('light');
                    break;
                case 'l':
                case 'L':
                    this.showList();
                    this.triggerHapticFeedback('light');
                    break;
                case 's':
                case 'S':
                    this.showSearch();
                    this.triggerHapticFeedback('light');
                    break;
                case 'f':
                case 'F':
                    this.showLayers();
                    this.triggerHapticFeedback('light');
                    break;
                case 'Escape':
                    if (this.isMobileSidebarOpen()) {
                        this.showMap();
                        this.triggerHapticFeedback('light');
                    }
                    break;
            }
        });
    },

    /**
     * Setup performance optimizations
     */
    setupPerformanceOptimizations() {
        // Use passive event listeners where possible
        const passiveEvents = ['touchstart', 'touchmove', 'scroll'];
        passiveEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {}, { passive: true });
        });

        // Optimize animations with will-change
        const animatedElements = document.querySelectorAll('.app-sidebar, .mobile-nav-btn, .card');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform';
        });
    }
};

// Initialize enhanced navigation when component loads
if (typeof window !== 'undefined') {
    NavigationComponent.setupResponsiveBehavior();
    NavigationComponent.setupKeyboardShortcuts();
    NavigationComponent.setupPerformanceOptimizations();
}
