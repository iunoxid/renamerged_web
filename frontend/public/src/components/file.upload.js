class FileUpload {
    constructor(socketManager) {
        this.socketManager = socketManager;
        this.filePickerOpened = false;
        this.isUploading = false;

        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.dropzone = DOMUtils.getElementById('dropzone');
        this.fileInput = DOMUtils.getElementById('fileInput');
        this.uploadButton = DOMUtils.getElementById('uploadButton');

        if (!this.dropzone || !this.fileInput || !this.uploadButton) {
            console.error('Required upload elements not found');
            return;
        }

        this.setupDropzone();
        this.setupFileInput();
    }

    setupDropzone() {
        DOMUtils.clearElement(this.dropzone);
        const dropzoneText = DOMUtils.createElement('p', {}, '📁 Drag & Drop file ZIP di sini atau klik untuk memilih');
        dropzoneText.innerHTML = '📁 <b>Drag & Drop file ZIP di sini atau klik untuk memilih</b>';
        this.dropzone.appendChild(dropzoneText);
        this.dropzoneText = dropzoneText;
    }

    setupFileInput() {
        this.fileInput.setAttribute('accept', AppConfig.upload.acceptedTypes);
    }

    bindEvents() {
        if (!this.dropzone || !this.fileInput || !this.uploadButton) return;

        // Dropzone click
        this.dropzone.addEventListener('click', (event) => {
            event.preventDefault();
            this.handleDropzoneClick();
        });

        // File input change
        this.fileInput.addEventListener('change', (event) => {
            this.handleFileSelect(event.target.files);
        });

        // Drag events
        this.dropzone.addEventListener('dragover', (event) => {
            event.preventDefault();
            DOMUtils.addClass(this.dropzone, 'dragging');
        });

        this.dropzone.addEventListener('dragleave', () => {
            DOMUtils.removeClass(this.dropzone, 'dragging');
        });

        this.dropzone.addEventListener('drop', (event) => {
            event.preventDefault();
            DOMUtils.removeClass(this.dropzone, 'dragging');
            this.handleFileSelect(event.dataTransfer.files);
        });

        // Upload button
        this.uploadButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.handleUpload();
        });
    }

    handleDropzoneClick() {
        if (!this.filePickerOpened && !this.isUploading) {
            this.filePickerOpened = true;
            this.fileInput.click();
            setTimeout(() => {
                this.filePickerOpened = false;
            }, AppConfig.ui.filePickerResetDelay);
        }
    }

    handleFileSelect(files) {
        if (files.length > 0) {
            const fileName = files[0].name;
            this.dropzoneText.innerHTML = `📄 <b>${fileName}</b>`;
            DOMUtils.addClass(this.dropzone, 'file-selected');
            this.fileInput.files = files;
        }
    }

    async handleUpload() {
        if (this.uploadButton.disabled || this.isUploading) return;

        const file = this.fileInput.files[0];
        if (!file) {
            alert('Pilih file terlebih dahulu!');
            return;
        }

        this.setUploadingState(true);

        // Start fallback progress if available - but much later
        if (window.RenamergedApp && window.RenamergedApp.getProgressTracker()) {
            const progressTracker = window.RenamergedApp.getProgressTracker();
            setTimeout(() => {
                progressTracker.startFallbackProgress();
            }, 15000); // Start fallback after 15 seconds only if no real progress
        }

        try {
            await this.uploadFile(file);
        } catch (error) {
            console.error('❌ Upload failed:', error);
            this.showError('Upload gagal! Silakan coba lagi.');
        } finally {
            this.setUploadingState(false);
        }
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        // Get settings from SettingsManager
        const settingsManager = window.RenamergedApp?.getSettingsManager();
        if (settingsManager) {
            const settings = settingsManager.getSettings();
            formData.append('settings', JSON.stringify(settings));
            console.log('⚙️ Sending settings to backend:', settings);
        }

        // Reset UI
        this.resetProgress();

        // Ensure socket is connected and wait for connection
        if (!this.socketManager.isConnected) {
            console.log('🔌 Socket not connected, connecting...');
            this.socketManager.connect();

            // Wait for socket to connect (max 5 seconds)
            await this.waitForSocketConnection(5000);
        } else {
            console.log('✅ Socket already connected, proceeding with upload');
        }

        // Add socket ID to headers for backend to use
        const headers = {};
        if (this.socketManager.socket && this.socketManager.socket.id) {
            headers['X-Socket-ID'] = this.socketManager.socket.id;
            console.log('📡 Sending socket ID to backend:', this.socketManager.socket.id);
        } else {
            console.warn('⚠️ No socket ID available, progress may not work properly');
        }

        const response = await fetch(`${AppConfig.apiUrl}/upload`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.download_url) {
            this.showDownloadLink(result.download_url);
        }

        return result;
    }

    setUploadingState(isUploading) {
        this.isUploading = isUploading;
        this.uploadButton.disabled = isUploading;

        if (isUploading) {
            this.uploadButton.innerHTML = '⏳ Memproses...';
            DOMUtils.addClass(this.uploadButton, 'processing');
        } else {
            this.uploadButton.innerHTML = '🚀 Upload & Proses';
            DOMUtils.removeClass(this.uploadButton, 'processing');
        }
    }

    resetProgress() {
        const progressBar = DOMUtils.getElementById('progressBar');
        const logBox = DOMUtils.getElementById('logBox');
        const estimatedTime = DOMUtils.getElementById('estimatedTime');
        const downloadLink = DOMUtils.getElementById('downloadLink');

        if (progressBar) progressBar.style.width = '0%';
        if (logBox) DOMUtils.clearElement(logBox);
        if (estimatedTime) estimatedTime.innerText = 'Estimasi selesai: -';
        if (downloadLink) DOMUtils.hide(downloadLink);
    }

    showDownloadLink(url) {
        const downloadLink = DOMUtils.getElementById('downloadLink');
        if (downloadLink) {
            // Make sure download URL points to backend
            const fullUrl = url.startsWith('http') ? url : `${AppConfig.apiUrl}${url}`;
            downloadLink.href = fullUrl;
            DOMUtils.show(downloadLink);
        }
    }

    waitForSocketConnection(timeout = 5000) {
        return new Promise((resolve) => {
            const startTime = Date.now();

            const checkConnection = () => {
                if (this.socketManager.isConnected) {
                    console.log('✅ Socket connected successfully');
                    resolve(true);
                } else if (Date.now() - startTime > timeout) {
                    console.warn('⚠️ Socket connection timeout');
                    resolve(false);
                } else {
                    setTimeout(checkConnection, 100);
                }
            };

            checkConnection();
        });
    }

    showError(message) {
        const logBox = DOMUtils.getElementById('logBox');
        if (logBox) {
            const errorElement = DOMUtils.createElement('p', { style: 'color: red;' }, `❌ ${message}`);
            logBox.appendChild(errorElement);
        }
    }
}

window.FileUpload = FileUpload;