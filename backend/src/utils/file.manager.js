const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

class FileManager {
    static createZipFromFolder(folderPath) {
        try {
            const zip = new AdmZip();
            zip.addLocalFolder(folderPath);

            const zipPath = path.join(folderPath, 'file.zip');
            zip.writeZip(zipPath);

            console.log(`✅ ZIP created: ${zipPath}`);
            return zipPath;
        } catch (error) {
            console.error(`❌ Error creating ZIP:`, error.message);
            throw new Error(`Failed to create ZIP: ${error.message}`);
        }
    }

    static extractZip(zipPath, extractPath) {
        try {
            fs.mkdirSync(extractPath, { recursive: true });

            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractPath, true);

            console.log(`✅ ZIP extracted to: ${extractPath}`);
        } catch (error) {
            console.error(`❌ Error extracting ZIP:`, error.message);
            throw new Error(`Failed to extract ZIP: ${error.message}`);
        }
    }

    static getPDFFiles(directory) {
        try {
            return fs.readdirSync(directory)
                .filter(file => file.endsWith('.pdf'))
                .map(file => path.join(directory, file));
        } catch (error) {
            console.error(`❌ Error reading directory ${directory}:`, error.message);
            return [];
        }
    }

    static getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size / (1024 * 1024); // Convert to MB
        } catch (error) {
            console.error(`❌ Error getting file size:`, error.message);
            return 0;
        }
    }

    static ensureDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
}

module.exports = { FileManager };