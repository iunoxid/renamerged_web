const fs = require('fs');
const pdfParse = require('pdf-parse');

class PDFExtractor {
    static async extractTextFromPDF(pdfPath) {
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdfParse(dataBuffer);
            return data.text;
        } catch (error) {
            console.error(`❌ Error reading PDF ${pdfPath}:`, error.message);
            throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
    }

    static extractPartnerName(text) {
        const partnerMatch = text.match(/Pembeli Barang Kena Pajak\s*\/\s*Penerima Jasa Kena Pajak:\s*Nama\s*:\s*(.+?)\s*Alamat/);
        let partnerName = partnerMatch ? partnerMatch[1] : "Nama Tidak Ditemukan";

        // Normalisasi nama partner
        partnerName = partnerName.replace(/\s+/g, " ").trim();
        partnerName = partnerName.replace(/[^\w\s]/g, "");
        partnerName = partnerName.toUpperCase();

        return partnerName;
    }

    static extractIDTKU(text) {
        const idtkuMatch = text.match(/#?(\d{22})/);
        return idtkuMatch ? idtkuMatch[1] : "IDTKU_Tidak_Ditemukan";
    }

    static extractInvoiceNumber(text) {
        const invoiceMatch = text.match(/Kode dan Nomor Seri Faktur Pajak:\s*(\d+)/);
        return invoiceMatch ? invoiceMatch[1] : "Invoice_Not_Found";
    }

    static extractDate(text) {
        // Look for date patterns in format DD Month YYYY
        const dateMatch = text.match(/(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/i);

        if (dateMatch) {
            const monthMap = {
                'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
                'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
                'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
            };

            const day = dateMatch[1].padStart(2, '0');
            const month = monthMap[dateMatch[2].toLowerCase()] || '01';
            const year = dateMatch[3];

            return `${day}-${month}-${year}`;
        }

        return "Date_Not_Found";
    }

    static extractReference(text) {
        // Look for reference in format (Referensi: XXXXXX)
        const refMatch = text.match(/\(Referensi:\s*([^)]+)\)/);
        if (refMatch) {
            return refMatch[1].trim();
        }

        // Alternative pattern
        const altRefMatch = text.match(/Referensi:\s*([A-Za-z0-9\/\-_]+)/);
        return altRefMatch ? altRefMatch[1].trim() : "Ref_Not_Found";
    }

    static async extractPDFMetadata(pdfPath) {
        const text = await this.extractTextFromPDF(pdfPath);
        return {
            idtku: this.extractIDTKU(text),
            partnerName: this.extractPartnerName(text),
            invoiceNumber: this.extractInvoiceNumber(text),
            date: this.extractDate(text),
            reference: this.extractReference(text)
        };
    }

    // Legacy method for backward compatibility (merge mode)
    static async extractPDFMetadataLegacy(pdfPath) {
        const text = await this.extractTextFromPDF(pdfPath);
        return {
            idtku: this.extractIDTKU(text),
            partnerName: this.extractPartnerName(text)
        };
    }
}

module.exports = { PDFExtractor };