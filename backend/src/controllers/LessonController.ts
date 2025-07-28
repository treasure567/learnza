import { Response } from 'express';
import { AuthRequest } from '@middleware/authMiddleware';
import { ResponseUtils } from '@utils/ResponseUtils';
import { LessonService } from '@services/LessonService';
import fs from 'fs';
import path from 'path';

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
            LessonService.generateLesson(req.user._id, req.body);
            ResponseUtils.success(res, {}, "Lesson is being generated");
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async getChatHistory(req: AuthRequest, res: Response): Promise<void> {
        try {
            const history = await LessonService.getChatHistory(req.user._id, req.params.contentId);
            ResponseUtils.success(res, history, 'Chat history retrieved successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async interact(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { message, lessonId } = req.body;
            const fileName = await LessonService.interact(req.user._id, message, lessonId);
            const filePath = path.join(__dirname, '..', '..', 'audio', fileName);

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
            
            stream.on('end', () => {
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }
}