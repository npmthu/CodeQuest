// Request logging middleware
import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl } = req;
  res.once('finish', () => {
    const duration = Date.now() - start;
    // minimal structured log
    // eslint-disable-next-line no-console
    console.log(`${method} ${originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
}