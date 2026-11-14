// backend/src/middleware/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[API Error]', err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
  });
}
