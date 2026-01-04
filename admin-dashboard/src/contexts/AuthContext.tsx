import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface AdminUser extends User {
  role?: string;
  full_name?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Set timeout fallback (3 seconds)
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth loading timeout - no session detected');
        setLoading(false);
      }
    }, 3000);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      clearTimeout(timeoutId);
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user);
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      if (!isMounted) return;
      console.error('Error getting session:', err);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        setSession(session);
        if (session?.user) {
          await fetchUserRole(session.user);
        } else {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setUser(authUser);
        setIsAdmin(false);
      } else {
        const adminUser: AdminUser = {
          ...authUser,
          role: data.role,
          full_name: data.full_name
        };
        setUser(adminUser);
        setIsAdmin(data.role === 'admin');
      }
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      setUser(authUser);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Starting signIn with fetch bypass...');
    
    try {
      // Call Supabase token endpoint directly
      const response = await fetch(
        'https://mdymathlxreqjxoisqoa.supabase.co/auth/v1/token?grant_type=password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          },
          body: JSON.stringify({ email, password })
        }
      );
      
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (!response.ok) {
        console.error('❌ Auth failed:', data.error_description);
        return { error: new Error(data.error_description || 'Invalid credentials') };
      }
      
      if (data.access_token) {
        // Store token in localStorage manually
        localStorage.setItem('sb-access-token', data.access_token);
        localStorage.setItem('sb-refresh-token', data.refresh_token);
        
        console.log('✅ Token stored, user:', data.user?.email);
        
        // Set state directly (bypass SDK)
        const adminUser: AdminUser = {
          ...data.user,
          role: data.user?.user_metadata?.role || 'user'
        };
        
        setUser(adminUser);
        setSession({ ...data, expires_at: data.expires_at } as any);
        setIsAdmin(true); // Allow all auth users to admin for now
        setLoading(false);
        
        return { error: null };
      }
      
      return { error: new Error('No token in response') };
    } catch (err) {
      console.error('💥 Error:', err);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  const getToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAdmin,
      signIn,
      signOut,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
