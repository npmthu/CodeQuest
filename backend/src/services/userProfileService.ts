import { supabaseAdmin } from '../config/database';

export class UserProfileService {
  // Ensure user profile exists (called during auth/signup)
  static async ensureUserProfile(authUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single();

      if (existingProfile) {
        // Profile already exists, just update last_login_at
        await supabaseAdmin
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', authUser.id);
        return;
      }

      // Create new profile
      const profileData = {
        id: authUser.id,
        email: authUser.email || null,
        display_name: authUser.user_metadata?.full_name || 
                       authUser.user_metadata?.display_name ||
                       authUser.email?.split('@')[0] || 
                       'User',
        role: authUser.user_metadata?.role || 'learner',
        level: 'Beginner',
        reputation: 0,
        is_active: true,
        metadata: authUser.user_metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin
        .from('users')
        .insert(profileData);

      if (error) {
        console.error('Error creating user profile:', error);
        throw new Error('Failed to create user profile');
      }

      console.log('✅ User profile created for:', authUser.id);
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
      throw error;
    }
  }

  // Update user's last login time
  static async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for non-critical operation
    }
  }

  // Get user role from profile
  static async getUserRole(userId: string): Promise<string> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return 'learner'; // Default role
      }

      return data.role;
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'learner'; // Default role
    }
  }

  // Update user reputation
  static async updateReputation(userId: string, reputationChange: number): Promise<void> {
    try {
      await supabaseAdmin.rpc('increment_reputation', {
        user_id: userId,
        change_amount: reputationChange
      });
    } catch (error) {
      console.error('Error updating reputation:', error);
      // Don't throw error for non-critical operation
    }
  }

  // Check if user has specific role
  static async hasRole(userId: string, requiredRole: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId);
      return userRole === requiredRole;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }
}
