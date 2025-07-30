
import { Router } from 'express';
import { handleInteraction } from '../controllers/InteractController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, handleInteraction);

export default router; 