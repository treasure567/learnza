import { CustomError } from '@middleware/errorHandler';
import { Types } from 'mongoose';
import Lesson from '@models/Lesson';
import LessonContent from '@models/LessonContent';
import { ILesson, ILessonContent, GenerateLessonRequest } from '@/types/lesson';
import { PaginationUtils, PaginationOptions, PaginatedResponse } from '@/utils/PaginationUtils';

export class LessonService {
    static async generateLesson(userId: string, data: GenerateLessonRequest): Promise<boolean> {
        return true;
    }

    static async getLessons(userId: string, options?: PaginationOptions): Promise<PaginatedResponse<ILesson>> {
        const query = Lesson.find({ userId: new Types.ObjectId(userId) }).populate('userId');
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
} 