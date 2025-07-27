import { Router } from 'express';
import { LessonController } from '@controllers/LessonController';
import { authMiddleware } from '@middleware/authMiddleware';
import { verifiedEmailMiddleware } from '@middleware/verifiedEmailMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(verifiedEmailMiddleware);

router.get('/', authMiddleware, verifiedEmailMiddleware, LessonController.getLessons);


export default router; 