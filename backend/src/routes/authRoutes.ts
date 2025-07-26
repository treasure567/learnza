import { Router } from 'express';
import { AuthController } from '@controllers/AuthController';
import validateRequest from '@middleware/validateRequest';
import { authMiddleware } from '@middleware/authMiddleware';
import { registerRules, loginRules, verifyEmailRules } from '@rules/auth';

const router = Router();

router.post('/register', validateRequest(registerRules), AuthController.register);
router.post('/login', validateRequest(loginRules), AuthController.login);
router.post('/verify-email', authMiddleware, validateRequest(verifyEmailRules), AuthController.verifyEmail);
router.post('/resend-verification', authMiddleware, AuthController.resendVerificationCode);

export default router; 