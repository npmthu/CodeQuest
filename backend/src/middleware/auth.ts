import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: string;
  };
}

export async function supabaseAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = String(req.headers.authorization || '');
    const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) return res.status(401).json({ success: false, error: 'Missing token' });

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ success: false, error: 'Invalid token' });

    // Fetch user role from database (source of truth)
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    // Attach minimal user object to request
    (req as AuthRequest).user = {
      id: data.user.id,
      email: data.user.email,
      role: profile?.role || 'learner',
    };
    next();
  } catch (err: any) {
    console.error('supabaseAuth error', err?.message ?? err);
    return res.status(500).json({ success: false, error: 'Auth check failed' });
  }
}
