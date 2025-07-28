
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

        const user = await User.findById(userId)
            .populate('accessibilityNeeds')
            .populate('language')
            .lean();

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
                responseStyle: "Warm, friendly, and conversational - feel free to use emojis, laugh (using 😄 or 😊), and be encouraging",
                focus: "Stay strictly within the current content scope, using examples that relate directly to the current topic",
                progression: "Track student understanding and adjust explanations accordingly, maintaining an upbeat and supportive tone"
            };

            if (isCompletionRequest) {
                requirements.completionCheck = context.nextContent ? 
                    "Assess understanding through friendly conversation. If user shows clear understanding, set completion to 100 and smoothly introduce the next exciting topic!" :
                    "If user shows clear understanding, celebrate their completion of the entire lesson! Be extra enthusiastic and encouraging about their achievement. Set completion to 100 and suggest they can practice what they've learned or explore new lessons.";
                
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
                        isLastContent: !context.nextContent
                    },
                    chatHistory: formattedHistory,
                    userQuestion: request.userChat,
                    teacherProfile: {
                        role: "Friendly and Enthusiastic Educational AI Assistant with PhD",
                        personality: "Warm, encouraging, and relatable - like a supportive friend who happens to be an expert",
                        traits: [
                            "Uses friendly language and emojis naturally",
                            "Laughs and shows excitement about the topic",
                            "Celebrates student progress enthusiastically",
                            "Makes learning feel like a fun conversation",
                            "Adapts explanation style to student needs"
                        ],
                        expertise: "Deep understanding of the subject matter with ability to explain complex concepts in a friendly, relatable way"
                    },
                    requirements,
                    completionGuidelines: {
                        verificationRequired: isCompletionRequest,
                        criteria: [
                            "Natural conversation shows understanding of key concepts",
                            "User responses demonstrate grasp of main ideas",
                            "Previous chat history shows active engagement"
                        ],
                        progressTracking: {
                            25: "Starting to get familiar with the concepts 🌱",
                            50: "Building good understanding 🌿",
                            75: "Discussing concepts confidently 🌳",
                            100: "Mastered the content! 🌟"
                        },
                        nextContentTransition: context.nextContent ? 
                            "When setting completion to 100, celebrate their success and excitedly introduce the next section's title and brief overview!" : 
                            "When setting completion to 100, give an enthusiastic celebration of completing the entire lesson! Encourage them to apply what they've learned and explore more topics."
                    }
                },
                output_format: {
                    type: "json",
                    fields: {
                        aiResponse: "string - the educational response (including celebrations and transitions)",
                        completion: "number - progress percentage (0-100)"
                    }
                }
            };

            const response = await this.generateAIResponse(prompt);

            console.log("Response", response);

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