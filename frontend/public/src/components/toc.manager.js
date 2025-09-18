/**
 * =Ë Terms & Conditions Manager
 * Handles first-time ToC modal display and acceptance tracking
 */

class TocManager {
    constructor() {
        this.tocModalOverlay = document.getElementById('tocModalOverlay');
        this.tocAcceptBtn = document.getElementById('tocAccept');
        this.tocDeclineBtn = document.getElementById('tocDecline');
        this.storageKey = 'renamerged_toc_accepted';
        this.storageVersion = '1.0'; // Change this to force re-acceptance

        this.init();
    }

    init() {
        console.log('=Ë ToC Manager initialized');
        this.bindEvents();
        this.checkTocAcceptance();
    }

    bindEvents() {
        // Accept Terms & Conditions
        if (this.tocAcceptBtn) {
            this.tocAcceptBtn.addEventListener('click', () => {
                this.acceptToc();
            });
        }

        // Decline Terms & Conditions
        if (this.tocDeclineBtn) {
            this.tocDeclineBtn.addEventListener('click', () => {
                this.declineToc();
            });
        }

        // Prevent closing modal by clicking overlay
        if (this.tocModalOverlay) {
            this.tocModalOverlay.addEventListener('click', (e) => {
                if (e.target === this.tocModalOverlay) {
                    // Don't close on overlay click - force user to make decision
                    this.shakeModal();
                }
            });
        }

        // Prevent ESC key from closing modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                e.preventDefault();
                this.shakeModal();
            }
        });
    }

    checkTocAcceptance() {
        const stored = localStorage.getItem(this.storageKey);

        if (!stored) {
            // First time visitor
            this.showModal();
            return;
        }

        try {
            const data = JSON.parse(stored);
            if (data.version !== this.storageVersion) {
                // Version changed, show modal again
                console.log('=Ë ToC version updated, showing modal again');
                this.showModal();
                return;
            }

            if (data.accepted && data.timestamp) {
                // Check if acceptance is still valid (optional: could add expiry)
                console.log('=Ë ToC previously accepted');
                this.hideModal();
            } else {
                this.showModal();
            }
        } catch (error) {
            console.error('=Ë Error parsing ToC data:', error);
            this.showModal();
        }
    }

    showModal() {
        console.log('=Ë Showing ToC modal');

        if (this.tocModalOverlay) {
            this.tocModalOverlay.classList.add('show');
            document.body.classList.add('toc-modal-open');

            // Disable all interactions
            this.disablePageInteractions();

            // Focus on accept button
            setTimeout(() => {
                if (this.tocAcceptBtn) {
                    this.tocAcceptBtn.focus();
                }
            }, 500);
        }
    }

    hideModal() {
        console.log('=Ë Hiding ToC modal');

        if (this.tocModalOverlay) {
            this.tocModalOverlay.classList.remove('show');
            document.body.classList.remove('toc-modal-open');

            // Re-enable page interactions
            this.enablePageInteractions();
        }
    }

    acceptToc() {
        console.log('=Ë User accepted ToC');

        // Store acceptance in localStorage
        const acceptanceData = {
            accepted: true,
            timestamp: new Date().toISOString(),
            version: this.storageVersion,
            userAgent: navigator.userAgent,
            ip: 'client-side' // Could be enhanced with actual IP if needed
        };

        localStorage.setItem(this.storageKey, JSON.stringify(acceptanceData));

        // Hide modal with animation
        this.hideModal();

        // Show success notification (optional)
        this.showNotification(' Terima kasih! Anda sekarang dapat menggunakan layanan Renamerged.', 'success');
    }

    declineToc() {
        console.log('=Ë User declined ToC');

        // Show decline message and redirect
        this.showNotification('L Anda harus menyetujui Terms & Conditions untuk menggunakan layanan ini.', 'error');

        // Optionally redirect user away or show alternative action
        setTimeout(() => {
            if (confirm('Anda akan diarahkan keluar dari halaman ini. Lanjutkan?')) {
                window.location.href = 'https://www.google.com';
            }
        }, 2000);
    }

    shakeModal() {
        // Add shake animation to indicate modal cannot be closed
        if (this.tocModalOverlay) {
            const modal = this.tocModalOverlay.querySelector('.toc-modal');
            if (modal) {
                modal.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    modal.style.animation = '';
                }, 500);
            }
        }
    }

    isModalOpen() {
        return this.tocModalOverlay?.classList.contains('show') || false;
    }

    disablePageInteractions() {
        // Disable all form elements
        const formElements = document.querySelectorAll('input, button, select, textarea');
        formElements.forEach(element => {
            if (!element.closest('.toc-modal')) {
                element.disabled = true;
                element.classList.add('toc-disabled');
            }
        });

        // Disable file upload
        const fileInput = document.getElementById('fileInput');
        const uploadButton = document.getElementById('uploadButton');
        const dropzone = document.getElementById('dropzone');

        if (fileInput) fileInput.disabled = true;
        if (uploadButton) uploadButton.disabled = true;
        if (dropzone) dropzone.style.pointerEvents = 'none';
    }

    enablePageInteractions() {
        // Re-enable all form elements
        const disabledElements = document.querySelectorAll('.toc-disabled');
        disabledElements.forEach(element => {
            element.disabled = false;
            element.classList.remove('toc-disabled');
        });

        // Re-enable file upload
        const fileInput = document.getElementById('fileInput');
        const uploadButton = document.getElementById('uploadButton');
        const dropzone = document.getElementById('dropzone');

        if (fileInput) fileInput.disabled = false;
        if (uploadButton) uploadButton.disabled = false;
        if (dropzone) dropzone.style.pointerEvents = '';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `toc-notification toc-notification-${type}`;
        notification.textContent = message;

        // Style notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: '10000',
            maxWidth: '400px',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Public method to force show modal (for testing or admin purposes)
    forceShowModal() {
        localStorage.removeItem(this.storageKey);
        this.showModal();
    }

    // Public method to check if user has accepted ToC
    hasAcceptedToc() {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) return false;

        try {
            const data = JSON.parse(stored);
            return data.accepted && data.version === this.storageVersion;
        } catch {
            return false;
        }
    }
}

// Add shake animation CSS if not already present
if (!document.querySelector('#shake-animation-style')) {
    const style = document.createElement('style');
    style.id = 'shake-animation-style';
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0) scale(1); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) scale(1.02); }
            20%, 40%, 60%, 80% { transform: translateX(5px) scale(1.02); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tocManager = new TocManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TocManager;
}