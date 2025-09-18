// Environment-based configuration
const getApiUrl = () => {
    // Try to get from meta tag first (for production builds)
    const metaApiUrl = document.querySelector('meta[name="api-url"]');
    if (metaApiUrl) return metaApiUrl.content;

    // Fallback to window location based logic
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

    if (isProduction) {
        return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
    } else {
        return 'http://localhost:5001';
    }
};

const AppConfig = {
    apiUrl: getApiUrl(),
    socketUrl: getApiUrl(),
    socketOptions: {
        transports: ['websocket', 'polling'],
        cors: {
            origin: true,
            credentials: true
        }
    },
    ui: {
        progressUpdateDelay: 200,
        filePickerResetDelay: 500
    },
    upload: {
        acceptedTypes: '.zip,.rar,.7z',
        maxRetries: 3
    },
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
};

window.AppConfig = AppConfig;