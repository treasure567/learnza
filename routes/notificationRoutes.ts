
import { Router } from 'express';
import { sendPushNotification, sendEmailNotification } from '../controllers/NotificationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/push', authMiddleware, sendPushNotification);
router.post('/email', authMiddleware, sendEmailNotification);

export default router; 