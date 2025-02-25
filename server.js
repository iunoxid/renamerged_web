const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { processPDFs } = require('./utils/pdfProcessor');
const { scheduleDeletion, deleteOldUUIDs } = require('./utils/cleanup');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.static('public'));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

io.on("connection", (socket) => {
    console.log("✅ WebSocket Client Connected:", socket.id);
    socket.on("disconnect", () => console.log("❌ WebSocket Client Disconnected:", socket.id));
});

// Konfigurasi Multer (diinisialisasi hanya sekali)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uuid = require('crypto').randomUUID();
        const userFolder = `users/upload/${uuid}/`;
        fs.mkdirSync(userFolder, { recursive: true });
        req.uuid = uuid;
        cb(null, userFolder);
    },
    filename: (req, file, cb) => {
        cb(null, "file.zip");
    }
});

const upload = multer({ storage }).single('file');

app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: "Upload gagal!" });
        }

        const uuid = req.uuid;
        const outputDir = `users/download/${uuid}/`;

        io.emit("log", { message: "📂 Memulai pemrosesan file..." });

        const resultZipPath = await processPDFs(uuid, outputDir, io);

        io.emit("log", { message: "✅ Pemrosesan selesai!" });
        io.emit("progress", { percent: 100 });

        res.json({
            message: "File berhasil diproses",
            download_url: `/download/${uuid}/file.zip`
        });

        console.log(`✅ File diproses untuk UUID: ${uuid}`);
    });
});

app.get('/download/:uuid/file.zip', (req, res) => {
    const filePath = path.join(__dirname, 'users/download', req.params.uuid, 'file.zip');

    if (fs.existsSync(filePath)) {
        res.download(filePath, (err) => {
            if (!err) {
                console.log(`✅ File ${filePath} telah diunduh, akan dihapus dalam 1 menit.`);
                scheduleDeletion(req.params.uuid);
            }
        });
    } else {
        console.log(`❌ File tidak ditemukan: ${filePath}`);
        res.status(404).json({ error: "File tidak ditemukan" });
    }
});

setInterval(() => {
    console.log("🔄 Memeriksa dan menghapus folder UUID yang tidak aktif selama 1 jam...");
    deleteOldUUIDs('users/upload');
    deleteOldUUIDs('users/download');
}, 10 * 60 * 1000); // Jalankan setiap 10 menit

server.listen(5001, () => console.log("🚀 Server running on port 5001"));
