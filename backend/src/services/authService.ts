import { supabaseAdmin } from '../config/database';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload) {
  const { email, password, fullName, role = 'learner' } = payload;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate password strength
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users.find(u => u.email === email);
    
    if (userExists) {
      throw new Error('User with this email already exists');
    }

    // Create auth user with role in metadata
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || email.split('@')[0],
        role
      },
      app_metadata: {
        role
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      throw new Error(authError.message || 'Failed to create auth user');
    }

    if (!authData?.user) {
      throw new Error('User creation failed - no user returned');
    }

    // Check if profile already exists (trigger may have created it)
    const { data: existingProfile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (existingProfile) {
      // Profile exists (created by trigger), update it with correct role
      const { data: userData, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          role,
          display_name: fullName || email.split('@')[0],
          email
        })
        .eq('id', authData.user.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('User profile update error:', updateError);
      }
      
      console.log('✅ Updated existing profile with role:', userData?.role);
      return { user: authData.user, profile: userData || existingProfile };
    }

    // Create user profile in users table
    const profileData = {
      id: authData.user.id,
      email,
      display_name: fullName || email.split('@')[0],
      role,
      level: 'Beginner',
      reputation: 0,
      is_active: true
    };
    
    console.log('📝 Creating profile with role:', role, 'Full data:', profileData);

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert(profileData)
      .select()
      .single();

    if (userError) {
      console.error('User profile creation error:', userError);
      // Cleanup: delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(userError.message || 'Failed to create user profile');
    }

    return { user: authData.user, profile: userData };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function loginUser(payload: LoginPayload) {
  const { email, password } = payload;

  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }

    if (!data?.user) {
      throw new Error('Login failed - no user returned');
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    return {
      session: data.session,
      user: data.user,
      profile
    };
  } catch (error: any) {
    console.error('Login service error:', error);
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
