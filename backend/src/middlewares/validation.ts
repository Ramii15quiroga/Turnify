import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => i.message);
        res.status(400).json({ error: issues[0], details: issues });
        return;
      }
      res.status(400).json({ error: 'Datos de solicitud inválidos' });
    }
  };
}

