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
import { updateAddress } from '@rules/user/updateAddress';

const router = Router();
router.use(authMiddleware);
router.use(verifiedEmailMiddleware);

router.get('/profile', UserController.getProfile);
router.put('/profile', validateRequest(updateProfileRules), UserController.updateProfile);
router.put('/address', validateRequest(updateAddress), UserController.updateAddress);
router.put('/update-preferences', validateRequest(updatePreferencesRules), UserController.updatePreferences);
router.put('/update-language', validateRequest(updateLanguageRules), UserController.updateLanguage);
router.put('/update-accessibility', validateRequest(updateAccessibilityRules), UserController.updateAccessibilityNeeds);
router.put('/change-password', validateRequest(changePasswordRules), UserController.changePassword);

export default router;