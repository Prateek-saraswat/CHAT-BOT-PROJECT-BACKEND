const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from PDF file
 */
const extractPdfText = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Extract text from DOCX file
 */
const extractDocxText = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
};

/**
 * Main extraction function that handles different file types
 */
const extractText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    switch (ext) {
      case '.pdf':
        return await extractPdfText(filePath);
      
      case '.docx':
      case '.doc':
        return await extractDocxText(filePath);
      
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
};

/**
 * Clean and normalize extracted text
 */
const cleanText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .replace(/\s{2,}/g, ' ') // Remove multiple spaces
    .trim();
};

module.exports = {
  extractText,
  extractPdfText,
  extractDocxText,
  cleanText
};