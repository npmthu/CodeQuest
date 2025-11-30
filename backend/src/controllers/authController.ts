import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/database';
import * as authService from '../services/authService';

export async function registerHandler(req: Request, res: Response) {
  try {
    console.log('📝 Registration request:', { 
      email: req.body.email, 
      role: req.body.role,
      hasPassword: !!req.body.password,
      hasFullName: !!req.body.fullName
    });

    const { email, password, fullName, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const result = await authService.registerUser({ email, password, fullName, role });
    
    console.log('✅ Registration successful:', result.user.email);

    return res.status(201).json({ 
      success: true, 
      data: result,
      message: 'User registered successfully' 
    });
  } catch (error: any) {
    console.error('❌ Registration failed:', error.message);
    return res.status(400).json({ 
      success: false, 
      error: error.message || 'Registration failed' 
    });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const result = await authService.loginUser({ email, password });
    
    return res.json({ 
      success: true, 
      data: result,
      message: 'Login successful' 
    });
  } catch (error: any) {
    return res.status(401).json({ 
      success: false, 
      error: error.message || 'Login failed' 
    });
  }
}

export async function meHandler(req: Request, res: Response) {
  try {
    // If middleware attached user, return it
    const maybeUser = (req as any).user;
    if (maybeUser) {
      // Also fetch profile
      const profile = await authService.getUserProfile(maybeUser.id);
      return res.json({ 
        success: true, 
        data: { user: maybeUser, profile } 
      });
    }

    const header = String(req.headers.authorization || '');
    const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Missing token' 
      });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }

    const profile = await authService.getUserProfile(data.user.id);
    return res.json({ 
      success: true, 
      data: { user: data.user, profile } 
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

export async function logoutHandler(req: Request, res: Response) {
  return res.json({ 
    success: true, 
    message: 'Please call supabase.auth.signOut() on the client' 
  });
}

