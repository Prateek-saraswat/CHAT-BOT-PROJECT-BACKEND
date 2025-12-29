/**
 * AI Service for generating responses based on document content
 * This is a simple implementation. For production, integrate with OpenAI, Anthropic, or similar.
 */

/**
 * Simple keyword-based response generator
 * Replace this with actual AI API integration
 */
const generateSimpleResponse = (question, documentContent) => {
  const questionLower = question.toLowerCase();
  const contentLower = documentContent.toLowerCase();
  
  // Find relevant sentences
  const sentences = documentContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const relevantSentences = [];
  
  // Extract keywords from question
  const questionWords = questionLower
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3); // Filter short words
  
  // Find sentences containing question keywords
  sentences.forEach(sentence => {
    const sentenceLower = sentence.toLowerCase();
    const matchCount = questionWords.filter(word => sentenceLower.includes(word)).length;
    
    if (matchCount > 0) {
      relevantSentences.push({
        sentence: sentence.trim(),
        relevance: matchCount
      });
    }
  });
  
  // Sort by relevance
  relevantSentences.sort((a, b) => b.relevance - a.relevance);
  
  // Build response
  if (relevantSentences.length === 0) {
    return "I couldn't find relevant information in the document to answer your question. Please try rephrasing or ask something else about the document.";
  }
  
  // Return top 3 relevant sentences
  const topSentences = relevantSentences.slice(0, 3).map(item => item.sentence);
  return topSentences.join('. ') + '.';
};

/**
 * Generate response using OpenAI (optional - uncomment and configure)
 */
const generateOpenAIResponse = async (question, documentContent) => {
  // Uncomment and configure this for production use
  /*
  const axios = require('axios');
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that answers questions based on the provided document content. Only use information from the document.'
          },
          {
            role: 'user',
            content: `Document content:\n${documentContent}\n\nQuestion: ${question}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to generate AI response');
  }
  */
  
  // Fallback to simple response
  return generateSimpleResponse(question, documentContent);
};

/**
 * Main function to generate AI response
 */
const generateResponse = async (question, documentContent) => {
  try {
    // Check if document content exists
    if (!documentContent || documentContent.trim().length === 0) {
      return "The document appears to be empty or the content could not be extracted.";
    }
    
    // Validate question
    if (!question || question.trim().length === 0) {
      return "Please provide a valid question.";
    }
    
    // Truncate document content if too long (keep first 4000 chars)
    const truncatedContent = documentContent.length > 4000 
      ? documentContent.substring(0, 4000) + '...'
      : documentContent;
    
    // Use OpenAI if API key is available, otherwise use simple response
    if (process.env.OPENAI_API_KEY) {
      return await generateOpenAIResponse(question, truncatedContent);
    } else {
      return generateSimpleResponse(question, truncatedContent);
    }
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};

/**
 * Generate a summary of the document
 */
const generateSummary = (documentContent, maxLength = 200) => {
  if (!documentContent || documentContent.trim().length === 0) {
    return "No content available for summary.";
  }
  
  // Get first few sentences
  const sentences = documentContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let summary = '';
  
  for (const sentence of sentences) {
    if (summary.length + sentence.length > maxLength) break;
    summary += sentence.trim() + '. ';
  }
  
  return summary.trim() || documentContent.substring(0, maxLength) + '...';
};

module.exports = {
  generateResponse,
  generateSimpleResponse,
  generateSummary
};