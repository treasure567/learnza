import { Router } from 'express';
import { UserController } from '@controllers/UserController';
import { authMiddleware } from '@middleware/authMiddleware';
import validateRequest from '@middleware/validateRequest';
import { verifiedEmailMiddleware } from '@middleware/verifiedEmailMiddleware';
import { updateLanguageRules } from '@rules/user/updateLanguage';
import { updateAccessibilityRules } from '@rules/user/updateAccessibility';
import { updateProfileRules } from '@rules/user/updateProfile';
import { changePasswordRules } from '@rules/user/changePassword';
import { updatePreferencesRules } from '@rules/user/updatePreferences';

const router = Router();

router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, validateRequest(updateProfileRules), UserController.updateProfile);
router.put('/update-preferences', authMiddleware, validateRequest(updatePreferencesRules), UserController.updatePreferences);
router.put('/update-language', authMiddleware, validateRequest(updateLanguageRules), UserController.updateLanguage);
router.put('/update-accessibility', authMiddleware, validateRequest(updateAccessibilityRules), UserController.updateAccessibilityNeeds);
router.put('/change-password', authMiddleware, verifiedEmailMiddleware, validateRequest(changePasswordRules), UserController.changePassword);

export default router; 