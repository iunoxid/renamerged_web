// Environment-based configuration
const getEnvVar = (name, defaultValue) => {
    // Try to get from meta tag first (for production builds)
    const metaTag = document.querySelector(`meta[name="${name}"]`);
    if (metaTag) return metaTag.content;

    // Try to get from window global variable (set by build process)
    if (window.ENV && window.ENV[name]) return window.ENV[name];

    return defaultValue;
};

const getApiUrl = () => {
    // Get API URL from environment
    const apiUrl = getEnvVar('api-url', null);
    if (apiUrl) return apiUrl;

    // Get API port from environment
    const apiPort = getEnvVar('api-port', '5002');
    const apiHost = getEnvVar('api-host', 'localhost');

    // Fallback to window location based logic
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

    if (isProduction) {
        // In production, use same host as frontend unless specified
        const prodApiUrl = getEnvVar('prod-api-url', null);
        if (prodApiUrl) return prodApiUrl;

        return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
    } else {
        // In development, use configurable host and port
        return `http://${apiHost}:${apiPort}`;
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