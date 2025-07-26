import { Response } from 'express';
import { ResponseUtils } from '@utils/ResponseUtils';
import { AuthRequest } from '@middleware/authMiddleware';
import { UserService } from '@services/UserService';
import { UpdateLanguageRequest, UpdateAccessibilityRequest } from '@/types/user';

export class UserController {
    static async getProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const user = await UserService.getProfile(req.user._id);
            ResponseUtils.success(res, user, 'Profile retrieved successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { name, email } = req.body;
            const user = await UserService.updateProfile(req.user._id, { name, email });
            ResponseUtils.success(res, user, 'Profile updated successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async updateLanguage(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { languageCode } = req.body as UpdateLanguageRequest;
            const user = await UserService.updateLanguage(req.user._id, languageCode);
            ResponseUtils.success(res, user, 'Language preference updated successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async updateAccessibilityNeeds(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { accessibilityIds } = req.body as UpdateAccessibilityRequest;
            const user = await UserService.updateAccessibilityNeeds(req.user._id, accessibilityIds);
            ResponseUtils.success(res, user, 'Accessibility needs updated successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async changePassword(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { currentPassword, newPassword } = req.body;
            await UserService.changePassword(req.user._id, currentPassword, newPassword);
            ResponseUtils.success(res, null, 'Password changed successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }
}