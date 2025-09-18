const fs = require('fs');
const path = require('path');
const { cleanup: cleanupConfig } = require('../config/server.config');

class CleanupManager {
    static deleteFolderRecursive(folderPath) {
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath).forEach((file) => {
                const curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    this.deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(folderPath);
            console.log(`🗑️ Folder deleted: ${folderPath}`);
        }
    }

    static scheduleDeletion(uuid) {
        const delayMs = cleanupConfig.deletionDelayMinutes * 60 * 1000;

        setTimeout(() => {
            const downloadPath = `uploads/download/${uuid}`;
            if (fs.existsSync(downloadPath)) {
                fs.rmSync(downloadPath, { recursive: true, force: true });
                console.log(`🗑️ Download folder ${downloadPath} deleted after ${cleanupConfig.deletionDelayMinutes} minute(s).`);
            }

            const uploadPath = `uploads/upload/${uuid}`;
            if (fs.existsSync(uploadPath)) {
                fs.rmSync(uploadPath, { recursive: true, force: true });
                console.log(`🗑️ Upload folder ${uploadPath} deleted after ${cleanupConfig.deletionDelayMinutes} minute(s).`);
            }
        }, delayMs);
    }

    static deleteOldUUIDs(basePath) {
        const now = Date.now();
        const maxAge = cleanupConfig.maxAgeHours * 60 * 60 * 1000;

        if (fs.existsSync(basePath)) {
            fs.readdirSync(basePath).forEach(folder => {
                const folderPath = path.join(basePath, folder);
                if (fs.statSync(folderPath).isDirectory()) {
                    const stats = fs.statSync(folderPath);
                    const lastModified = stats.mtimeMs;

                    if (now - lastModified > maxAge) {
                        fs.rmSync(folderPath, { recursive: true, force: true });
                        console.log(`🗑️ Folder ${folderPath} deleted due to inactivity for ${cleanupConfig.maxAgeHours} hour(s).`);
                    }
                }
            });
        }
    }

    static startCleanupScheduler() {
        const intervalMs = cleanupConfig.intervalMinutes * 60 * 1000;

        setInterval(() => {
            console.log(`🔄 Checking and deleting inactive UUID folders for ${cleanupConfig.maxAgeHours} hour(s)...`);
            this.deleteOldUUIDs('uploads/upload');
            this.deleteOldUUIDs('uploads/download');
        }, intervalMs);

        console.log(`🔄 Cleanup scheduler started (interval: ${cleanupConfig.intervalMinutes} minutes)`);
    }
}

module.exports = { CleanupManager };