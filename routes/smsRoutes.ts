
import { Router } from 'express';
import { sendSmsNotification, sendBulkSms, smsHealthCheck } from '../controllers/SmsController';
import { handleSmsWebhook } from '../controllers/WebhookController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// SMS routes
router.post('/sms', authMiddleware, sendSmsNotification);
router.post('/sms/bulk', authMiddleware, sendBulkSms); // New bulk SMS endpoint
router.get('/sms/health', smsHealthCheck); // Health check endpoint (no auth required)
// Public endpoint to receive SMS webhooks from Trenalyze (cannot require bearer auth)
router.post('/webhook', handleSmsWebhook);

export default router; 