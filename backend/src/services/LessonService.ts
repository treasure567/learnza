import { CustomError } from '@middleware/errorHandler';
import { Types } from 'mongoose';
import Lesson from '@models/Lesson';
import LessonContent from '@models/LessonContent';
import { ILesson, ILessonContent, CreateLessonRequest, UpdateLessonRequest, CreateLessonContentRequest, UpdateLessonContentRequest, UpdateProgressRequest } from '@/types/lesson';

export class LessonService {
    static async createLesson(userId: string, data: CreateLessonRequest): Promise<ILesson> {
        const lesson = new Lesson({
            ...data,
            userId: new Types.ObjectId(userId)
        });
        await lesson.save();
        return lesson;
    }

    static async getLessons(userId: string): Promise<ILesson[]> {
        return Lesson.find({ userId: new Types.ObjectId(userId) });
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

    static async updateLesson(userId: string, lessonId: string, data: UpdateLessonRequest): Promise<ILesson> {
        const lesson = await Lesson.findOneAndUpdate(
            {
                _id: new Types.ObjectId(lessonId),
                userId: new Types.ObjectId(userId)
            },
            { $set: data },
            { new: true }
        );
        if (!lesson) {
            throw new CustomError('Lesson not found', 404);
        }
        return lesson;
    }

    static async deleteLesson(userId: string, lessonId: string): Promise<void> {
        const lesson = await Lesson.findOneAndDelete({
            _id: new Types.ObjectId(lessonId),
            userId: new Types.ObjectId(userId)
        });
        if (!lesson) {
            throw new CustomError('Lesson not found', 404);
        }
        await LessonContent.deleteMany({ lessonId: new Types.ObjectId(lessonId) });
    }

    static async createLessonContent(userId: string, lessonId: string, data: CreateLessonContentRequest): Promise<ILessonContent> {
        const lesson = await this.getLesson(userId, lessonId);
        
        const existingContent = await LessonContent.findOne({
            lessonId: new Types.ObjectId(lessonId),
            sequenceNumber: data.sequenceNumber
        });

        if (existingContent) {
            throw new CustomError('Content with this sequence number already exists', 400);
        }

        const content = new LessonContent({
            ...data,
            userId: new Types.ObjectId(userId),
            lessonId: new Types.ObjectId(lessonId)
        });

        await content.save();
        return content;
    }

    static async updateLessonContent(userId: string, contentId: string, data: UpdateLessonContentRequest): Promise<ILessonContent> {
        if (data.sequenceNumber) {
            const existingContent = await LessonContent.findOne({
                _id: { $ne: new Types.ObjectId(contentId) },
                lessonId: (await LessonContent.findById(new Types.ObjectId(contentId)))?.lessonId,
                sequenceNumber: data.sequenceNumber
            });

            if (existingContent) {
                throw new CustomError('Content with this sequence number already exists', 400);
            }
        }

        const content = await LessonContent.findOneAndUpdate(
            {
                _id: new Types.ObjectId(contentId),
                userId: new Types.ObjectId(userId)
            },
            { $set: data },
            { new: true }
        );

        if (!content) {
            throw new CustomError('Lesson content not found', 404);
        }

        return content;
    }

    static async updateProgress(userId: string, contentId: string, data: UpdateProgressRequest): Promise<ILessonContent> {
        const content = await LessonContent.findOne({
            _id: new Types.ObjectId(contentId),
            userId: new Types.ObjectId(userId)
        });
        if (!content) {
            throw new CustomError('Lesson content not found', 404);
        }

        content.currentProgress = data.progress;
        if (data.completionStatus) {
            content.completionStatus = data.completionStatus;
        } else {
            content.completionStatus = data.progress >= 100 ? 'completed' : 
                                     data.progress > 0 ? 'in_progress' : 
                                     'not_started';
        }
        content.lastAccessedAt = new Date();

        await content.save();
        return content;
    }

    static async getLessonContents(userId: string, lessonId: string): Promise<ILessonContent[]> {
        await this.getLesson(userId, lessonId);
        return LessonContent.find({
            lessonId: new Types.ObjectId(lessonId),
            userId: new Types.ObjectId(userId)
        }).sort('sequenceNumber');
    }

    static async getLessonContent(userId: string, contentId: string): Promise<ILessonContent> {
        const content = await LessonContent.findOne({
            _id: new Types.ObjectId(contentId),
            userId: new Types.ObjectId(userId)
        });
        if (!content) {
            throw new CustomError('Lesson content not found', 404);
        }
        return content;
    }
} 