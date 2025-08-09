import dotenv from 'dotenv';
dotenv.config();

// Lazy import to avoid throwing if dependency isn't installed yet.
let GoogleGenerativeAI: any;
let GoogleGenAI: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ GoogleGenerativeAI } = require('@google/generative-ai'));
} catch (error) {
  // Module may not be installed yet; we'll throw a clear error when used
}
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ GoogleGenAI } = require('@google/genai'));
} catch (error) {
  // Module may not be installed yet
}

export class GeminiService {
  private apiKey: string | undefined;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  private ensureClient() {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY must be set in environment variables');
    }
    // Prefer new SDK if installed; fallback to older one if present
    if (GoogleGenAI) {
      const ai = new GoogleGenAI({ apiKey: this.apiKey });
      return { type: 'new', client: ai } as const;
    }
    if (GoogleGenerativeAI) {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: this.modelName });
      return { type: 'old', client: model } as const;
    }
    throw new Error('Gemini SDK not installed. Run: npm install @google/genai');
  }

  async craftSmsReply(userMessage: string, senderPhone: string): Promise<string> {
    const modelRef = this.ensureClient();

    const systemPrompt = [
      'You are Learnza\'s SMS assistant. Reply via SMS only.',
      'Goals:',
      '- Be friendly, concise, and helpful.',
      '- Keep responses within 300 characters suitable for 1-2 SMS segments.',
      '- If greeting or vague, briefly introduce Learnza and suggest next actions (e.g., pricing, courses, support).',
      '- If a direct question, answer with one clear, actionable response and next step.',
      '- Avoid links unless explicitly requested. Avoid markdown or emojis. Plain text only.',
    ].join('\n');

    const prompt = [
      systemPrompt,
      `Sender: ${senderPhone}`,
      `Message: ${userMessage}`,
      'Respond with a single SMS-friendly message. No prefixes like "Assistant:"',
    ].join('\n\n');

    try {
      let text = '';
      if (modelRef.type === 'new') {
        const response = await modelRef.client.models.generateContent({
          model: this.modelName,
          contents: prompt,
          config: {
            temperature: 0.5,
            maxOutputTokens: 180,
          },
        });
        text = (response as any)?.text ?? '';
      } else {
        const result = await modelRef.client.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 180,
          },
        });
        text =
          (result as any)?.response?.text?.() ??
          (result as any)?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
          '';
      }
      const cleaned = (text || '').trim();
      if (!cleaned) {
        throw new Error('Empty response from model');
      }
      // Basic hard cap as safety
      return cleaned.slice(0, 320);
    } catch (error) {
      // Fallback message if the model fails
      return 'Hi! I\'m here to help with Learnza. Reply with what you need: courses, pricing, account, or support.';
    }
  }
}

const geminiService = new GeminiService();
export default geminiService;

