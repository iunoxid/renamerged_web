const { PDFRenameService } = require('./pdf.rename.service');
const { PDFMergeService } = require('./pdf.merge.service');

class PDFService {
    static async processPDFs(uuid, outputBaseDir, emitToClient, settings = {}) {
        console.log('🔧 PDF Service processing with settings:', settings);

        try {
            // Route to appropriate service based on mode
            if (settings.mode === 'rename') {
                console.log('📝 Routing to PDFRenameService...');
                return await PDFRenameService.processPDFs(uuid, outputBaseDir, emitToClient, settings);
            } else {
                console.log('📋 Routing to PDFMergeService...');
                return await PDFMergeService.processPDFs(uuid, outputBaseDir, emitToClient);
            }

        } catch (error) {
            console.error('❌ PDF Service routing error:', error.message);
            emitToClient("log", { message: `❌ Service Error: ${error.message}` });
            throw error;
        }
    }

}

module.exports = { PDFService };