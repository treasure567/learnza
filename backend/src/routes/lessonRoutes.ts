import { Router } from 'express';
import { LessonController } from '@controllers/LessonController';
import { authMiddleware } from '@middleware/authMiddleware';
import validateRequest from '@middleware/validateRequest';
import { generateLessonRules, interactRules } from '@rules/lesson';

const router = Router();

router.get('/', authMiddleware, LessonController.getLessons);
router.get('/:id', authMiddleware, LessonController.getLesson);
router.post('/generate', authMiddleware, validateRequest(generateLessonRules), LessonController.generateLesson);
router.post('/interact', authMiddleware, validateRequest(interactRules), LessonController.interact);

export default router; 