// User controller - profile, settings, dashboard data
import { Request, Response } from 'express';
import * as userService from '../services/userService';

export async function listUsers(req: Request, res: Response) {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getUserHandler(req: Request, res: Response) {
  try {
    const user = await userService.getUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}