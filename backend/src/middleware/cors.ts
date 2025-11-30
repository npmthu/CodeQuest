// CORS configuration middleware
import { Request, Response, NextFunction } from 'express';

const allowed = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);

export default function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  if (allowed.length === 0 || (origin && allowed.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin ?? '*');
  } else {
    res.header('Access-Control-Allow-Origin', 'null');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
}