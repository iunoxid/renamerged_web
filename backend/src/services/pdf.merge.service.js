const fs = require('fs');
const path = require('path');
const { PDFExtractor } = require('../utils/pdf.extractor');
const { PDFMerger } = require('../utils/pdf.merger');
const { FileManager } = require('../utils/file.manager');

class PDFMergeService {
    static async processPDFs(uuid, outputBaseDir, emitToClient) {
        const zipPath = `uploads/upload/${uuid}/file.zip`;
        const extractPath = `uploads/upload/${uuid}/extracted/`;
        const outputDir = `uploads/download/${uuid}/`;

        try {
            // Ensure directories exist
            FileManager.ensureDirectory(extractPath);
            FileManager.ensureDirectory(outputDir);

            // Check file size and add delay for small files
            await this.handleFileSize(zipPath, emitToClient);

            // Extract ZIP
            FileManager.extractZip(zipPath, extractPath);

            // Get PDF files
            const pdfFiles = FileManager.getPDFFiles(extractPath);

            emitToClient("log", { message: "📂 Starting merge processing..." });
            emitToClient("log", { message: `📄 Found ${pdfFiles.length} PDF files` });

            console.log(`📂 Starting merge processing...`);
            console.log(`📄 Total files found: ${pdfFiles.length}`);

            if (pdfFiles.length === 0) {
                emitToClient("progress", { percent: 100 });
                return FileManager.createZipFromFolder(outputDir);
            }

            // Group PDFs by IDTKU and partner
            const groupedPdfs = await this.groupPDFsByMetadata(pdfFiles);

            // Process grouped PDFs (merge mode)
            await this.processGroupedPDFs(groupedPdfs, outputDir, pdfFiles.length, emitToClient);

            emitToClient("log", { message: "✅ Merge processing completed!" });
            return FileManager.createZipFromFolder(outputDir);

        } catch (error) {
            console.error('❌ PDF merge processing error:', error.message);
            emitToClient("log", { message: `❌ Error: ${error.message}` });
            throw error;
        }
    }

    static async handleFileSize(zipPath, emitToClient) {
        const fileSize = FileManager.getFileSize(zipPath);
        console.log(`📦 ZIP file size: ${fileSize.toFixed(2)} MB`);

        if (fileSize < 5) {
            emitToClient("log", { message: "⏳ Small file detected, waiting before processing..." });
            console.log("⏳ Small file, waiting 5 seconds before starting...");
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    static async groupPDFsByMetadata(pdfFiles) {
        const groupedPdfs = {};

        for (const pdfPath of pdfFiles) {
            try {
                // Use legacy method for merge (backward compatibility)
                const { idtku, partnerName } = await PDFExtractor.extractPDFMetadataLegacy(pdfPath);

                if (!groupedPdfs[idtku]) {
                    groupedPdfs[idtku] = {};
                }
                if (!groupedPdfs[idtku][partnerName]) {
                    groupedPdfs[idtku][partnerName] = [];
                }
                groupedPdfs[idtku][partnerName].push(pdfPath);
            } catch (error) {
                console.error(`❌ Error processing ${pdfPath}:`, error.message);
            }
        }

        return groupedPdfs;
    }

    static async processGroupedPDFs(groupedPdfs, outputDir, totalFiles, emitToClient) {
        // Calculate total operations for more accurate progress
        let totalOperations = 0;
        for (const idtku in groupedPdfs) {
            for (const partnerName in groupedPdfs[idtku]) {
                totalOperations++;
            }
        }

        let currentOperation = 0;

        for (const idtku in groupedPdfs) {
            const idtkuFolder = path.join(outputDir, idtku);
            FileManager.ensureDirectory(idtkuFolder);

            emitToClient("log", { message: `📁 Processing IDTKU: ${idtku}` });

            for (const partnerName in groupedPdfs[idtku]) {
                const pdfList = groupedPdfs[idtku][partnerName];

                emitToClient("log", { message: `📄 Processing: ${partnerName}` });

                // Emit progress before processing
                currentOperation++;
                const preProgress = Math.floor((currentOperation / totalOperations) * 90); // Reserve 90% for processing
                emitToClient("progress", { percent: preProgress });

                if (pdfList.length > 1) {
                    const mergedFilePath = path.join(idtkuFolder, `${partnerName}.pdf`);
                    await PDFMerger.mergePDFs(pdfList, mergedFilePath);
                    emitToClient("log", { message: `✅ Merged ${pdfList.length} files into ${partnerName}.pdf` });
                } else {
                    const newFilePath = path.join(idtkuFolder, `${partnerName}.pdf`);
                    fs.renameSync(pdfList[0], newFilePath);
                    emitToClient("log", { message: `✅ Renamed file to ${partnerName}.pdf` });
                }

                const finalProgress = Math.floor((currentOperation / totalOperations) * 95); // Final processing progress

                // Add natural delay for progress visualization
                await new Promise(resolve => setTimeout(resolve, 300));

                emitToClient("progress", { percent: finalProgress });
                console.log(`📊 Progress: ${finalProgress}% (${currentOperation}/${totalOperations})`);
            }
        }

        // Final steps
        emitToClient("log", { message: "📦 Creating final archive..." });
        emitToClient("progress", { percent: 98 });
    }
}

module.exports = { PDFMergeService };