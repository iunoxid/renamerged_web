const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

function createZipFromFolder(outputDir) {
    const zipPath = `${outputDir}/file.zip`; // Simpan ZIP di users/download/<uuid>/file.zip
    const zip = new AdmZip();

    function addFiles(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                zip.addLocalFolder(fullPath, file); // Tambahkan folder IDTKU langsung
            }
        }
    }

    addFiles(outputDir); // Masukkan semua folder IDTKU ke dalam ZIP
    zip.writeZip(zipPath);
    return zipPath;
}

module.exports = { createZipFromFolder };
