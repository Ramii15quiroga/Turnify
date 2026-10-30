import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticate, authorizeRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';
import { createAppointmentSchema, cancelAppointmentSchema } from '../schemas/appointment.schema';

export const appointmentClientRouter = Router();
export const appointmentAdminRouter = Router();

// Client routes (require authenticated user)
appointmentClientRouter.use(authenticate);
appointmentClientRouter.post('/', validateBody(createAppointmentSchema), AppointmentController.create);
appointmentClientRouter.get('/my', AppointmentController.getMine);
appointmentClientRouter.patch('/:id/cancel', validateBody(cancelAppointmentSchema), AppointmentController.cancel);

// Admin routes (require ADMIN role)
appointmentAdminRouter.use(authenticate, authorizeRole(['ADMIN']));
appointmentAdminRouter.get('/', AppointmentController.getAdminList);
appointmentAdminRouter.get('/:id', AppointmentController.getAdminById);
