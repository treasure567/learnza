import { Router } from 'express';
import { UserController } from '@controllers/UserController';
import { authMiddleware } from '@middleware/authMiddleware';
import { verifiedEmailMiddleware } from '@middleware/verifiedEmailMiddleware';
import validateRequest from '@middleware/validateRequest';
import { updateLanguageRules, updateProfileRules, changePasswordRules } from '@rules/user';

const router = Router();

router.get('/profile', authMiddleware, verifiedEmailMiddleware, UserController.getProfile);
router.patch('/profile', authMiddleware, verifiedEmailMiddleware, validateRequest(updateProfileRules), UserController.updateProfile);
router.patch('/change-password', authMiddleware, verifiedEmailMiddleware, validateRequest(changePasswordRules), UserController.changePassword);
router.patch('/update-language', authMiddleware, verifiedEmailMiddleware, validateRequest(updateLanguageRules), UserController.updateLanguage);

export default router; 