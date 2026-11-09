import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';
import { UserService } from '../services/user.service';

export class UserController {
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(200).json(await UserService.list()); } catch (err) { next(err); }
  }
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(200).json(await UserService.update(req.params.id, req.user!.id, { ...req.body, role: req.body.role as Role | undefined })); } catch (err) { next(err); }
  }
}
