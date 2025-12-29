const express = require('express');
const router = express.Router();
const {
  askQuestion,
  getConversationHistory,
  getRecentConversations,
  deleteConversation
} = require('../controllers/chatController');

// Ask a question about a document
router.post('/ask', askQuestion);

// Get conversation history for a document
router.get('/history/:docId', getConversationHistory);

// Get recent conversations across all documents
router.get('/recent', getRecentConversations);

// Delete a conversation
router.delete('/conversation/:id', deleteConversation);

module.exports = router;