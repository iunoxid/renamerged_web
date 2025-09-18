const express = require('express');
const { upload } = require('../middleware/upload.middleware');
const { UploadController } = require('../controllers/upload.controller');

const router = express.Router();

const createUploadRoutes = (io) => {
    router.post('/upload', (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(500).json({
                    error: "Upload failed",
                    message: err.message,
                    code: 'UPLOAD_ERROR'
                });
            }

            await UploadController.uploadFile(req, res, io);
        });
    });

    router.get('/download/:uuid/file.zip', UploadController.downloadFile);

    return router;
};

module.exports = { createUploadRoutes };