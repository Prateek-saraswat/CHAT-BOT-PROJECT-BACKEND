import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate AI response using OpenAI
 * (Document-aware but controlled)
 */
export const generateResponse = async (question, documentContent) => {
  try {
    if (!question || question.trim() === "") {
      return "Please ask a valid question.";
    }

    if (!documentContent || documentContent.trim() === "") {
      return "No document content available to answer from.";
    }

    // Limit document size (VERY IMPORTANT)
    const context =
      documentContent.length > 3000
        ? documentContent.slice(0, 3000)
        : documentContent;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant. Answer ONLY using the provided document context. If the answer is not in the document, say you don't know."
        },
        {
          role: "user",
          content: `Document Context:\n${context}\n\nQuestion:\n${question}`
        }
      ],
      temperature: 0.3
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("AI generation error:", error.message);
    return "Sorry, I failed to generate an AI response.";
  }
};
