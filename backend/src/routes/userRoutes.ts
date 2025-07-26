import { Router } from 'express';
import { UserController } from '@controllers/UserController';
import { authMiddleware } from '@middleware/authMiddleware';
import { verifiedEmailMiddleware } from '@middleware/verifiedEmailMiddleware';
import validateRequest from '@middleware/validateRequest';
import { updateProfileRules, changePasswordRules } from '@rules/user';

const router = Router();

router.get('/profile', authMiddleware, verifiedEmailMiddleware, UserController.getProfile);
router.put('/profile', 
    authMiddleware, 
    validateRequest(updateProfileRules), 
    UserController.updateProfile
);

router.post('/change-password',
    authMiddleware,
    verifiedEmailMiddleware,
    validateRequest(changePasswordRules),
    UserController.changePassword
);

export default router; 