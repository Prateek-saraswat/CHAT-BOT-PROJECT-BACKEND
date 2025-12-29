const { query } = require('../config/database');
const { generateResponse } = require('../utils/aiService');

/**
 * Ask a question about a document
 */
const askQuestion = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    // Validate input
    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        message: 'Document ID and question are required'
      });
    }

    // Get document content
    const docSql = 'SELECT id, content, original_name FROM documents WHERE id = ?';
    const documents = await query(docSql, [documentId]);
    console.log(documents)

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = documents[0];
    // console.log(document)
    console.log(document.content)
    

    if (!document.content || document.content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Document content is empty or could not be extracted'
      });
    }

    // Generate AI response
    console.log(`Generating response for document ${documentId}`);
    const answer = await generateResponse(question, document.content);

    // Save conversation to database
    const conversationSql = `
      INSERT INTO conversations (document_id, question, answer)
      VALUES (?, ?, ?)
    `;
    
    const result = await query(conversationSql, [documentId, question, answer]);

    res.json({
      success: true,
      data: {
        id: result.insertId,
        documentId,
        documentName: document.original_name,
        question,
        answer,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process question',
      error: error.message
    });
  }
};

/**
 * Get conversation history for a document
 */
const getConversationHistory = async (req, res) => {
  try {
    const { docId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Verify document exists
    const docCheckSql = 'SELECT id FROM documents WHERE id = ?';
    const documents = await query(docCheckSql, [docId]);

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Get conversation history
    const conversationSql = `
      SELECT 
        id,
        document_id,
        question,
        answer,
        created_at
      FROM conversations
      WHERE document_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const conversations = await query(conversationSql, [docId, limit, offset]);

    // Get total count
    const countSql = 'SELECT COUNT(*) as total FROM conversations WHERE document_id = ?';
    const countResult = await query(countSql, [docId]);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: conversations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + conversations.length < total
      }
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation history',
      error: error.message
    });
  }
};

/**
 * Get recent conversations across all documents
 */
const getRecentConversations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const sql = `
      SELECT 
        c.id,
        c.document_id,
        c.question,
        c.answer,
        c.created_at,
        d.original_name as document_name
      FROM conversations c
      JOIN documents d ON c.document_id = d.id
      ORDER BY c.created_at DESC
      LIMIT ?
    `;
    
    const conversations = await query(sql, [limit]);

    res.json({
      success: true,
      data: conversations,
      count: conversations.length
    });

  } catch (error) {
    console.error('Get recent conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent conversations',
      error: error.message
    });
  }
};

/**
 * Delete a conversation
 */
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = 'DELETE FROM conversations WHERE id = ?';
    const result = await query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation',
      error: error.message
    });
  }
};

module.exports = {
  askQuestion,
  getConversationHistory,
  getRecentConversations,
  deleteConversation
};