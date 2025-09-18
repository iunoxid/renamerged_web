class SocketManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = new Map();
    }

    connect() {
        try {
            this.socket = io.connect(AppConfig.socketUrl, AppConfig.socketOptions);

            this.socket.on('connect', () => {
                this.isConnected = true;
                console.log('✅ Socket connected');
            });

            this.socket.on('disconnect', () => {
                this.isConnected = false;
                console.log('❌ Socket disconnected');
            });

            this.socket.on('error', (error) => {
                console.error('❌ Socket error:', error);
            });

        } catch (error) {
            console.error('❌ Failed to connect socket:', error);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
        }
    }

    reconnect() {
        this.disconnect();
        setTimeout(() => this.connect(), 500);
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, (data) => {
                console.log(`🔔 Socket event received: ${event}`, data);
                callback(data);
            });

            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
        }
    }

    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected, cannot emit event:', event);
        }
    }

    removeAllListeners(event) {
        if (this.socket) {
            this.socket.removeAllListeners(event);
            this.listeners.delete(event);
        }
    }
}

window.SocketManager = SocketManager;