// Global error handler middleware
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  const status = err?.status || 500;
  const message = err?.message || 'Internal server error';
  res.status(status).json({ success: false, error: message });
}