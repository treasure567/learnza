import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import validateRequest from '../middleware/validateRequest';
import { registerRules } from '../rules/register';
import { loginRules } from '../rules/login';

const router = Router();

router.post('/register', validateRequest(registerRules), AuthController.register);
router.post('/login', validateRequest(loginRules), AuthController.login);

export default router; 