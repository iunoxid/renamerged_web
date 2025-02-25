const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { PDFDocument } = require('pdf-lib');
const { extractTextFromPDF } = require('./pdfHelpers');
const { createZipFromFolder } = require('./fileUtils');

async function processPDFs(uuid, outputBaseDir, io) {
    const zipPath = `users/upload/${uuid}/file.zip`;
    const extractPath = `users/upload/${uuid}/extracted/`;
    const outputDir = `users/download/${uuid}/`;

    fs.mkdirSync(extractPath, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });

    // **Cek ukuran file ZIP**
    const fileSize = fs.statSync(zipPath).size / (1024 * 1024); // Konversi ke MB
    console.log(`📦 Ukuran file ZIP: ${fileSize.toFixed(2)} MB`);

    // **Tambahkan delay 5 detik jika file < 5MB**
    if (fileSize < 5) {
        io.emit("log", { message: "⏳ File kecil terdeteksi, menunggu sebelum proses..." });
        console.log("⏳ File kecil, menunggu 5 detik sebelum mulai...");
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    const pdfFiles = fs.readdirSync(extractPath)
        .filter(file => file.endsWith('.pdf'))
        .map(file => path.join(extractPath, file));

    // **Pastikan log total file dikirim sebelum proses berjalan**
    io.emit("log", { message: "📂 Memulai pemrosesan file..." });
    io.emit("log", { message: `📄 Ditemukan ${pdfFiles.length} file PDF` });

    console.log(`📂 Memulai pemrosesan file...`);
    console.log(`📄 Total file ditemukan: ${pdfFiles.length}`);

    let processedFiles = 0;
    let totalFiles = pdfFiles.length;

    if (totalFiles === 0) {
        io.emit("progress", { percent: 100 });
        return;
    }

    let groupedPdfs = {};
    for (const pdfPath of pdfFiles) {
        const { idtku, partnerName } = await extractTextFromPDF(pdfPath);

        if (!groupedPdfs[idtku]) {
            groupedPdfs[idtku] = {};
        }
        if (!groupedPdfs[idtku][partnerName]) {
            groupedPdfs[idtku][partnerName] = [];
        }
        groupedPdfs[idtku][partnerName].push(pdfPath);
    }

    for (const idtku in groupedPdfs) {
        const idtkuFolder = path.join(outputDir, idtku);
        fs.mkdirSync(idtkuFolder, { recursive: true });

        for (const partnerName in groupedPdfs[idtku]) {
            const pdfList = groupedPdfs[idtku][partnerName];

            if (pdfList.length > 1) {
                const mergedFilePath = path.join(idtkuFolder, `${partnerName}.pdf`);
                await mergePDFs(pdfList, mergedFilePath);
            } else {
                const newFilePath = path.join(idtkuFolder, `${partnerName}.pdf`);
                fs.renameSync(pdfList[0], newFilePath);
            }

            processedFiles++;
            let progress = Math.floor((processedFiles / totalFiles) * 100);
            
            // **Tambahkan delay agar progress terlihat lebih natural**
            await new Promise(resolve => setTimeout(resolve, 200));

            io.emit("progress", { percent: progress });
            console.log(`📊 Progress: ${progress}%`);
        }
    }

    if (!global.processingStartedForUUID) {
    global.processingStartedForUUID = {}; // Inisialisasi objek jika belum ada
    }
    
    // Cegah duplikasi dengan lebih ketat
    if (global.processingStartedForUUID[uuid]) {
        console.log(`⚠️ Pemrosesan untuk UUID ${uuid} sudah dimulai, tidak mengirim log lagi.`);
    } else {
        io.emit("log", { message: "📂 Memulai pemrosesan file..." });
        global.processingStartedForUUID[uuid] = true; // Tandai bahwa UUID ini sudah diproses
        console.log(`📂 Memulai pemrosesan file untuk UUID ${uuid}`);
    }


    // **Cegah duplikasi pesan "✅ Pemrosesan selesai!"**
    if (!global.processingCompleted) {
        io.emit("log", { message: "✅ Pemrosesan selesai!" });
        global.processingCompleted = true;
    }

    return createZipFromFolder(outputDir);
}

// Fungsi menggabungkan beberapa PDF
async function mergePDFs(pdfPaths, outputPath) {
    const mergedPdf = await PDFDocument.create();

    for (const pdfPath of pdfPaths) {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);
}

module.exports = { processPDFs };
