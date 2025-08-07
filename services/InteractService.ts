
import { InteractionRequest, InteractionResponse } from '../types/interact';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import LessonContent from '../models/LessonContent';
import Lesson from '../models/Lesson';
import User from '../models/User';
import LessonChatHistory, { ChatAgent } from '../models/LessonChatHistory';
import { Types } from 'mongoose';

config();

interface PromptRequirements {
    responseStyle: string;
    focus: string;
    progression: string;
    completionCheck?: string;
    nextContent?: {
        title: string;
        description: string;
    };
}

export class InteractService {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private readonly MAX_RETRIES = 3;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_AI_API_KEY environment variable is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    private extractJsonFromResponse(response: string): any {
        try {
            return JSON.parse(response.trim());
        } catch {
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1].trim());
            }
            throw new Error('No valid JSON found in response');
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
                return await operation();
            } catch (error) {
                lastError = error as Error;
                console.error(`Attempt ${attempt}/${maxRetries} failed for ${context}:`, error);

                if (attempt === maxRetries) {
                    console.error(`All ${maxRetries} attempts failed for ${context}`);
                    throw lastError;
                }

                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError || new Error('Unexpected error in retry logic');
    }

    private async getRecentChatHistory(userId: string, contentId: string): Promise<any[]> {
        return LessonChatHistory.find({
            userId: new Types.ObjectId(userId),
            contentId
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    }

    private async getLessonContext(contentId: string, userId: string): Promise<any> {
        const content = await LessonContent.findById(contentId).lean();
        if (!content) {
            throw new Error('Content not found');
        }

        const lesson = await Lesson.findById(content.lessonId).lean();
        if (!lesson) {
            throw new Error('Lesson not found');
        }

        const nextContent = await LessonContent.findOne({
            lessonId: content.lessonId,
            sequenceNumber: content.sequenceNumber + 1
        }).lean();

        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        return { content, lesson, nextContent, user };
    }

    private formatChatHistory(history: any[]): string {
        return history.reverse().map(chat => 
            `${chat.agent.toUpperCase()}: ${chat.content}`
        ).join('\n');
    }

    private checkForCompletionRequest(userChat: string): boolean {
        const completionKeywords = [
            'satisfied',
            'complete',
            'finished',
            'done',
            'understood',
            'got it',
            'clear',
            'helpful',
            'thank you',
            'thanks'
        ];
        return completionKeywords.some(keyword => 
            userChat.toLowerCase().includes(keyword)
        );
    }

    private async generateAIResponse(prompt: any): Promise<any> {
        return this.retryOperation(async () => {
            const result = await this.model.generateContent(JSON.stringify(prompt));
            return this.extractJsonFromResponse(result.response.text());
        }, 'AI response generation');
    }

    public async handleInteraction(request: InteractionRequest): Promise<InteractionResponse> {
        try {
            console.log('Processing AI interaction:', request);

            const [chatHistory, context] = await Promise.all([
                this.getRecentChatHistory(request.userId, request.contentId),
                this.getLessonContext(request.contentId, request.userId)
            ]);

            const formattedHistory = this.formatChatHistory(chatHistory);
            const isCompletionRequest = this.checkForCompletionRequest(request.userChat);

            const requirements: PromptRequirements = {
                responseStyle: "Warm, friendly, and conversational - use emojis, laugh (using 😄 or 😊), and be encouraging. Keep sentences short and clear. Respond in the student's specified language.",
                focus: "Teach one small concept at a time! Use short, clear sentences. Break down concepts into digestible pieces. Maximum response length is 2000 characters.",
                progression: "Adapt teaching style based on current progress and understanding. Teach in small, manageable chunks."
            };

            if (isCompletionRequest) {
                requirements.completionCheck = context.nextContent ? 
                    "Give a brief review of key points, celebrate their understanding, and give a short preview of the next topic!" :
                    "Give a quick review of main concepts learned, celebrate their completion! Keep it short and encouraging.";
                
                if (context.nextContent) {
                    requirements.nextContent = {
                        title: context.nextContent.title,
                        description: context.nextContent.description
                    };
                }
            }

            const prompt = {
                task: "educational_interaction",
                context: {
                    student: {
                        name: context.user.name,
                        language: 'English',
                        accessibilityNeeds: context.user.accessibilityNeeds || []
                    },
                    lesson: {
                        title: context.lesson.title,
                        description: context.lesson.description
                    },
                    currentContent: {
                        title: context.content.title,
                        content: context.content.content,
                        sequenceNumber: context.content.sequenceNumber,
                        isLastContent: !context.nextContent,
                        currentProgress: context.content.currentProgress || 0
                    },
                    chatHistory: formattedHistory,
                    userQuestion: request.userChat,
                    teacherProfile: {
                        role: "Friendly and Enthusiastic Educational AI Assistant with PhD",
                        personality: "Warm, encouraging, and relatable - like a supportive friend who happens to be an expert",
                        traits: [
                            "Responds in the user's specified language.",
                            "Includes proper intonation markers for the specified language (e.g., accents, tones).",
                            "Teaches one concept at a time with clear examples",
                            "Uses short, easy-to-follow sentences",
                            "Keeps explanations concise and focused",
                            "Uses friendly language and emojis naturally",
                            "Shows excitement about teaching the topic",
                            "Adapts teaching style based on progress"
                        ],
                        teachingStyle: {
                            newConcept: "Start with a friendly, brief introduction and basic explanation",
                            inProgress: "Build upon previous knowledge with small, digestible additions",
                            reinforcement: "Connect concepts using clear, short examples",
                            mastery: "Challenge with quick, practical applications"
                        }
                    },
                    requirements,
                    completionGuidelines: {
                        verificationRequired: isCompletionRequest,
                        teachingProgress: {
                            0: "Start with basic concepts - one at a time 🌱",
                            25: "Add simple examples and details 🌿",
                            50: "Show quick, practical applications 🌳",
                            75: "Connect concepts with short examples 🌺",
                            100: "Quick celebration and next steps! 🌟"
                        },
                        nextContentTransition: context.nextContent ? 
                            "Give a quick preview of the next exciting topic!" : 
                            "Short celebration of completing the lesson!"
                    },
                    responseConstraints: {
                        maxLength: 2000,
                        style: "Short sentences, clear points",
                        structure: [
                            "Start with a brief greeting",
                            "Teach one small concept",
                            "Give a quick example",
                            "Check understanding",
                            "Keep total response under 2000 characters"
                        ]
                    }
                },
                output_format: {
                    type: "json",
                    fields: {
                        aiResponse: "string - teach content in short, clear sentences (max 2000 chars)",
                        completion: "number - progress percentage (0-100)"
                    }
                }
            };

            const response = await this.generateAIResponse(prompt);

            console.log("Response", response);

            // Ensure response doesn't exceed 2000 characters
            if (response.aiResponse.length > 2000) {
                response.aiResponse = response.aiResponse.substring(0, 1997) + "...";
            }

            if (response.completion === 100) {
                await LessonContent.findByIdAndUpdate(request.contentId, {
                    completionStatus: 'completed',
                    currentProgress: 100
                });
            } else {
                await LessonContent.findByIdAndUpdate(request.contentId, {
                    completionStatus: 'in_progress',
                    currentProgress: response.completion
                });
            }

            return {
                success: true,
                message: 'AI interaction processed successfully',
                data: {
                    userId: request.userId,
                    contentId: request.contentId,
                    userQuestion: request.userChat,
                    aiResponse: response.aiResponse,
                    completion: response.completion
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
                    aiResponse: 'Sorry, I encountered an error while processing your question. Please try again.',
                    completion: 0
                }
            };
        }
    }
} 