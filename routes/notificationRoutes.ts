
import { Router } from 'express';
import { sendPushNotification, sendEmailNotification } from '../controllers/NotificationController';
import { sendSmsNotification, sendBulkSms, smsHealthCheck } from '../controllers/SmsController';
import { testGeminiReply, sendGeminiReplySms } from '../controllers/GeminiController';
import { handleSmsWebhook } from '../controllers/WebhookController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/push', authMiddleware, sendPushNotification);
router.post('/email', authMiddleware, sendEmailNotification);
// SMS endpoints
router.post('/sms', authMiddleware, sendSmsNotification);
router.post('/sms/bulk', authMiddleware, sendBulkSms);
router.get('/sms/health', smsHealthCheck);
router.post('/sms/gemini-test', authMiddleware, testGeminiReply);
router.post('/sms/gemini-send-test', authMiddleware, sendGeminiReplySms);
// Public webhook for inbound SMS
router.post('/webhook', handleSmsWebhook);

export default router; 