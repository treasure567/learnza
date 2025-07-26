import { Router } from 'express';
import { UserController } from '@controllers/UserController';
import { authMiddleware } from '@middleware/authMiddleware';
import { verifiedEmailMiddleware } from '@middleware/verifiedEmailMiddleware';
import validateRequest from '@middleware/validateRequest';
import { updateLanguageRules } from '@rules/user/updateLanguage';
import { updateAccessibilityRules } from '@rules/user/updateAccessibility';

const router = Router();

router.get('/profile', authMiddleware, verifiedEmailMiddleware, UserController.getProfile);
router.post('/profile', authMiddleware, UserController.updateProfile);
router.post('/change-password', authMiddleware, verifiedEmailMiddleware, UserController.changePassword);
router.post('/update-language', authMiddleware, validateRequest(updateLanguageRules), UserController.updateLanguage);
router.post('/update-accessibility', authMiddleware, validateRequest(updateAccessibilityRules), UserController.updateAccessibilityNeeds);

export default router; 