require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5001,
    nodeEnv: process.env.NODE_ENV || 'development',
    cors: {
        origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : "*"),
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    },
    upload: {
        maxFileSize: `${process.env.MAX_FILE_SIZE || 200}mb`,
        uploadPath: process.env.UPLOAD_PATH || 'uploads/upload',
        downloadPath: process.env.DOWNLOAD_PATH || 'uploads/download'
    },
    cleanup: {
        intervalMinutes: parseInt(process.env.CLEANUP_INTERVAL_MINUTES) || 10,
        maxAgeHours: parseInt(process.env.MAX_AGE_HOURS) || 1,
        deletionDelayMinutes: parseInt(process.env.DELETION_DELAY_MINUTES) || 1
    }
};