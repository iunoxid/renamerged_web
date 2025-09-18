/**
 * 📱 Sidebar Manager
 * Handles hamburger menu and sidebar functionality
 */

class SidebarManager {
    constructor() {
        this.hamburgerMenu = document.getElementById('hamburgerMenu');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.closeSidebar = document.getElementById('closeSidebar');

        this.init();
    }

    init() {
        this.bindEvents();
        console.log('📱 Sidebar Manager initialized');
    }

    bindEvents() {
        // Hamburger menu click
        if (this.hamburgerMenu) {
            this.hamburgerMenu.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Close button click
        if (this.closeSidebar) {
            this.closeSidebar.addEventListener('click', () => {
                this.closeSidebarMenu();
            });
        }

        // Overlay click
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.closeSidebarMenu();
            });
        }

        // ESC key to close sidebar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isSidebarOpen()) {
                this.closeSidebarMenu();
            }
        });

        // Prevent body scroll when sidebar is open
        this.sidebar?.addEventListener('wheel', (e) => {
            e.stopPropagation();
        });

        // Menu item navigation
        this.bindMenuNavigation();
    }

    bindMenuNavigation() {
        const menuItems = [
            { id: 'caraPakaiMenu', url: 'cara-pakai.html' },
            { id: 'termsMenu', url: 'terms.html' },
            { id: 'hubungiDevMenu', url: 'https://t.me/iunoin' },
            { id: 'donasiMenu', url: 'donasi.html' },
            { id: 'laporBugMenu', url: 'https://t.me/iunoin' },
            { id: 'aboutMenu', url: 'about.html' },
            { id: 'changelogMenu', url: 'changelog.html' }
        ];

        menuItems.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                element.addEventListener('click', () => {
                    this.navigateToPage(item.url);
                });
            }
        });
    }

    toggleSidebar() {
        if (this.isSidebarOpen()) {
            this.closeSidebarMenu();
        } else {
            this.openSidebarMenu();
        }
    }

    openSidebarMenu() {
        console.log('📱 Opening sidebar');

        // Add active classes
        this.hamburgerMenu?.classList.add('active');
        this.sidebar?.classList.add('active');
        this.sidebarOverlay?.classList.add('active');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus management
        setTimeout(() => {
            this.closeSidebar?.focus();
        }, 300);
    }

    closeSidebarMenu() {
        console.log('📱 Closing sidebar');

        // Remove active classes
        this.hamburgerMenu?.classList.remove('active');
        this.sidebar?.classList.remove('active');
        this.sidebarOverlay?.classList.remove('active');

        // Restore body scroll
        document.body.style.overflow = '';

        // Return focus to hamburger menu
        setTimeout(() => {
            this.hamburgerMenu?.focus();
        }, 300);
    }

    isSidebarOpen() {
        return this.sidebar?.classList.contains('active') || false;
    }

    // Public method to close sidebar (can be called from other components)
    close() {
        this.closeSidebarMenu();
    }

    // Public method to open sidebar
    open() {
        this.openSidebarMenu();
    }

    // Navigate to new page
    navigateToPage(page) {
        console.log(`📱 Navigating to ${page}`);
        window.open(page, '_blank');
        this.closeSidebarMenu();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarManager;
}