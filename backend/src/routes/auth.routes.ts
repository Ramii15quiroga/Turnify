import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validation';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { authenticate } from '../middlewares/auth';
import { z } from 'zod';

const router = Router();

router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/password/forgot', validateBody(z.object({ email: z.string().email() })), AuthController.requestReset);
router.post('/password/reset', validateBody(z.object({ token: z.string().min(1), password: z.string().min(6) })), AuthController.resetPassword);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export default router;

