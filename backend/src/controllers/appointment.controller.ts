import { Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { AuthRequest } from '../middlewares/auth';

export class AppointmentController {
  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await AppointmentService.createAppointment(req.user!.id, req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }

  static async getMine(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointments = await AppointmentService.getMyAppointments(req.user!.id);
      res.status(200).json(appointments);
    } catch (err) {
      next(err);
    }
  }

  static async cancel(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cancelled = await AppointmentService.cancelAppointment(
        req.params.id,
        req.user!.id,
        req.user!.role,
        req.body
      );
      res.status(200).json(cancelled);
    } catch (err) {
      next(err);
    }
  }

  static async getAdminList(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date, serviceId, status } = req.query;
      const appointments = await AppointmentService.getAdminAppointments({
        date: date ? String(date) : undefined,
        serviceId: serviceId ? String(serviceId) : undefined,
        status: status ? String(status) : undefined,
      });
      res.status(200).json(appointments);
    } catch (err) {
      next(err);
    }
  }

  static async getAdminById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointment = await AppointmentService.getAdminAppointmentById(req.params.id);
      res.status(200).json(appointment);
    } catch (err) {
      next(err);
    }
  }
}
