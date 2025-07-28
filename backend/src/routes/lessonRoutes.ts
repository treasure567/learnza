import { Router } from 'express';
import { LessonController } from '@controllers/LessonController';
import { authMiddleware } from '@middleware/authMiddleware';
import validateRequest from '@middleware/validateRequest';
import { generateLessonRules, interactRules } from '@rules/lesson';
import { verifiedEmailMiddleware } from '@middleware/verifiedEmailMiddleware';

const router = Router();
router.use(authMiddleware);
router.use(verifiedEmailMiddleware)

router.get('/', LessonController.getLessons);
router.get('/:id', LessonController.getLesson);
router.get('/:contentId/chat', authMiddleware, LessonController.getChatHistory);
router.post('/generate', validateRequest(generateLessonRules), LessonController.generateLesson);
router.post('/interact', validateRequest(interactRules), LessonController.interact);

export default router; 