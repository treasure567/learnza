import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SmsHistory } from '../models/SmsHistory';
dotenv.config();

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private apiKey: string | undefined;
  private modelName: string;
  private readonly MAX_RETRIES = 3;
  private readonly FALLBACK_MESSAGES = [
    "Hi there, thanks for contacting Learnza. What do you plan on learning today?"
  ];

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      if (!this.apiKey) {
        console.warn('⚠️ Gemini API key not found. SMS replies will use fallback messages.');
        return;
      }
      
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
      console.log(`✅ Gemini client initialized with model: ${this.modelName}`);
    } catch (error) {
      console.error('❌ Failed to initialize Gemini client:', error);
      this.genAI = null;
      this.model = null;
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Gemini attempt ${attempt}/${maxRetries} for ${context}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Gemini attempt ${attempt}/${maxRetries} failed for ${context}:`, error);

        if (attempt === maxRetries) {
          console.error(`💥 All ${maxRetries} Gemini attempts failed for ${context}`);
          throw lastError;
        }

        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Unexpected error in Gemini retry logic');
  }

  private getFallbackMessage(userMessage: string, senderPhone: string): string {
    console.log(`🔄 Using fallback message for ${senderPhone}: "${userMessage}"`);
    
    // Always respond with minimal bot prompt
    return "What do you plan on learning today?";
  }

  async craftSmsReply(userMessage: string, senderPhone: string): Promise<string> {
    const timestamp = new Date().toISOString();
    console.log(`📱 [${timestamp}] Crafting SMS reply for ${senderPhone}: "${userMessage}"`);

    // If Gemini is not available, use fallback immediately
    if (!this.model || !this.genAI) {
      console.log('⚠️ Gemini not available, using fallback message');
      return this.getFallbackMessage(userMessage, senderPhone);
    }

    // Get conversation context from SMS history
    let conversationContext = '';
    try {
      conversationContext = await (SmsHistory as any).getConversationContext(senderPhone, 5);
      if (conversationContext) {
        console.log(`📜 Retrieved conversation context for ${senderPhone}:`, conversationContext.substring(0, 200) + '...');
      } else {
        console.log(`📜 No previous conversation history found for ${senderPhone}`);
      }
    } catch (error) {
      console.error('⚠️ Failed to retrieve conversation context:', error);
      // Continue without context if history retrieval fails
    }

    const systemPrompt = [
      "You are Learnza's SMS assistant. Learnza is an AI-powered, gamified learning platform built for accessible, affordable education across Nigeria.",
      'About Learnza:',
      '- Optimized for low-bandwidth environments',
      '- Supports local languages and cultural context',
      '- Uses AI and blockchain for decentralized credentialing',
      '- Features an earn-to-learn model to reward continuous learning',
      '- Offers offline-first access and culturally relevant content',
      '- Website: https://learnza.net.ng (provide this link if someone asks about the website)',
      '',
      'Guidelines:',
      '- Be friendly, concise, and helpful.',
      '- Keep responses within 300 characters suitable for 1-2 SMS segments.',
      "- Do NOT include pricing, discounts, or cost information.",
      "- If the user asks about pricing, reply exactly with: 'Hi there, thanks for contacting Learnza. What do you plan on learning today?'",
      '- Avoid links unless explicitly requested. Avoid markdown or emojis. Plain text only.',
      '- If uncertain, ask a short follow-up to clarify their learning goal.',
      '- Use the conversation context to provide more relevant and personalized responses.',
      '- Reference previous topics when appropriate to maintain conversation flow.',
    ].join('\n');

    const prompt = [
      systemPrompt,
      conversationContext,
      `Sender: ${senderPhone}`,
      `Current Message: ${userMessage}`,
      'Respond with a single SMS-friendly message that considers the conversation context. No prefixes like "Assistant:" Keep it under 300 characters.',
    ].join('\n\n');

    try {
      const response = await this.retryOperation(async () => {
        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        if (!text || text.trim().length === 0) {
          throw new Error('Empty response from Gemini model');
        }
        return text;
      }, `SMS reply generation for ${senderPhone}`);

      // Sanitize and enforce constraints (only pricing-related content is banned)
      const bannedPatterns = /(price|pricing|cost|fee|discount)/i;
      const cleaned = response
        .replace(/\r?\n+/g, ' ')
        .replace(/\*|_|`|~|>/g, '')
        .trim();

      const safeReply = cleaned && !bannedPatterns.test(cleaned)
        ? cleaned
        : this.getFallbackMessage(userMessage, senderPhone);

      const finalResponse = safeReply.slice(0, 320);
      console.log(`✅ Gemini response for ${senderPhone}: "${finalResponse}"`);
      return finalResponse;

    } catch (error) {
      console.error(`💥 Gemini failed for ${senderPhone}, using fallback:`, error);
      return this.getFallbackMessage(userMessage, senderPhone);
    }
  }

  // Health check method
  async healthCheck(): Promise<{ available: boolean; model: string; error?: string }> {
    try {
      if (!this.model || !this.genAI) {
        return {
          available: false,
          model: this.modelName,
          error: 'Gemini client not initialized'
        };
      }

      // Simple test generation
      const testResult = await this.model.generateContent('Hello');
      const testText = testResult.response.text();
      
      return {
        available: true,
        model: this.modelName,
      };
    } catch (error) {
      return {
        available: false,
        model: this.modelName,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default new GeminiService();
