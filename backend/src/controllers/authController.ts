// Authentication controller - register, login, logout, password reset
import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/database';

export async function meHandler(req: Request, res: Response) {
  // If middleware attached user, return it; otherwise try to verify token from header
  const maybeUser = (req as any).user;
  if (maybeUser) return res.json({ success: true, data: maybeUser });

  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ success: false, error: 'Missing token' });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ success: false, error: 'Invalid token' });

  return res.json({ success: true, data: data.user });
}

export async function logoutHandler(req: Request, res: Response) {
  // For Supabase auth we can accept client to call signOut; server-side we can revoke a session if needed
  return res.json({ success: true, message: 'Client should call supabase.auth.signOut()' });
}

