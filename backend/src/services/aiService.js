const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  /**
   * Enhance text content while preserving original context
   * @param {string} text - Original text to enhance
   * @param {string} contentType - Type of content (title, description, content, etc.)
   * @returns {Promise<string>} Enhanced text
   */
  async enhanceText(text, contentType = "general") {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error("Text content is required");
      }

      const prompts = {
        title: `Improve this title while keeping its original meaning and context. Make it more engaging, professional, and compelling. Ensure proper grammar and vocabulary. Only return the enhanced title, nothing else.

        Original title: "${text}"

        Enhanced title:`,

        subtitle: `Enhance this subtitle to be more engaging and professional while preserving the original message. Improve grammar, vocabulary, and make it more compelling. Only return the enhanced subtitle, nothing else.

        Original subtitle: "${text}"

        Enhanced subtitle:`,

        description: `Improve this description while maintaining its original context and meaning. Enhance grammar, vocabulary, and readability. Make it more professional and engaging without changing the core message. Only return the enhanced description, nothing else.

        Original description: "${text}"

        Enhanced description:`,

        content: `Enhance this content while preserving its original context, meaning, and tone. Improve grammar, vocabulary, sentence structure, and overall readability. Make it more professional and engaging without altering the fundamental message or intent. Only return the enhanced content, nothing else.

        Original content: "${text}"

        Enhanced content:`,

        general: `Improve this text while keeping its original meaning and context intact. Enhance grammar, vocabulary, and readability. Make it more professional and engaging. Only return the enhanced text, nothing else.

        Original text: "${text}"

        Enhanced text:`,
      };

      const prompt = prompts[contentType] || prompts.general;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = response.text().trim();

      // Basic validation to ensure we got a reasonable response
      if (!enhancedText || enhancedText.length === 0) {
        throw new Error("AI service returned empty response");
      }

      // Remove any potential markdown formatting or extra quotes
      const cleanText = enhancedText
        .replace(/^["'`]+|["'`]+$/g, "") // Remove quotes
        .replace(/^\*\*|\*\*$/g, "") // Remove bold markdown
        .replace(/^#+\s*/g, "") // Remove markdown headers
        .trim();

      return cleanText;
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      throw new Error(`Failed to enhance text: ${error.message}`);
    }
  }

  /**
   * Enhance multiple text items (for lists)
   * @param {string[]} items - Array of text items to enhance
   * @param {string} contentType - Type of content (values, benefits, etc.)
   * @returns {Promise<string[]>} Array of enhanced text items
   */
  async enhanceTextArray(items, contentType = "list") {
    try {
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Items array is required");
      }

      const itemsList = items
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n");

      const prompts = {
        values: `Enhance these company values while maintaining their core meaning. Make them more professional, impactful, and inspiring. Improve grammar and vocabulary. Return only the enhanced values as a numbered list, one per line.

        Original values:
        ${itemsList}

        Enhanced values:`,

        benefits: `Improve these employee benefits descriptions while keeping their original meaning. Make them more appealing, professional, and clear. Enhance grammar and vocabulary. Return only the enhanced benefits as a numbered list, one per line.

        Original benefits:
        ${itemsList}

        Enhanced benefits:`,

        list: `Enhance these list items while preserving their original meaning. Improve grammar, vocabulary, and make them more professional and engaging. Return only the enhanced items as a numbered list, one per line.

        Original items:
        ${itemsList}

        Enhanced items:`,
      };

      const prompt = prompts[contentType] || prompts.list;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = response.text().trim();

      // Parse the response back into an array
      const enhancedItems = enhancedText
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter((item) => item.length > 0);

      // Fallback: if parsing failed, return original items
      if (enhancedItems.length === 0) {
        console.warn(
          "Failed to parse AI response for array items, returning originals"
        );
        return items;
      }

      return enhancedItems;
    } catch (error) {
      console.error("AI Enhancement Array Error:", error);
      throw new Error(`Failed to enhance text array: ${error.message}`);
    }
  }

  /**
   * Generate content suggestions based on content type and company context
   * @param {string} contentType - Type of content to generate
   * @param {Object} companyContext - Company information for context
   * @returns {Promise<Object>} Generated content suggestions
   */
  async generateContentSuggestions(contentType, companyContext = {}) {
    try {
      const {
        name = "Your Company",
        industry = "Technology",
        description = "",
      } = companyContext;

      const prompts = {
        hero: `Generate an engaging hero section for a careers page for ${name}, a ${industry} company. ${
          description ? `Company description: ${description}` : ""
        }

        Create:
        1. A compelling main title (max 8 words)
        2. An engaging subtitle (max 15 words)

        Format as JSON: {"title": "...", "subtitle": "..."}`,

        about: `Generate an "About Us" section for ${name}, a ${industry} company's careers page. ${
        description ? `Company description: ${description}` : ""
        }

        Create:
        1. A section title
        2. A compelling description (2-3 sentences) that would attract potential employees

        Format as JSON: {"title": "...", "content": "..."}`,

        values: `Generate 4-6 core company values for ${name}, a ${industry} company. Make them inspiring, authentic, and relevant to potential employees.

        Format as JSON: {"title": "Our Core Values", "items": ["Value 1", "Value 2", ...]}`,
      };

      const prompt = prompts[contentType];
      if (!prompt) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().trim();

      // Try to parse JSON response
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse AI JSON response:", content);
        throw new Error("AI service returned invalid format");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }
}

module.exports = new AIService();
