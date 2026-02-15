const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF from provided text and returns the file path.
 */
const generatePDFFromText = async (text, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const pdfPath = path.join(uploadsDir, `${fileName}.pdf`);
      const stream = fs.createWriteStream(pdfPath);

      doc.pipe(stream);
      doc.fontSize(16).text('SOS Tunisie - AI Signalement Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(text);
      doc.end();

      stream.on('finish', () => resolve(pdfPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Merges multiple PDFs into one.
 */
const combinePDFs = async (pdfPaths) => {
  // Real implementation would use pdf-lib. 
  // For the initial version, we return the path of the "main" combined report.
  // We'll simulate a merge by returning the first one or a new consolidated path.
  return pdfPaths[0];
};

module.exports = { generatePDFFromText, combinePDFs };