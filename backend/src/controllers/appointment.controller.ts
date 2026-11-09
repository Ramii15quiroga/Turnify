import { Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { AuthRequest } from '../middlewares/auth';
import { AppointmentStatus } from '@prisma/client';

export class AppointmentController {
  static async reschedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { res.status(200).json(await AppointmentService.reschedule(req.params.id, req.user!.id, req.body.date, req.body.time)); } catch (err) { next(err); }
  }
  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { res.status(200).json(await AppointmentService.updateStatus(req.params.id, req.body.status as AppointmentStatus)); } catch (err) { next(err); }
  }
  static async statistics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = String(req.query.period || 'day') as 'day'|'week'|'month';
      if (!['day','week','month'].includes(period)) { res.status(400).json({error:'Periodo inválido'}); return; }
      res.status(200).json(await AppointmentService.statistics(period, String(req.query.date || new Date().toISOString().slice(0,10))));
    } catch (err) { next(err); }
  }
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

