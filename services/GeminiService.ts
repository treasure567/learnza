import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private apiKey: string | undefined;
  private modelName: string;
  private readonly MAX_RETRIES = 3;
  private readonly FALLBACK_MESSAGES = [
    "Hi! I'm here to help with Learnza. Reply with what you need: courses, pricing, account, or support.",
    "Hello! Welcome to Learnza. How can I assist you today? Ask about our courses, pricing, or support.",
    "Hi there! Thanks for contacting Learnza. What would you like to know about our learning platform?",
    "Welcome to Learnza! I'm here to help. What can I assist you with today?"
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
    
    // Simple keyword-based responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
      return "Thanks for your interest! For pricing information, please visit our website or contact our support team. How else can I help?";
    }
    
    if (lowerMessage.includes('course') || lowerMessage.includes('learn') || lowerMessage.includes('class')) {
      return "Great! We offer various courses on our platform. Check our website for the full catalog or ask about specific topics you're interested in.";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
      return "I'm here to help! You can ask me about our courses, pricing, account issues, or general questions about Learnza.";
    }
    
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return "Hello! Welcome to Learnza. I'm here to help with questions about our courses, pricing, or support. What would you like to know?";
    }
    
    // Random fallback for unrecognized messages
    const randomIndex = Math.floor(Math.random() * this.FALLBACK_MESSAGES.length);
    return this.FALLBACK_MESSAGES[randomIndex];
  }

  async craftSmsReply(userMessage: string, senderPhone: string): Promise<string> {
    const timestamp = new Date().toISOString();
    console.log(`📱 [${timestamp}] Crafting SMS reply for ${senderPhone}: "${userMessage}"`);

    // If Gemini is not available, use fallback immediately
    if (!this.model || !this.genAI) {
      console.log('⚠️ Gemini not available, using fallback message');
      return this.getFallbackMessage(userMessage, senderPhone);
    }

    const systemPrompt = [
      "You are Learnza's SMS assistant. Reply via SMS only.",
      'Goals:',
      '- Be friendly, concise, and helpful.',
      '- Keep responses within 300 characters suitable for 1-2 SMS segments.',
      '- If greeting or vague, briefly introduce Learnza and suggest next actions (e.g., pricing, courses, support).',
      '- If a direct question, answer with one clear, actionable response and next step.',
      '- Avoid links unless explicitly requested. Avoid markdown or emojis. Plain text only.',
      '- Always end with a follow-up question or suggestion to keep conversation going.',
    ].join('\n');

    const prompt = [
      systemPrompt,
      `Sender: ${senderPhone}`,
      `Message: ${userMessage}`,
      'Respond with a single SMS-friendly message. No prefixes like "Assistant:" Keep it under 300 characters.',
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

      const cleaned = response.trim();
      const finalResponse = cleaned.slice(0, 320); // Hard limit for SMS safety
      
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

