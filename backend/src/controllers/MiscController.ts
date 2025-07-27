import { Request, Response } from 'express';
import { ResponseUtils } from '@utils/ResponseUtils';
import MiscService from '@services/MiscService';

export class MiscController {
    static async getLanguages(req: Request, res: Response): Promise<void> {
        try {
            const languages = await MiscService.getLanguages();
            ResponseUtils.success(res, { languages }, 'Languages retrieved successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async getAccessibilities(req: Request, res: Response): Promise<void> {
        try {
            const accessibilities = await MiscService.getAccessibilities();
            ResponseUtils.success(res, { accessibilities }, 'Accessibility options retrieved successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }
}
