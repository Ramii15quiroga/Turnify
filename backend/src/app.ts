import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { servicePublicRouter, serviceAdminRouter } from './routes/service.routes';

dotenv.config();

export const app: Express = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicePublicRouter);
app.use('/api/admin/services', serviceAdminRouter);

// Base health route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'turnify-api' });
});

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ error: message });
});
