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
import { GameUtil } from '@/utils/GameUtil';

interface GenerateLessonResponse {
    success: boolean;
    lessonPlan: string;
}

interface LessonWithProgress {
    _id: Types.ObjectId;
    title: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedTime: number;
    lastAccessedAt: Date | null;
    userId: Types.ObjectId;
    contents: ILessonContent[];
    progress: number;
    [key: string]: any;
}

interface ProgressStats {
    averageProgress: number;
    totalLessons: number;
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
    private static calculateLessonProgress(contents: ILessonContent[]): number {
        if (!contents || contents.length === 0) return 0;
        
        const completedContents = contents.filter(content => 
            content.completionStatus == 'completed' || content.completionStatus == 'in_progress'
        ).length;
        
        return (completedContents / contents.length) * 100;
    }

    static async generateLesson(userId: string, data: GenerateLessonRequest): Promise<boolean> {
        try {
            MicroserviceUtils.post<GenerateLessonResponse>(
                MicroService.AI,
                '/generate',
                {
                    userRequest: data.message,
                    userId,
                    languageCode: data.languageCode || 'en'
                }
            );
            GameUtil.updateTaskProgress(new Types.ObjectId(userId), 'LESSON');
            return true;
        } catch (error) {
            throw new CustomError('Failed to generate lesson', 500);
        }
    }

    static async getLessons(userId: string, options?: PaginationOptions): Promise<PaginatedResponse<LessonWithProgress>> {
        const query = Lesson.find({ userId: new Types.ObjectId(userId) }).populate('contents');
        const paginatedResult = await PaginationUtils.paginate(query, options);      
        const lessonsWithProgress = paginatedResult.data.map(lesson => {
            const lessonObj = lesson.toObject();
            return {
                ...lessonObj,
                _id: lessonObj._id as Types.ObjectId,
                progress: this.calculateLessonProgress(lesson.contents || [])
            } as LessonWithProgress;
        });

        return {
            ...paginatedResult,
            data: lessonsWithProgress
        };
    }

    static async getLesson(userId: string, lessonId: string): Promise<LessonWithProgress> {
        const lesson = await Lesson.findOne({
            _id: new Types.ObjectId(lessonId),
            userId: new Types.ObjectId(userId)
        }).populate<{ contents: ILessonContent[] }>('contents');

        if (!lesson) {
            throw new CustomError('Lesson not found', 404);
        }

        const lessonObj = lesson.toObject();
        return {
            ...lessonObj,
            _id: lessonObj._id as Types.ObjectId,
            progress: this.calculateLessonProgress(lesson.contents || [])
        } as LessonWithProgress;
    }

    static async checkForGeneratingLessons(userId: string): Promise<InstanceType<typeof Lesson>[]> {
        return Lesson.find({ userId: new Types.ObjectId(userId), generatingStatus: 'in_progress' });
    }

    static async getProgressStats(userId: string): Promise<ProgressStats> {
        const lessons = await Lesson.find({ 
            userId: new Types.ObjectId(userId) 
        }).populate('contents');

        if (!lessons.length) {
            return {
                averageProgress: 0,
                totalLessons: 0
            };
        }

        const totalProgress = lessons.reduce((sum, lesson) => {
            return sum + this.calculateLessonProgress(lesson.contents || []);
        }, 0);

        return {
            averageProgress: totalProgress / lessons.length,
            totalLessons: lessons.length
        };
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

    private static async getCurrentOrNextContent(lessonId: string): Promise<ILessonContent & { _id: Types.ObjectId }> {
        const contents = await LessonContent.find({ lessonId: new Types.ObjectId(lessonId) })
            .sort({ sequenceNumber: 1 });

        if (!contents.length) {
            throw new CustomError('No content found for this lesson', 404);
        }

        const currentContent = (contents.find(content => 
            content.completionStatus !== 'completed'
        ) || contents[contents.length - 1]) as ILessonContent & { _id: Types.ObjectId };

        return currentContent;
    }

    private static async isFirstInteraction(userId: string, contentId: string): Promise<boolean> {
        const history = await LessonChatHistory.findOne({
            userId: new Types.ObjectId(userId),
            contentId: new Types.ObjectId(contentId)
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

    static async interact(userId: string, message: string, lessonId: string, languageCode?: 'en' | 'yo' | 'ha' | 'ig' | string): Promise<string> {
        try {
            const lesson = await Lesson.findOne({ _id: lessonId, userId: new Types.ObjectId(userId) });
            if (!lesson) {
                throw new CustomError('Lesson not found', 404);
            }
            lesson.lastAccessedAt = new Date();
            await lesson.save();

            const currentContent = await this.getCurrentOrNextContent(lessonId);
            const contentId = currentContent._id.toString();
            const isFirst = await this.isFirstInteraction(userId, contentId);

            if (isFirst) {
                lesson.status = 'in_progress';
                await lesson.save();
            }

            const userMessage = isFirst ? 
                await this.getDefaultFirstMessage(userId, contentId) : 
                message;

            const response = await MicroserviceUtils.post<InteractResponse>(
                MicroService.INTERACT,
                '/interact',
                {
                    userId,
                    userChat: userMessage,
                    contentId,
                    languageCode
                }
            );

            if (!response.success) {
                throw new CustomError('Failed to process interaction', 500);
            }

            await LessonChatHistory.create({
                lessonId: new Types.ObjectId(lessonId),
                userId: new Types.ObjectId(userId),
                contentId,
                agent: ChatAgent.USER,
                content: userMessage
            });

            await LessonChatHistory.create({
                lessonId: new Types.ObjectId(lessonId),
                userId: new Types.ObjectId(userId),
                contentId,
                agent: ChatAgent.AI,
                content: response.data.aiResponse
            });
            GameUtil.updateTaskProgress(new Types.ObjectId(userId), 'CONTENT');
            return response.data.aiResponse;
            // const fileName = await OpenAIUtils.generateAudio(response.data.aiResponse);
            // return fileName;
        } catch (error) {
            console.error('Interaction error:', error);
            throw new CustomError('Failed to process interaction', 500);
        }
    }

    static async updateLessonLanguage(userId: string, lessonId: string, languageCode: string): Promise<ILesson> {
        const lesson = await Lesson.findOneAndUpdate({ _id: new Types.ObjectId(lessonId), userId: new Types.ObjectId(userId) }, { languageCode }, { new: true });
        if (!lesson) {
            throw new CustomError('Lesson not found', 404);
        }
        return lesson.toObject() as unknown as ILesson;
    }
} 