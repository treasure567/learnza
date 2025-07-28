import { Router } from 'express';
import { GameController } from '@controllers/GameController';
import { authMiddleware } from '@middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/tasks/available', GameController.getAvailableTasks);
router.get('/tasks/completed', GameController.getCompletedTasks);
router.get('/tasks/progress', GameController.getTaskProgress);

export default router; 