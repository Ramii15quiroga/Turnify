import { Router } from 'express';
import { z } from 'zod';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorizeRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';

const router = Router();
router.use(authenticate, authorizeRole(['ADMIN']));
router.get('/', UserController.list);
router.patch('/:id', validateBody(z.object({ role: z.enum(['CLIENT', 'ADMIN']).optional(), isActive: z.boolean().optional() }).refine(v => v.role !== undefined || v.isActive !== undefined)), UserController.update);
export default router;
