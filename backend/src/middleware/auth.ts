import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/database';

export async function supabaseAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = String(req.headers.authorization || '');
    const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) return res.status(401).json({ success: false, error: 'Missing token' });

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ success: false, error: 'Invalid token' });

    // Attach minimal user object to request
    (req as any).user = {
      id: data.user.id,
      email: data.user.email,
      role: (data.user.user_metadata as any)?.role || 'learner',
    };
    next();
  } catch (err: any) {
    console.error('supabaseAuth error', err?.message ?? err);
    return res.status(500).json({ success: false, error: 'Auth check failed' });
  }
}
