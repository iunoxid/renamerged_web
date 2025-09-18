const { PDFService } = require('../services/pdf.service');
const { CleanupManager } = require('../utils/cleanup.manager');

class UploadController {
    static async uploadFile(req, res, io) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: "No file uploaded",
                    code: 'NO_FILE'
                });
            }

            const uuid = req.uuid;
            const outputDir = `uploads/download/${uuid}/`;
            const socketId = req.headers['x-socket-id'];

            // Parse settings from form data
            let settings = {
                mode: 'merge', // default
                componentOrder: ['partner', 'date', 'reference', 'invoice'],
                separator: ' - ',
                slashReplacement: '_'
            };

            if (req.body.settings) {
                try {
                    const parsedSettings = JSON.parse(req.body.settings);
                    settings = { ...settings, ...parsedSettings };
                    console.log('⚙️ Received settings from frontend:', settings);
                } catch (error) {
                    console.warn('⚠️ Failed to parse settings, using defaults:', error.message);
                }
            }

            console.log('📡 Client socket ID from header:', socketId);
            console.log('📡 All request headers:', Object.keys(req.headers));
            console.log('📡 Available socket IDs:', Array.from(io.sockets.sockets.keys()));
            console.log('🔧 Processing mode:', settings.mode);

            // Create socket emitter that targets specific client or all clients
            const emitToClient = (event, data) => {
                let emitted = false;

                if (socketId) {
                    const targetSocket = io.sockets.sockets.get(socketId);
                    if (targetSocket) {
                        console.log(`📡 Emitting ${event} to specific socket: ${socketId}`);
                        targetSocket.emit(event, data);
                        emitted = true;
                    } else {
                        console.warn(`⚠️ Socket ${socketId} not found, checking connected sockets...`);
                        console.log('📡 Available sockets:', Array.from(io.sockets.sockets.keys()));
                    }
                }

                if (!emitted) {
                    console.log(`📡 Emitting ${event} to all sockets (fallback)`);
                    io.emit(event, data);
                }
            };

            emitToClient("log", { message: "📂 Starting file processing..." });
            emitToClient("log", { message: `🔧 Mode: ${settings.mode === 'merge' ? 'Rename + Merge' : 'Rename Only'}` });

            const resultZipPath = await PDFService.processPDFs(uuid, outputDir, emitToClient, settings);

            emitToClient("log", { message: "✅ Processing completed!" });
            emitToClient("progress", { percent: 100 });

            res.json({
                success: true,
                message: "File processed successfully",
                download_url: `/download/${uuid}/file.zip`,
                uuid: uuid
            });

            console.log(`✅ File processed for UUID: ${uuid}`);

        } catch (error) {
            console.error('❌ Upload controller error:', error.message);

            const socketId = req.headers['x-socket-id'];
            const emitToClient = (event, data) => {
                let emitted = false;

                if (socketId) {
                    const targetSocket = io.sockets.sockets.get(socketId);
                    if (targetSocket) {
                        targetSocket.emit(event, data);
                        emitted = true;
                    }
                }

                if (!emitted) {
                    io.emit(event, data);
                }
            };

            emitToClient("log", { message: `❌ Processing failed: ${error.message}` });

            res.status(500).json({
                error: "File processing failed",
                message: error.message,
                code: 'PROCESSING_ERROR'
            });
        }
    }

    static async downloadFile(req, res) {
        try {
            const { uuid } = req.params;
            const filePath = `uploads/download/${uuid}/file.zip`;

            if (!require('fs').existsSync(filePath)) {
                console.log(`❌ File not found: ${filePath}`);
                return res.status(404).json({
                    error: "File not found",
                    code: 'FILE_NOT_FOUND'
                });
            }

            res.download(filePath, 'processed_files.zip', (err) => {
                if (!err) {
                    console.log(`✅ File ${filePath} downloaded, will be deleted in 1 minute.`);
                    CleanupManager.scheduleDeletion(uuid);
                }
            });

        } catch (error) {
            console.error('❌ Download controller error:', error.message);
            res.status(500).json({
                error: "Download failed",
                message: error.message,
                code: 'DOWNLOAD_ERROR'
            });
        }
    }
}

module.exports = { UploadController };