import { Router } from 'express';
import { MiscController } from '@controllers/MiscController';
import { authMiddleware } from '@middleware/authMiddleware';

const router = Router();

router.get('/languages', MiscController.getLanguages);
router.get('/accessibilities', MiscController.getAccessibilities);
router.post('/speech', authMiddleware, MiscController.generateSpeech);

export default router; 