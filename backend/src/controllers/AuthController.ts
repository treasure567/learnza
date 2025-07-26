import { Request, Response } from 'express';
import { AuthService } from '@services/AuthService';
import { UserResponse, VerifyEmailRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@/types/user';
import { ResponseUtils } from '@utils/ResponseUtils';
import { AuthRequest } from '@middleware/authMiddleware';

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, password } = req.body;
            const result: UserResponse = await AuthService.register(email, name, password);
            ResponseUtils.created(res, result, 'User registered successfully. Please check your email for verification code.');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const result: UserResponse = await AuthService.login(email, password);
            ResponseUtils.success(res, result, 'Login successful');
        } catch (error) {
            ResponseUtils.unauthorized(res, (error as Error).message);
        }
    }

    static async verifyEmail(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { code } = req.body as VerifyEmailRequest;
            const user = await AuthService.verifyEmail(req.user._id, code);
            ResponseUtils.success(res, user, 'Email verified successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async resendVerificationCode(req: AuthRequest, res: Response): Promise<void> {
        try {
            await AuthService.resendVerificationCode(req.user._id);
            ResponseUtils.success(res, null, 'Verification code resent successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body as ForgotPasswordRequest;
            await AuthService.forgotPassword(email);
            ResponseUtils.success(res, null, 'Password reset instructions sent to your email');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, password } = req.body as ResetPasswordRequest;
            await AuthService.resetPassword(token, password);
            ResponseUtils.success(res, null, 'Password reset successful');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }
} 