import { Request, Response } from 'express';
import { GoogleAuthService } from '@services/GoogleAuthService';
import { ResponseUtils } from '@utils/ResponseUtils';

export class GoogleAuthController {
    static async authenticate(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.body;
            const result = await GoogleAuthService.authenticate(token);
            ResponseUtils.success(res, result, 'Google authentication successful');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }
} 