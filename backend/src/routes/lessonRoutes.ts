import { Router } from 'express';
import { LessonController } from '@controllers/LessonController';
import { authMiddleware } from '@middleware/authMiddleware';
import { verifiedEmailMiddleware } from '@middleware/verifiedEmailMiddleware';
import validateRequest from '@middleware/validateRequest';
import { generateLessonRules } from '@rules/lesson';

const router = Router();

router.use(authMiddleware);
router.use(verifiedEmailMiddleware);

router.get('/', LessonController.getLessons);
router.get('/:id', LessonController.getLesson);
router.post('/generate', validateRequest(generateLessonRules), LessonController.generateLesson);

export default router; 