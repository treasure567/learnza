import { Response } from 'express';
import { AuthRequest } from '@middleware/authMiddleware';
import { ResponseUtils } from '@utils/ResponseUtils';
import { LessonService } from '@services/LessonService';

export class LessonController {
    static async getLessons(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { page, limit, sort } = req.query;
            const paginationOptions = {
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                sort: sort ? JSON.parse(sort as string) : undefined
            };
            
            const lessons = await LessonService.getLessons(req.user._id, paginationOptions);
            ResponseUtils.success(res, lessons, 'Lessons retrieved successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async getLesson(req: AuthRequest, res: Response): Promise<void> {
        try {
            const lesson = await LessonService.getLesson(req.user._id, req.params.id);
            ResponseUtils.success(res, lesson, 'Lesson fetched successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async generateLesson(req: AuthRequest, res: Response): Promise<void> {
        try {
            const lesson = await LessonService.generateLesson(req.user._id, req.body);
            ResponseUtils.success(res, lesson, 'Lesson generated successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }
}