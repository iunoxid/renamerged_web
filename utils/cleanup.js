const fs = require('fs');
const path = require('path');

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file) => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
        console.log(`🗑️ Folder dihapus: ${folderPath}`);
    }
}

const scheduleDeletion = (uuid) => {
    setTimeout(() => {
        const downloadPath = `users/download/${uuid}`;
        if (fs.existsSync(downloadPath)) {
            fs.rmSync(downloadPath, { recursive: true, force: true });
            console.log(`🗑️ Folder ${downloadPath} dihapus setelah 1 menit.`);
        }

        const uploadPath = `users/upload/${uuid}`;
        if (fs.existsSync(uploadPath)) {
            fs.rmSync(uploadPath, { recursive: true, force: true });
            console.log(`🗑️ Folder ${uploadPath} dihapus setelah 1 menit.`);
        }
    }, 60000); // Hapus setelah 1 menit
};

function deleteOldUUIDs(basePath) {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 jam dalam milidetik

    if (fs.existsSync(basePath)) {
        fs.readdirSync(basePath).forEach(folder => {
            const folderPath = path.join(basePath, folder);
            if (fs.statSync(folderPath).isDirectory()) {
                const stats = fs.statSync(folderPath);
                const lastModified = stats.mtimeMs;

                // Jika folder lebih dari 1 jam tidak ada aktivitas, hapus
                if (now - lastModified > oneHour) {
                    fs.rmSync(folderPath, { recursive: true, force: true });
                    console.log(`🗑️ Folder ${folderPath} dihapus karena tidak ada aktivitas selama 1 jam.`);
                }
            }
        });
    }
}

module.exports = { scheduleDeletion, deleteOldUUIDs };