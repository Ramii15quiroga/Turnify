import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { authenticate, authorizeRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';
import { createServiceSchema, updateServiceSchema } from '../schemas/service.schema';

export const servicePublicRouter = Router();
export const serviceAdminRouter = Router();

// Public routes for clients
servicePublicRouter.get('/', ServiceController.getActive);
servicePublicRouter.get('/:id', ServiceController.getById);

// Admin-only routes
serviceAdminRouter.use(authenticate, authorizeRole(['ADMIN']));
serviceAdminRouter.get('/', ServiceController.getAll);
serviceAdminRouter.post('/', validateBody(createServiceSchema), ServiceController.create);
serviceAdminRouter.put('/:id', validateBody(updateServiceSchema), ServiceController.update);
serviceAdminRouter.patch('/:id/deactivate', ServiceController.deactivate);
