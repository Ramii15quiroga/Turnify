import { Request, Response, NextFunction } from 'express';
import { ScheduleService } from '../services/schedule.service';

export class ScheduleController {
  static async getWeekly(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schedules = await ScheduleService.getWeeklySchedules();
      res.status(200).json(schedules);
    } catch (err) {
      next(err);
    }
  }

  static async updateWeekly(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await ScheduleService.updateWeeklySchedules(req.body);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  static async getAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceId, date } = req.query;
      const result = await ScheduleService.getAvailability({
        serviceId: String(serviceId || ''),
        date: String(date || ''),
      });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
