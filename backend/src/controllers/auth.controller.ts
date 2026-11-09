import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth';

export class AuthController {
  static async requestReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(200).json(await AuthService.requestPasswordReset(req.body.email)); } catch (err) { next(err); }
  }
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(200).json(await AuthService.resetPassword(req.body.token, req.body.password)); } catch (err) { next(err); }
  }
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ user: req.user });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({ message: 'Sesión finalizada correctamente' });
  }
}

