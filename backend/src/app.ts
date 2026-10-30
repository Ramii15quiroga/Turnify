import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

export const app: Express = express();

app.use(cors());
app.use(express.json());

// Base health route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'turnify-api' });
});

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled API error:', err);
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ error: message });
});
