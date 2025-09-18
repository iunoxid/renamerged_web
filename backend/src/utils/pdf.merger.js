const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

class PDFMerger {
    static async mergePDFs(pdfPaths, outputPath) {
        try {
            const mergedPdf = await PDFDocument.create();

            for (const pdfPath of pdfPaths) {
                const pdfBytes = fs.readFileSync(pdfPath);
                const pdfDoc = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            fs.writeFileSync(outputPath, mergedPdfBytes);

            console.log(`✅ PDF merged successfully: ${outputPath}`);
        } catch (error) {
            console.error(`❌ Error merging PDFs:`, error.message);
            throw new Error(`Failed to merge PDFs: ${error.message}`);
        }
    }
}

module.exports = { PDFMerger };