import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import { authenticate, authorizeRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';
import { updateSchedulesSchema } from '../schemas/schedule.schema';

export const availabilityRouter = Router();
export const scheduleAdminRouter = Router();

// Public availability query
availabilityRouter.get('/', ScheduleController.getAvailability);

// Admin-only schedules management
scheduleAdminRouter.use(authenticate, authorizeRole(['ADMIN']));
scheduleAdminRouter.get('/', ScheduleController.getWeekly);
scheduleAdminRouter.put('/', validateBody(updateSchedulesSchema), ScheduleController.updateWeekly);
