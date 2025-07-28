import { CustomError } from '@middleware/errorHandler';
import { Types } from 'mongoose';
import Lesson from '@/models/Lesson';
import LessonContent from '@/models/LessonContent';
import LessonChatHistory, { ChatAgent, ILessonChatHistory } from '@/models/LessonChatHistory';
import { ILesson, ILessonContent, GenerateLessonRequest } from '@/types/lesson';
import { PaginationUtils, PaginationOptions, PaginatedResponse } from '@/utils/PaginationUtils';
import { MicroserviceUtils, MicroService } from '@/utils/MicroserviceUtils';
import { OpenAIUtils } from '@/utils/OpenAIUtils';
import User from '@models/User';

interface GenerateLessonResponse {
    success: boolean;
    lessonPlan: string;
}

interface InteractResponse {
    success: boolean;
    message: string;
    aiResponse: string;
    userId: string;
    contentId: string;
    userQuestion: string;
}

export class LessonService {
    static async generateLesson(userId: string, data: GenerateLessonRequest): Promise<boolean> {
        try {
            MicroserviceUtils.post<GenerateLessonResponse>(
                MicroService.AI,
                '/generate',
                {
                    userRequest: data.message,
                    userId
                }
            );
            return true;
        } catch (error) {
            throw new CustomError('Failed to generate lesson', 500);
        }
    }

    static async getLessons(userId: string, options?: PaginationOptions): Promise<PaginatedResponse<ILesson>> {
        const query = Lesson.find({ userId: new Types.ObjectId(userId) });
        return PaginationUtils.paginate(query, options);
    }

    static async getLesson(userId: string, lessonId: string): Promise<ILesson> {
        const lesson = await Lesson.findOne({
            _id: new Types.ObjectId(lessonId),
            userId: new Types.ObjectId(userId)
        });
        if (!lesson) {
            throw new CustomError('Lesson not found', 404);
        }
        return lesson;
    }

    static async getChatHistory(userId: string, contentId: string): Promise<ILessonChatHistory[]> {
        const content = await LessonContent.findOne({ _id: contentId });
        if (!content) {
            throw new CustomError('Lesson content not found', 404);
        }

        return LessonChatHistory.find({
            lessonId: content.lessonId,
            userId: new Types.ObjectId(userId),
            contentId
        }).sort({ createdAt: 1 });
    }

    private static async getCurrentOrNextContent(lessonId: string): Promise<ILessonContent> {
        const contents = await LessonContent.find({ lessonId: new Types.ObjectId(lessonId) })
            .sort({ sequenceNumber: 1 });

        if (!contents.length) {
            throw new CustomError('No content found for this lesson', 404);
        }

        const currentContent = contents.find(content => 
            content.completionStatus !== 'completed'
        ) || contents[contents.length - 1];

        return currentContent;
    }

    private static async isFirstInteraction(userId: string, contentId: string): Promise<boolean> {
        const history = await LessonChatHistory.findOne({
            userId: new Types.ObjectId(userId),
            contentId
        });
        return !history;
    }

    private static async getDefaultFirstMessage(userId: string, contentId: string): Promise<string> {
        const user = await User.findById(userId).lean();
        const content = await LessonContent.findById(contentId).populate<{ lessonId: ILesson }>('lessonId').lean();

        if (!user || !content || !content.lessonId) {
            throw new CustomError('Failed to get user or content details', 500);
        }

        return `Hi, I'm ${user.name} and I want to learn about ${content.lessonId.title}. Can you teach me this concept like you're my PhD professor? I'm excited to learn! 😊`;
    }

    static async interact(userId: string, message: string, lessonId: string): Promise<string> {
        try {
            const lesson = await Lesson.findOne({ _id: lessonId, userId: new Types.ObjectId(userId) });
            if (!lesson) {
                throw new CustomError('Lesson not found', 404);
            }

            const currentContent = await this.getCurrentOrNextContent(lessonId);
            const isFirst = await this.isFirstInteraction(userId, currentContent._id.toString());

            const userMessage = isFirst ? 
                await this.getDefaultFirstMessage(userId, currentContent._id.toString()) : 
                message;

            const response = await MicroserviceUtils.post<InteractResponse>(
                MicroService.INTERACT,
                '/interact',
                {
                    userId,
                    userChat: userMessage,
                    contentId: currentContent._id.toString()
                }
            );

            if (!response.success) {
                throw new CustomError('Failed to process interaction', 500);
            }

            await LessonChatHistory.create({
                lessonId: new Types.ObjectId(lessonId),
                userId: new Types.ObjectId(userId),
                contentId: currentContent._id.toString(),
                agent: ChatAgent.USER,
                content: userMessage
            });

            await LessonChatHistory.create({
                lessonId: new Types.ObjectId(lessonId),
                userId: new Types.ObjectId(userId),
                contentId: currentContent._id.toString(),
                agent: ChatAgent.AI,
                content: response.data.aiResponse
            });

            const fileName = await OpenAIUtils.generateAudio(response.data.aiResponse);
            return fileName;
        } catch (error) {
            console.error('Interaction error:', error);
            throw new CustomError('Failed to process interaction', 500);
        }
    }
} 