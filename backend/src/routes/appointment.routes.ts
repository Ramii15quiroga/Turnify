import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticate, authorizeRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';
import { z } from 'zod';
import { createAppointmentSchema, cancelAppointmentSchema } from '../schemas/appointment.schema';

export const appointmentClientRouter = Router();
export const appointmentAdminRouter = Router();

// Client routes (require authenticated user)
appointmentClientRouter.use(authenticate);
appointmentClientRouter.post('/', validateBody(createAppointmentSchema), AppointmentController.create);
appointmentClientRouter.get('/my', AppointmentController.getMine);
appointmentClientRouter.patch('/:id/cancel', validateBody(cancelAppointmentSchema), AppointmentController.cancel);
appointmentClientRouter.patch('/:id/reschedule', validateBody(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/) })), AppointmentController.reschedule);

// Admin routes (require ADMIN role)
appointmentAdminRouter.use(authenticate, authorizeRole(['ADMIN']));
appointmentAdminRouter.get('/', AppointmentController.getAdminList);
// Specific routes must precede /:id, otherwise "statistics" is treated as an appointment ID.
appointmentAdminRouter.get('/statistics', AppointmentController.statistics);
appointmentAdminRouter.get('/:id', AppointmentController.getAdminById);
appointmentAdminRouter.patch('/:id/status', validateBody(z.object({ status: z.enum(['PENDING','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW']) })), AppointmentController.updateStatus);

