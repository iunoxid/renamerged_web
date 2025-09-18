const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { upload: uploadConfig } = require('../config/server.config');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uuid = require('crypto').randomUUID();
        const userFolder = path.join(uploadConfig.uploadPath, uuid);

        fs.mkdirSync(userFolder, { recursive: true });
        req.uuid = uuid;
        cb(null, userFolder);
    },
    filename: (req, file, cb) => {
        cb(null, "file.zip");
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 200 * 1024 * 1024 // 200MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['application/zip', 'application/x-zip-compressed'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only ZIP files are allowed'), false);
        }
    }
}).single('file');

module.exports = { upload };