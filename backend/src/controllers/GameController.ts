import { Request, Response } from 'express';
import { AuthRequest } from '@middleware/authMiddleware';
import { ResponseUtils } from '@utils/ResponseUtils';
import { GameService } from '@services/GameService';

export class GameController {
    static async getAvailableTasks(req: AuthRequest, res: Response): Promise<void> {
        try {
            const tasks = await GameService.getAvailableTasks(req.user._id);
            ResponseUtils.success(res, tasks, 'Available tasks retrieved successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async getCompletedTasks(req: AuthRequest, res: Response): Promise<void> {
        try {
            const tasks = await GameService.getCompletedTasks(req.user._id);
            ResponseUtils.success(res, tasks, 'Completed tasks retrieved successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async getTaskProgress(req: AuthRequest, res: Response): Promise<void> {
        try {
            const progress = await GameService.getTaskProgress(req.user._id);
            ResponseUtils.success(res, progress, 'Task progress retrieved successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }
} 