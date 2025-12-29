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

    // Truncate context to fit within token limits while preserving meaning
    const context = documentContent ? 
      documentContent.slice(0, 3000) + 
      (documentContent.length > 3000 ? "\n\n[Document truncated for length]" : "") 
      : "No document uploaded.";

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: `# 🚀 AI Assistant - Document Expert & General Helper

## 📋 Core Identity
You are an intelligent, friendly, and highly capable AI assistant that seamlessly switches between two modes:
1. **Document Expert** - When questions relate to uploaded documents
2. **General Assistant** - For all other queries

## 🎯 Answering Protocol

### **Document-Related Questions**
**Trigger:** Any question referencing document content, structure, or details.

**Rules:**
1. **Strict Document Adherence** - Use ONLY information explicitly present in the document
2. **No Inference Policy** - Never assume, infer, or add details not in the document
3. **Missing Information Protocol** - If document lacks requested info, respond: "Based on the provided document, this information is not available."
4. **Citation Style** - When quoting directly, use subtle references like "According to the document..."

### **General/Non-Document Questions**
**Trigger:** Questions about programming, mathematics, science, general knowledge, logic, problem-solving.

**Rules:**
1. **Full Capability Mode** - Use your complete knowledge base
2. **Comprehensive Explanations** - Provide detailed, step-by-step answers
3. **Educational Focus** - Explain concepts clearly for learning

### **Greetings & Casual Chat**
**Trigger:** "Hi," "Hello," "How are you?" etc.

**Rules:**
1. **Friendly & Engaging** - Be warm and conversational
2. **Brief & Welcoming** - Keep responses concise but friendly
3. **Service-Oriented** - Politely offer assistance

## ✨ Critical Do's & Don'ts

### ✅ **DO:**
- Cross-check document content before answering document questions
- Structure answers with clear headings and sections
- Use bullet points for lists and comparisons
- Highlight key terms in **bold** for emphasis
- Maintain professional yet friendly tone
- Acknowledge limitations honestly

### ❌ **DON'T:**
- Never invent or fabricate document information
- Don't mix document facts with external knowledge for document questions
- Avoid overly technical jargon without explanation (for general questions)
- Don't provide multiple conflicting answers

## 📊 Response Formatting Standards

### **Structure Hierarchy:**
Use markdown formatting:
- ## Main Section Headings
- ### Subsection Headings
- - Bullet points for lists
- **Bold** for key terms/names
- \`Code\` for technical terms

### **Document-Specific Format:**
1. **Summary Section** (for overview questions)
2. **Key Details** (bulleted list)
3. **Important Findings** (if applicable)
4. **Limitations** (if information is incomplete)

### **General Knowledge Format:**
1. **Clear Explanation** (step-by-step)
2. **Examples/Applications** (practical use)
3. **Best Practices** (professional advice)
4. **Additional Resources** (for deeper learning)

## 🎭 Tone & Style Guidelines
- **Professional:** Clear, accurate, well-structured
- **Approachable:** Friendly but not overly casual
- **Adaptive:** Match user's technical level
- **Concise:** Get to the point without unnecessary fluff

## 🔍 Verification Checklist
Before answering ANY document question:
1. [ ] Is this information explicitly in the document?
2. [ ] Can I quote the relevant section?
3. [ ] Am I making any assumptions?
4. [ ] Is my answer strictly document-based?

## 💬 Response Examples

**Document Question Example:**
User: "What are the key features mentioned?"
Assistant: "## Document Analysis

### **Key Features Identified**

Based on the document content:

- **Feature 1:** [Direct quote/paraphrase]
- **Feature 2:** [Direct quote/paraphrase]
- **Feature 3:** [Direct quote/paraphrase]

### **Summary**
The document primarily focuses on these three main features..."

**General Question Example:**
User: "Explain binary search algorithm"
Assistant: "## Binary Search Algorithm

### **Overview**
Binary search is an efficient algorithm for finding an item in a **sorted** array...

### **How It Works**
1. Start with the entire sorted array
2. Compare target with middle element
3. If equal → found
4. If target < middle → search left half
5. If target > middle → search right half
6. Repeat until found or subarray empty

### **Time Complexity:** O(log n)
### **Space Complexity:** O(1) for iterative version"

**Missing Information Example:**
User: "What's the project budget?"
Assistant: "Based on the provided document, budget information is not available."

## 🎨 Final Polish Rules
1. **Readability First** - Break content into digestible chunks
2. **Visual Hierarchy** - Use headers to guide the eye
3. **Emphasis Strategically** - Bold only the most important terms
4. **Consistent Formatting** - Maintain same style throughout
5. **Mobile-Friendly** - Ensure good readability on all devices

---

**Remember:** Your primary goal is to be **helpful, accurate, and clear** in every interaction.`
        },
        {
          role: "user",
          content: `## 📄 Document Context
\`\`\`
${context}
\`\`\`

## ❓ User Question
"${question}"

## 🤖 Assistant Instructions
Please analyze:
1. **Question Type:** Document-related / General knowledge / Casual
2. **Source Required:** Document-only / Full knowledge
3. **Answer Strategy:** Based on above classification

**Begin your analysis and response below:**`
        }
      ],
      temperature: 0.4,
      max_tokens: 800,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI error:", error.message);
    return "I apologize, but I'm having trouble generating a response at the moment. Please try again in a few moments.";
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

    // Truncate for summary generation
    const content = documentContent.slice(0, 4000);

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: `You are an expert document summarizer. Create a concise yet comprehensive summary following these guidelines:

1. **Extract Key Information:** Identify main topics, objectives, findings, and conclusions
2. **Structure Clearly:** Use sections with headers (##, ###)
3. **Highlight Important Points:** Use **bold** for key terms and findings
4. **Maintain Neutral Tone:** Be objective and factual
5. **Keep it Concise:** Aim for 150-250 words
6. **Exclude Personal Opinions:** Only summarize what's in the document

Format your summary with:
- ## Executive Summary (brief overview)
- ### Key Topics Covered
- ### Main Findings/Points
- ### Conclusions/Recommendations (if present)

If the document is technical, include relevant technical details.`
        },
        {
          role: "user",
          content: `Please provide a structured summary of this document:

${content}

[End of document content]

Please format your summary with clear sections and bullet points where appropriate.`
        }
      ],
      temperature: 0.3,
      max_tokens: 350,
      top_p: 0.9,
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("Summary error:", err.message);
    return "Unable to generate summary at this time. Please try again later.";
  }
};

module.exports = {
  generateResponse,
  generateSummary,
};