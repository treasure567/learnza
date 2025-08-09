import dotenv from 'dotenv';
dotenv.config();

let GoogleGenAI: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ GoogleGenAI } = require('@google/genai'));
} catch (error) {}

export class GeminiService {
  private apiKey: string | undefined;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  private getClient() {
    if (!this.apiKey) throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY must be set');
    if (!GoogleGenAI) throw new Error('Install @google/genai: npm i @google/genai');
    return new GoogleGenAI({ apiKey: this.apiKey });
  }

  async craftSmsReply(userMessage: string, senderPhone: string): Promise<string> {
    const ai = this.getClient();
    const systemPrompt = [
      "You are Learnza's SMS assistant. Reply via SMS only.",
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
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: { temperature: 0.5, maxOutputTokens: 180 },
      });
      const text: string = (response as any)?.text ?? '';
      const cleaned = (text || '').trim();
      if (!cleaned) throw new Error('Empty response from model');
      return cleaned.slice(0, 320);
    } catch {
      return "Hi! I'm here to help with Learnza. Reply with what you need: courses, pricing, account, or support.";
    }
  }
}

export default new GeminiService();

