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
        console.log('🔗 Binding socket events for progress tracking...');

        // Wait for socket connection before binding
        const bindEvents = () => {
            if (this.socketManager.isConnected) {
                console.log('✅ Socket connected, binding progress events...');

                this.socketManager.on('progress', (data) => {
                    console.log('📊 Progress event handler called with:', data);
                    this.updateProgress(data);
                });

                this.socketManager.on('log', (data) => {
                    console.log('📝 Log event handler called with:', data);
                    this.addLogMessage(data.message);
                });
            } else {
                console.log('⏳ Waiting for socket connection...');
                setTimeout(bindEvents, 100);
            }
        };

        bindEvents();

        // Add fallback progress simulation if no socket events received
        this.lastProgressTime = Date.now();
        this.fallbackProgressTimer = null;
    }

    updateProgress(data) {
        console.log('📊 Progress received:', data.percent + '%');

        // Update last progress time and clear fallback timer
        this.lastProgressTime = Date.now();
        if (this.fallbackProgressTimer) {
            clearInterval(this.fallbackProgressTimer);
            this.fallbackProgressTimer = null;
            console.log('🔄 Fallback progress stopped, real progress received');
        }

        // Start timer on first progress update
        if (data.percent > 0 && !this.startTime) {
            this.startTime = Date.now();
        }

        if (this.progressBar) {
            this.progressBar.style.width = data.percent + '%';
            console.log('✅ Progress bar updated to:', data.percent + '%');
        } else {
            console.error('❌ Progress bar element not found! Trying fallback...');
            // Fallback: try to find element again
            this.progressBar = document.getElementById('progressBar');
            if (this.progressBar) {
                this.progressBar.style.width = data.percent + '%';
                console.log('✅ Fallback progress bar updated to:', data.percent + '%');
            }
        }

        // Update estimated time
        this.updateEstimatedTime(data.percent);

        // Check if completed (100%)
        if (data.percent >= 100) {
            this.setCompletedStatus();
        }
    }

    updateEstimatedTime(percent) {
        if (!this.estimatedTime || !this.startTime || percent <= 0) {
            if (this.estimatedTime) {
                this.estimatedTime.innerText = 'Estimasi selesai: Memproses...';
            }
            return;
        }

        const elapsedTime = (Date.now() - this.startTime) / 1000;

        // Only show estimation if we have meaningful progress (>10%)
        if (percent < 10) {
            this.estimatedTime.innerText = 'Estimasi selesai: Memproses...';
            return;
        }

        const estimatedTotalTime = (elapsedTime / percent) * 100;
        const remainingTime = Math.max(0, Math.round(estimatedTotalTime - elapsedTime));

        if (remainingTime > 0 && remainingTime < 3600) { // Max 1 hour
            this.estimatedTime.innerText = `Estimasi selesai: ${remainingTime} detik`;
        } else {
            this.estimatedTime.innerText = 'Estimasi selesai: Hampir selesai...';
        }
    }

    addLogMessage(message) {
        if (!this.logBox) {
            console.error('❌ Log Box tidak ditemukan di halaman!');
            return;
        }

        // Add active class when logs are coming in
        DOMUtils.addClass(this.logBox, 'active');

        // Prevent duplicate messages
        if (!this.logBox.innerHTML.includes(message)) {
            const logEntry = DOMUtils.createElement('p', {}, message);
            this.logBox.appendChild(logEntry);
            this.logBox.scrollTop = this.logBox.scrollHeight;
        }

        // Remove active class after 2 seconds
        setTimeout(() => {
            DOMUtils.removeClass(this.logBox, 'active');
        }, 2000);
    }

    startFallbackProgress() {
        console.log('🔄 Starting fallback progress simulation...');

        let fallbackProgress = 0;
        this.fallbackProgressTimer = setInterval(() => {
            // Check if we've received real progress recently
            const timeSinceLastProgress = Date.now() - this.lastProgressTime;

            // Only use fallback if no real progress for 10 seconds AND we haven't received any real progress
            if (timeSinceLastProgress > 10000 && fallbackProgress < 80) {
                fallbackProgress += 3; // Slower increment
                if (fallbackProgress <= 80) { // Don't go too high with fallback
                    this.updateProgress({ percent: fallbackProgress });
                    console.log('🔄 Fallback progress:', fallbackProgress + '%');
                }
            }
        }, 2000); // Slower interval
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
            this.estimatedTime.style.color = '#666'; // Reset color
            this.estimatedTime.style.fontWeight = 'normal'; // Reset font weight
        }

        // Clear fallback timer
        if (this.fallbackProgressTimer) {
            clearInterval(this.fallbackProgressTimer);
            this.fallbackProgressTimer = null;
        }

        this.startTime = null;
        this.lastProgressTime = Date.now();
    }

    addError(message) {
        if (this.logBox) {
            const errorElement = DOMUtils.createElement('p', { style: 'color: red;' }, `❌ ${message}`);
            this.logBox.appendChild(errorElement);
            this.logBox.scrollTop = this.logBox.scrollHeight;
        }
    }

    setCompletedStatus() {
        if (this.estimatedTime) {
            this.estimatedTime.innerText = 'Status: Processing completed! ✅';
            this.estimatedTime.style.color = '#28a745';
            this.estimatedTime.style.fontWeight = 'bold';
            console.log('✅ Status set to completed');
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