const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  getDocumentContent,
  deleteDocument
} = require('../controllers/documentController');

// Upload a document
router.post('/upload', upload.single('file'), uploadDocument);

// Get all documents
router.get('/', getAllDocuments);

// Get a specific document
router.get('/:id', getDocumentById);

// Get document content
router.get('/:id/content', getDocumentContent);

// Delete a document
router.delete('/:id', deleteDocument);

module.exports = router;