class ProgressTracker {
    constructor(socketManager) {
        this.socketManager = socketManager;
        this.startTime = null;

        this.initializeElements();
        this.bindSocketEvents();
    }

    initializeElements() {
        this.progressBar = DOMUtils.getElementById('progressBar');
        this.logBox = DOMUtils.getElementById('logBox');
        this.estimatedTime = DOMUtils.getElementById('estimatedTime');

        console.log('🔍 Progress Tracker Elements:', {
            progressBar: this.progressBar,
            logBox: this.logBox,
            estimatedTime: this.estimatedTime
        });
    }

    bindSocketEvents() {
        this.socketManager.on('progress', (data) => {
            this.updateProgress(data);
        });

        this.socketManager.on('log', (data) => {
            this.addLogMessage(data.message);
        });
    }

    updateProgress(data) {
        console.log('📊 Progress received:', data.percent + '%');

        // Start timer on first progress update
        if (data.percent > 0 && !this.startTime) {
            this.startTime = Date.now();
        }

        if (this.progressBar) {
            this.progressBar.style.width = data.percent + '%';
            console.log('✅ Progress bar updated to:', data.percent + '%');
        } else {
            console.error('❌ Progress bar element not found!');
        }

        this.updateEstimatedTime(data.percent);
    }

    updateEstimatedTime(percent) {
        if (!this.estimatedTime || !this.startTime) return;

        const elapsedTime = (Date.now() - this.startTime) / 1000;
        const estimatedTotalTime = percent > 0 ? (elapsedTime / percent) * 100 : 0;
        const remainingTime = Math.max(0, Math.round(estimatedTotalTime - elapsedTime));

        this.estimatedTime.innerText = `Estimasi selesai: ${isNaN(remainingTime) ? '-' : remainingTime + ' detik'}`;
    }

    addLogMessage(message) {
        if (!this.logBox) {
            console.error('❌ Log Box tidak ditemukan di halaman!');
            return;
        }

        // Prevent duplicate messages
        if (!this.logBox.innerHTML.includes(message)) {
            const logEntry = DOMUtils.createElement('p', {}, message);
            this.logBox.appendChild(logEntry);
            this.logBox.scrollTop = this.logBox.scrollHeight;
        }
    }

    reset() {
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
        }

        if (this.logBox) {
            DOMUtils.clearElement(this.logBox);
        }

        if (this.estimatedTime) {
            this.estimatedTime.innerText = 'Estimasi selesai: -';
        }

        this.startTime = null;
    }

    addError(message) {
        if (this.logBox) {
            const errorElement = DOMUtils.createElement('p', { style: 'color: red;' }, `❌ ${message}`);
            this.logBox.appendChild(errorElement);
            this.logBox.scrollTop = this.logBox.scrollHeight;
        }
    }

    addSuccess(message) {
        if (this.logBox) {
            const successElement = DOMUtils.createElement('p', { style: 'color: green;' }, `✅ ${message}`);
            this.logBox.appendChild(successElement);
            this.logBox.scrollTop = this.logBox.scrollHeight;
        }
    }
}

window.ProgressTracker = ProgressTracker;