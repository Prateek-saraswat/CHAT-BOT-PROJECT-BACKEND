const fs = require('fs').promises;
const path = require('path');
const { query } = require('../config/database');
const { extractText, cleanText } = require('../utils/textExtractor');

/**
 * Upload a new document
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { filename, originalname, path: filePath, mimetype } = req.file;
    
    // Extract text from the document
    console.log('Extracting text from:', filename);
    let extractedText = '';
    
    try {
      const rawText = await extractText(filePath);
      // console.log(rawText)
      extractedText = cleanText(rawText);
      // console.log(extractText)
    } catch (extractError) {
      console.error('Text extraction failed:', extractError);
      // Continue anyway, but with empty content
    }

    // Determine file type
    const fileType = path.extname(originalname).toLowerCase().replace('.', '');

    // Save to database
    const sql = `
      INSERT INTO documents (filename, original_name, file_path, file_type, content)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      filename,
      originalname,
      filePath,
      fileType,
      extractedText
    ]);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: result.insertId,
        filename,
        originalName: originalname,
        fileType,
        contentLength: extractedText.length,
        uploadDate: new Date()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if database insert fails
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

/**
 * Get all documents
 */
const getAllDocuments = async (req, res) => {
  try {
    const sql = `
      SELECT 
        id,
        filename,
        original_name,
        file_type,
        CHAR_LENGTH(content) as content_length,
        upload_date
      FROM documents
      ORDER BY upload_date DESC
    `;
    
    const documents = await query(sql);

    res.json({
      success: true,
      data: documents,
      count: documents.length
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

/**
 * Get a specific document by ID
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        id,
        filename,
        original_name,
        file_path,
        file_type,
        CHAR_LENGTH(content) as content_length,
        upload_date
      FROM documents
      WHERE id = ?
    `;
    
    const documents = await query(sql, [id]);

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: documents[0]
    });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
};

/**
 * Get document content by ID
 */
const getDocumentContent = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = 'SELECT content FROM documents WHERE id = ?';
    const documents = await query(sql, [id]);

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: {
        content: documents[0].content
      }
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document content',
      error: error.message
    });
  }
};

/**
 * Delete a document
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document file path first
    const selectSql = 'SELECT file_path FROM documents WHERE id = ?';
    const documents = await query(selectSql, [id]);

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const filePath = documents[0].file_path;

    // Delete from database (conversations will be deleted automatically due to CASCADE)
    const deleteSql = 'DELETE FROM documents WHERE id = ?';
    await query(deleteSql, [id]);

    // Delete file from filesystem
    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue anyway since database record is deleted
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

module.exports = {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  getDocumentContent,
  deleteDocument
};