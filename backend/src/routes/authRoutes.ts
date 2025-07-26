import { Router } from 'express';
import { AuthController } from '@controllers/AuthController';
import { GoogleAuthController } from '@controllers/GoogleAuthController';
import validateRequest from '@middleware/validateRequest';
import { registerRules, loginRules, verifyEmailRules } from '@rules/auth';
import { googleAuthRules } from '@rules/auth/google';
import { forgotPasswordRules } from '@rules/auth/forgotPassword';
import { resetPasswordRules } from '@rules/auth/resetPassword';
import { authMiddleware } from '@middleware/authMiddleware';

const router = Router();

router.post('/register', validateRequest(registerRules), AuthController.register);
router.post('/login', validateRequest(loginRules), AuthController.login);
router.post('/verify-email', authMiddleware, validateRequest(verifyEmailRules), AuthController.verifyEmail);
router.post('/resend-verification', authMiddleware, AuthController.resendVerificationCode);
router.post('/google-auth', validateRequest(googleAuthRules), GoogleAuthController.authenticate);
router.post('/forgot-password', validateRequest(forgotPasswordRules), AuthController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordRules), AuthController.resetPassword);

export default router; 