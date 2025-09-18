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

        // Reset UI
        this.resetProgress();

        // Reconnect socket
        this.socketManager.reconnect();

        const response = await fetch('/upload', {
            method: 'POST',
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
            downloadLink.href = url;
            DOMUtils.show(downloadLink);
        }
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