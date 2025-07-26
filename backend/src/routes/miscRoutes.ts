import { Router } from 'express';
import { MiscController } from '@controllers/MiscController';

const router = Router();

router.get('/languages', MiscController.getLanguages);

export default router; 