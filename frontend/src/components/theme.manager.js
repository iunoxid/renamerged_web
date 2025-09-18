class ThemeManager {
    constructor() {
        this.themeKey = 'theme';
        this.darkTheme = 'dark';
        this.lightTheme = 'light';

        this.initializeElements();
        this.loadSavedTheme();
        this.bindEvents();
    }

    initializeElements() {
        this.themeToggle = DOMUtils.getElementById('themeToggle');

        if (!this.themeToggle) {
            console.warn('Theme toggle element not found');
        }
    }

    bindEvents() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('change', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        const isDarkMode = document.body.classList.contains('dark-mode');

        if (isDarkMode) {
            this.setLightTheme();
        } else {
            this.setDarkTheme();
        }

        this.saveThemePreference();
    }

    setDarkTheme() {
        DOMUtils.addClass(document.body, 'dark-mode');
        if (this.themeToggle) {
            this.themeToggle.checked = true;
        }
    }

    setLightTheme() {
        DOMUtils.removeClass(document.body, 'dark-mode');
        if (this.themeToggle) {
            this.themeToggle.checked = false;
        }
    }

    saveThemePreference() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const theme = isDarkMode ? this.darkTheme : this.lightTheme;

        try {
            localStorage.setItem(this.themeKey, theme);
        } catch (error) {
            console.warn('Failed to save theme preference:', error);
        }
    }

    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem(this.themeKey);

            if (savedTheme === this.darkTheme) {
                this.setDarkTheme();
            } else {
                this.setLightTheme();
            }
        } catch (error) {
            console.warn('Failed to load theme preference:', error);
            this.setLightTheme(); // Default to light theme
        }
    }

    getCurrentTheme() {
        return document.body.classList.contains('dark-mode') ? this.darkTheme : this.lightTheme;
    }
}

window.ThemeManager = ThemeManager;