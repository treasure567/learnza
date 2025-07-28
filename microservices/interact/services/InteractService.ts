
import { InteractionRequest, InteractionResponse } from '../types/interact';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

config();

export class InteractService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_AI_API_KEY environment variable is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    public async handleInteraction(request: InteractionRequest): Promise<InteractionResponse> {
        try {
            console.log('Processing AI interaction:', request);

            const prompt = `You are an educational AI assistant. A user is asking about content related to lesson ID: ${request.contentId}.
            
            User's question: "${request.userChat}"
            
            Please provide a helpful, educational response that:
            1. Directly addresses the user's question
            2. Is clear and easy to understand
            3. Provides relevant examples when appropriate
            4. Encourages further learning
            
            Keep your response concise but informative (2-4 sentences).`;

            const result = await this.model.generateContent(prompt);
            const aiResponse = result.response.text().trim();

            return {
                success: true,
                message: 'AI interaction processed successfully',
                data: {
                    userId: request.userId,
                    contentId: request.contentId,
                    userQuestion: request.userChat,
                    aiResponse: aiResponse
                }
            };
        } catch (error) {
            console.error('Error processing AI interaction:', error);
            return {
                success: false,
                message: 'Failed to process AI interaction',
                data: {
                    userId: request.userId,
                    contentId: request.contentId,
                    userQuestion: request.userChat,
                    aiResponse: 'Sorry, I encountered an error while processing your question. Please try again.'
                }
            };
        }
    }
} 