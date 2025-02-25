const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractTextFromPDF(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);

    const text = data.text;

    // Ekstrak Nama Partner (Lawan Transaksi)
    const partnerMatch = text.match(/Pembeli Barang Kena Pajak\s*\/\s*Penerima Jasa Kena Pajak:\s*Nama\s*:\s*(.+?)\s*Alamat/);
    let partnerName = partnerMatch ? partnerMatch[1] : "Nama Tidak Ditemukan";
    
    // Normalisasi nama partner (hapus spasi berlebih & karakter aneh)
    partnerName = partnerName.replace(/\s+/g, " ").trim(); // Hapus spasi ganda
    partnerName = partnerName.replace(/[^\w\s]/g, ""); // Hapus karakter non-alfanumerik (kecuali spasi)
    partnerName = partnerName.toUpperCase(); // Pastikan dalam format huruf besar

    // Ekstrak IDTKU Penjual (22 Digit)
    const idtkuMatch = text.match(/#?(\d{22})/);
    const idtku = idtkuMatch ? idtkuMatch[1] : "IDTKU_Tidak_Ditemukan";

    return { idtku, partnerName };
}

module.exports = { extractTextFromPDF };