const fs = require('fs');
const path = require('path');
const { PDFExtractor } = require('../utils/pdf.extractor');
const { FileManager } = require('../utils/file.manager');

class PDFRenameService {
    static async processPDFs(uuid, outputBaseDir, emitToClient, settings = {}) {
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

            emitToClient("log", { message: "📂 Starting rename-only processing..." });
            emitToClient("log", { message: `📄 Found ${pdfFiles.length} PDF files` });

            console.log(`📂 Starting rename-only processing...`);
            console.log(`📄 Total files found: ${pdfFiles.length}`);

            if (pdfFiles.length === 0) {
                emitToClient("progress", { percent: 100 });
                return FileManager.createZipFromFolder(outputDir);
            }

            // Process each PDF with rename only
            await this.processRenameOnly(pdfFiles, outputDir, emitToClient, settings);

            emitToClient("log", { message: "✅ Rename processing completed!" });
            return FileManager.createZipFromFolder(outputDir);

        } catch (error) {
            console.error('❌ PDF rename processing error:', error.message);
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

    static async processRenameOnly(pdfFiles, outputDir, emitToClient, settings) {
        emitToClient("log", { message: "📝 Processing in rename-only mode..." });

        let processedFiles = 0;
        const totalFiles = pdfFiles.length;

        for (const pdfPath of pdfFiles) {
            try {
                emitToClient("log", { message: `📄 Processing: ${path.basename(pdfPath)}` });

                // Extract metadata from PDF
                const metadata = await PDFExtractor.extractPDFMetadata(pdfPath);
                const { idtku, partnerName, invoiceNumber, date, reference } = metadata;

                console.log(`📊 Extracted metadata:`, metadata);

                // Create IDTKU folder
                const idtkuFolder = path.join(outputDir, idtku);
                FileManager.ensureDirectory(idtkuFolder);

                // Generate custom filename based on settings
                const newFilename = this.generateCustomFilename(partnerName, date, reference, invoiceNumber, settings);
                const destinationPath = path.join(idtkuFolder, newFilename);

                // Copy file with new name (handle duplicates)
                const finalDestinationPath = this.getUniqueFilePath(destinationPath);
                fs.copyFileSync(pdfPath, finalDestinationPath);

                const finalFilename = path.basename(finalDestinationPath);
                emitToClient("log", { message: `✅ Renamed: ${path.basename(pdfPath)} → ${finalFilename}` });

                processedFiles++;
                const progress = Math.floor((processedFiles / totalFiles) * 95);
                emitToClient("progress", { percent: progress });

                console.log(`📊 Progress: ${progress}% (${processedFiles}/${totalFiles})`);

                // Add small delay for smooth progress
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
                console.error(`❌ Error processing ${pdfPath}:`, error.message);
                emitToClient("log", { message: `❌ Error processing ${path.basename(pdfPath)}: ${error.message}` });

                processedFiles++;
                const progress = Math.floor((processedFiles / totalFiles) * 95);
                emitToClient("progress", { percent: progress });
            }
        }

        emitToClient("log", { message: "📦 Creating final archive..." });
        emitToClient("progress", { percent: 98 });
    }

    static generateCustomFilename(partnerName, date, reference, invoiceNumber, settings) {
        const components = {
            partner: partnerName || 'Unknown_Partner',
            date: date || 'Unknown_Date',
            reference: (reference || 'Unknown_Ref').replace(/\//g, settings.slashReplacement || '_'),
            invoice: invoiceNumber || 'Unknown_Invoice'
        };

        // Build filename based on component order
        const orderedComponents = (settings.componentOrder || ['partner', 'date', 'reference', 'invoice'])
            .map(componentKey => components[componentKey]);

        const separator = settings.separator || ' - ';
        const filename = orderedComponents.join(separator) + '.pdf';

        // Clean filename for file system compatibility
        return filename.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, ' ').trim();
    }

    static getUniqueFilePath(originalPath) {
        if (!fs.existsSync(originalPath)) {
            return originalPath;
        }

        const dir = path.dirname(originalPath);
        const ext = path.extname(originalPath);
        const baseName = path.basename(originalPath, ext);

        let counter = 1;
        let newPath;

        do {
            newPath = path.join(dir, `${baseName}_${counter}${ext}`);
            counter++;
        } while (fs.existsSync(newPath));

        return newPath;
    }
}

module.exports = { PDFRenameService };