class App {
    constructor() {
        this.socketManager = null;
        this.fileUpload = null;
        this.progressTracker = null;
        this.themeManager = null;

        this.initialize();
    }

    initialize() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize core components
            this.socketManager = new SocketManager();
            this.progressTracker = new ProgressTracker(this.socketManager);
            this.fileUpload = new FileUpload(this.socketManager);
            this.themeManager = new ThemeManager();

            // Connect socket
            this.socketManager.connect();

            console.log('✅ Application initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showInitializationError();
        }
    }

    showInitializationError() {
        const container = document.querySelector('.container');
        if (container) {
            const errorMessage = DOMUtils.createElement('div', {
                className: 'error-message',
                style: 'color: red; text-align: center; padding: 20px;'
            }, '❌ Gagal memuat aplikasi. Silakan refresh halaman.');

            container.insertBefore(errorMessage, container.firstChild);
        }
    }

    // Public methods for external access
    getSocketManager() {
        return this.socketManager;
    }

    getFileUpload() {
        return this.fileUpload;
    }

    getProgressTracker() {
        return this.progressTracker;
    }

    getThemeManager() {
        return this.themeManager;
    }
}

// Initialize application when script loads
window.RenamergedApp = new App();