import { Request, Response, NextFunction } from 'express';
import { ServiceService } from '../services/service.service';

export class ServiceController {
  static async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await ServiceService.getActiveServices();
      res.status(200).json(services);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await ServiceService.getAllServices();
      res.status(200).json(services);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await ServiceService.getServiceById(req.params.id);
      res.status(200).json(service);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await ServiceService.createService(req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await ServiceService.updateService(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  static async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deactivated = await ServiceService.deactivateService(req.params.id);
      res.status(200).json(deactivated);
    } catch (err) {
      next(err);
    }
  }
}
