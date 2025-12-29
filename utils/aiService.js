// import Groq from "groq-sdk";

const Groq = require('groq-sdk')

const groq = new Groq({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Main function to generate AI response
 * (ChatGPT-like, no typing effect)
 */
const generateResponse = async (question, documentContent) => {
  try {
    if (!question || question.trim() === "") {
      return "Please ask a valid question.";
    }

    const context =
      documentContent && documentContent.length > 1500
        ? documentContent.slice(0, 1500)
        : documentContent || "";

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: `
You are a friendly AI assistant like ChatGPT.

You are a smart, friendly AI assistant like ChatGPT.

Your job is to answer ALL types of questions intelligently.

Follow these rules carefully:

1. If the user's question is related to the uploaded document
   (for example: asking about name, project, time complexity, space complexity,
   description, links, or any detail present in the document),
   then answer STRICTLY using only the information from the document.

2. If the user's question is about the document BUT the required information
   is NOT present in the document, reply exactly with:
   "Not found in document".

3. If the user's question is NOT related to the document
   (for example: mathematics, DSA, programming concepts, general knowledge,
   logical questions, or problem solving),
   then answer it normally with clear explanation, just like ChatGPT.

4. If the user is greeting or chatting casually
   (for example: "hi", "hello", "how are you", "what's up"),
   respond in a friendly and conversational way.

5. Never invent or assume document-related facts.
   Document answers must always come only from the document.

6. Keep answers clear, helpful, and easy to understand.

          `,
        },
        {
          role: "user",
          content: `
Document:
${context || "No document uploaded"}

User question:
${question}
          `,
        },
      ],

      temperature: 0.4,
      max_tokens: 400,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI error:", error.message);
    return "AI service temporarily unavailable.";
  }
};

/**
 * Generate document summary
 */
const generateSummary = async (documentContent) => {
  try {
    if (!documentContent || documentContent.trim() === "") {
      return "No content available for summary.";
    }

    const content =
      documentContent.length > 1500
        ? documentContent.slice(0, 1500)
        : documentContent;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "Summarize the document clearly in simple language.",
        },
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("Summary error:", err.message);
    return "Failed to generate summary.";
  }
};

module.exports =  {
  generateResponse,
  generateSummary,
};
