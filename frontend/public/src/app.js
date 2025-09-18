class App {
    constructor() {
        this.socketManager = null;
        this.fileUpload = null;
        this.progressTracker = null;
        this.settingsManager = null;
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
            console.log('🚀 Initializing application components...');

            // Initialize core components
            console.log('📡 Creating SocketManager...');
            this.socketManager = new SocketManager();

            console.log('📊 Creating ProgressTracker...');
            this.progressTracker = new ProgressTracker(this.socketManager);

            console.log('📁 Creating FileUpload...');
            this.fileUpload = new FileUpload(this.socketManager);

            console.log('⚙️ Creating SettingsManager...');
            this.settingsManager = new SettingsManager();

            console.log('🌙 Creating ThemeManager...');
            this.themeManager = new ThemeManager();

            // Connect socket
            console.log('🔌 Connecting socket to:', AppConfig.socketUrl);
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

    getSettingsManager() {
        return this.settingsManager;
    }

    getThemeManager() {
        return this.themeManager;
    }

}

// Initialize application when script loads
window.RenamergedApp = new App();