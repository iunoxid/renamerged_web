const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const { port, cors: corsConfig } = require('./config/server.config');
const { createUploadRoutes } = require('./routes/upload.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { CleanupManager } = require('./utils/cleanup.manager');

class App {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, { cors: corsConfig });

        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeWebSocket();
        this.initializeErrorHandling();
        this.initializeCleanup();
    }

    initializeMiddleware() {
        // Add request logging
        this.app.use((req, res, next) => {
            console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
            next();
        });

        this.app.use(cors());
        this.app.use(express.json({ limit: '200mb' }));
        this.app.use(express.urlencoded({ limit: '200mb', extended: true }));

        // Serve frontend files
        this.app.use(express.static(path.join(__dirname, '../../frontend/public')));
    }

    initializeRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        this.app.use('/api', createUploadRoutes(this.io));

        // Legacy routes for backward compatibility
        this.app.use('/', createUploadRoutes(this.io));

        // Serve frontend for any unmatched routes (only in non-production)
        if (process.env.NODE_ENV !== 'production') {
            this.app.use(express.static(path.join(__dirname, '../../frontend/public')));
            this.app.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
            });
        }
    }

    initializeWebSocket() {
        this.io.on("connection", (socket) => {
            console.log("✅ WebSocket Client Connected:", socket.id);
            socket.on("disconnect", () => {
                console.log("❌ WebSocket Client Disconnected:", socket.id);
            });
        });
    }

    initializeErrorHandling() {
        this.app.use(errorHandler);
    }

    initializeCleanup() {
        CleanupManager.startCleanupScheduler();
    }

    start() {
        this.server.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
            console.log(`📁 Upload path: uploads/upload`);
            console.log(`📥 Download path: uploads/download`);
        });
    }
}

module.exports = { App };