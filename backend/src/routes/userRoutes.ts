import { Router } from 'express';
import { UserController } from '@controllers/UserController';
import { authMiddleware } from '@middleware/authMiddleware';
import { verifiedEmailMiddleware } from '@middleware/verifiedEmailMiddleware';
import validateRequest from '@middleware/validateRequest';
import { updateLanguageRules } from '@rules/user/updateLanguage';

const router = Router();

router.get('/profile', authMiddleware, verifiedEmailMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);
router.post('/change-password', authMiddleware, verifiedEmailMiddleware, UserController.changePassword);
router.put('/language', authMiddleware, validateRequest(updateLanguageRules), UserController.updateLanguage);

export default router; 