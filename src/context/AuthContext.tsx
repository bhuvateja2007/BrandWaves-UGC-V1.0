import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, PublicRole } from '../types';
import { api } from '../api/client';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { validatePublicRole, formatAuthError } from '../lib/authValidation';

interface SignUpOptions {
  role?: PublicRole;
  name?: string;
  handle?: string;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  isAdmin: boolean;
  isBrandAdmin: boolean;
  isBrandOwner: boolean;
  isCreator: boolean;
  isCustomer: boolean;
  isSupabaseMode: boolean;
  emailVerificationPending: boolean;
  onboardingCompleted: boolean;
  onboardingPersona: string | null;
  refreshOnboarding: () => Promise<void>;
  signUp: (
    email: string, 
    password: string, 
    name?: string, 
    handle?: string, 
    role?: PublicRole
  ) => Promise<{ success: boolean; needsVerification: boolean; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  switchUser: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailVerificationPending, setEmailVerificationPending] = useState<boolean>(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [onboardingPersona, setOnboardingPersona] = useState<string | null>(null);

  // Initialize auth state and subscribe to session changes
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session: initialSession }, error: sessionErr } = await supabase.auth.getSession();
          if (sessionErr) {
            console.warn('Supabase getSession notice:', sessionErr.message);
          }
          if (isMounted) {
            if (initialSession?.user) {
              await loadSupabaseUserProfile(initialSession.user);
            } else {
              setCurrentUser(null);
              setUsers([]);
            }
          }
        } else {
          // Local Dev / Mock API fallback (when Supabase is unconfigured)
          const [me, allUsers] = await Promise.all([
            api.getCurrentUser().catch(() => null),
            api.getUsers().catch(() => []),
          ]);
          if (isMounted) {
            setCurrentUser(me);
            setUsers(allUsers);
          }
        }
      } catch (err) {
        console.error('Failed to load auth user:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Setup Supabase live auth listener with deferred async handling
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            // Deferred non-blocking profile resolution
            setTimeout(() => {
              if (isMounted && newSession.user) {
                loadSupabaseUserProfile(newSession.user);
              }
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setEmailVerificationPending(false);
          setOnboardingCompleted(false);
          setOnboardingPersona(null);
          setLoading(false);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Resolves authoritative user profile from Supabase PostgreSQL
   * Guaranteed never to drop an active authenticated session even if profile query fails
   */
  const loadSupabaseUserProfile = async (sbUser: any): Promise<User> => {
    // 1. Determine baseline role from verified user_metadata allowlist
    let resolvedRole: UserRole = 'customer';
    if (sbUser.user_metadata?.role) {
      const validated = validatePublicRole(sbUser.user_metadata.role);
      resolvedRole = validated.role;
    }

    let profileData: any = null;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, role, created_at, updated_at')
        .eq('id', sbUser.id)
        .maybeSingle();

      if (error) {
        console.warn('Notice loading profile from Supabase (preserving authenticated session):', error.message);
      } else if (profile) {
        profileData = profile;
        // Authoritative database role resolution
        if (profile.role === 'admin') {
          resolvedRole = 'admin';
        } else if (profile.role === 'brand_owner' || profile.role === 'brand_admin') {
          resolvedRole = 'brand_owner';
        } else if (profile.role === 'customer') {
          resolvedRole = 'customer';
        } else if (profile.role === 'creator') {
          // If profile table holds legacy trigger default 'creator', but user metadata has explicit customer/brand_owner
          if (sbUser.user_metadata?.role && (sbUser.user_metadata.role === 'brand_owner' || sbUser.user_metadata.role === 'customer')) {
            resolvedRole = validatePublicRole(sbUser.user_metadata.role).role;
          } else {
            resolvedRole = 'creator';
          }
        }
      }
    } catch (e) {
      console.warn('Non-fatal error reading profile:', e);
    }

    const userObj: User = {
      id: sbUser.id,
      email: sbUser.email,
      name: profileData?.display_name || sbUser.user_metadata?.display_name || sbUser.user_metadata?.name || splitEmail(sbUser.email),
      handle: profileData?.handle || sbUser.user_metadata?.handle || `@${splitEmail(sbUser.email)}`,
      role: resolvedRole,
      roles: [resolvedRole],
      avatar: profileData?.avatar_url || sbUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      tier: profileData?.tier || (resolvedRole === 'admin' ? 'Platform Administrator' : 'Member'),
      bio: profileData?.bio || sbUser.user_metadata?.bio || '',
      accountStatus: profileData?.account_status || 'active',
      emailVerified: Boolean(sbUser.email_confirmed_at),
      phoneVerified: false,
    };

    setCurrentUser(userObj);
    setEmailVerificationPending(!sbUser.email_confirmed_at);

    // Attempt to load onboarding status without blocking session restoration
    try {
      await loadOnboardingStatus();
    } catch {
      setOnboardingCompleted(true);
    }

    return userObj;
  };

  /** Load the user's onboarding status from onboarding_preferences or mark completed */
  const loadOnboardingStatus = async () => {
    if (!isSupabaseConfigured) {
      setOnboardingCompleted(true);
      return;
    }
    try {
      const { data, error } = await supabase.rpc('get_my_onboarding_status');
      if (error || !data || data.length === 0) {
        // If RPC does not exist or table not populated, default to true to prevent redirect loops
        setOnboardingCompleted(true);
        return;
      }
      setOnboardingCompleted(Boolean(data[0].onboarding_completed));
      setOnboardingPersona(data[0].onboarding_persona ?? null);
    } catch {
      setOnboardingCompleted(true);
    }
  };

  function splitEmail(email?: string): string {
    if (!email) return 'User';
    return email.split('@')[0];
  }

  // --- Strict Email & Password Sign Up with Public Role Validation ---
  const signUp = async (
    email: string, 
    password: string, 
    name?: string, 
    handle?: string, 
    role: PublicRole = 'customer'
  ) => {
    try {
      setLoading(true);

      // Enforce strict public role allowlist
      const validatedRole = validatePublicRole(role).role;
      const displayName = name?.trim() || splitEmail(email);
      const userHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : `@${splitEmail(email)}`;

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              role: validatedRole, // Validated public role: customer | creator | brand_owner
              display_name: displayName,
              handle: userHandle,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        // If email confirmation is required by Supabase configuration
        if (data.user && !data.user.email_confirmed_at) {
          setEmailVerificationPending(true);
          return {
            success: true,
            needsVerification: true,
            message: `A verification link has been dispatched to ${email}. Please confirm your email to activate your account.`,
          };
        }

        if (data.user) {
          await loadSupabaseUserProfile(data.user);
        }

        return { success: true, needsVerification: false };
      }

      // Backend / local dev fallback registration
      const user = await api.registerUser({ 
        email: email.trim(), 
        name: displayName, 
        handle: userHandle 
      });
      // Override with validated role
      user.role = validatedRole;
      user.roles = [validatedRole];
      setCurrentUser(user);
      return { success: true, needsVerification: false };
    } catch (err: any) {
      console.error('Sign up error:', err);
      throw new Error(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // --- Strict Email & Password Sign In ---
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      setLoading(true);

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        if (!data.session || !data.user) {
          throw new Error('Authentication succeeded without a usable session.');
        }

        const resolvedUser = await loadSupabaseUserProfile(data.user);
        return { success: true, user: resolvedUser };
      }

      // Backend / Local Dev fallback
      const allUsers = await api.getUsers();
      const match = allUsers.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
      if (match) {
        const user = await api.switchUser(match.id);
        setCurrentUser(user);
        return { success: true, user };
      } else {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
        return { success: true, user };
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      return { success: false, error: formatAuthError(err) };
    } finally {
      setLoading(false);
    }
  };

  // --- Sign Out ---
  const signOut = async () => {
    try {
      setLoading(true);
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setCurrentUser(null);
      setEmailVerificationPending(false);
      setOnboardingCompleted(false);
      setOnboardingPersona(null);
      setLoading(false);
    }
  };

  // --- Password Reset Request ---
  const sendPasswordReset = async (email: string) => {
    if (!email || !email.trim()) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        return { 
          success: true, 
          message: `If an account with ${email} exists, password recovery instructions have been sent.` 
        };
      }
      return { 
        success: true, 
        message: `Recovery email dispatched to ${email}. Please check your inbox.` 
      };
    } catch (err: any) {
      console.error('Password reset error:', err);
      return { success: false, message: formatAuthError(err) };
    }
  };

  // --- Resend Verification Email ---
  const resendVerificationEmail = async (email: string) => {
    if (!email || !email.trim()) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        return { success: true, message: `Verification email resent to ${email}` };
      }
      return { success: true, message: `Verification email simulated for ${email}` };
    } catch (err: any) {
      console.error('Resend verification error:', err);
      return { success: false, message: formatAuthError(err) };
    }
  };

  // --- Profile Update (Guaranteed Non-Privileged Field Updates Only) ---
  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) throw new Error('Not authenticated');

    // SECURITY: Users cannot alter their role, account status, or id through profile updates
    // Only send columns that exist in public.profiles: display_name, avatar_url, updated_at
    const sanitizedProfileUpdates = {
      display_name: updates.name || currentUser.name,
      avatar_url: updates.avatar !== undefined ? updates.avatar : currentUser.avatar,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update(sanitizedProfileUpdates)
        .eq('id', currentUser.id);

      if (error) {
        console.warn('Notice updating profile columns:', error.message);
      }

      // Persist additional metadata (bio, handle, display_name) in auth user_metadata
      const metadataUpdates: Record<string, any> = {};
      if (updates.name) metadataUpdates.display_name = updates.name;
      if (updates.avatar !== undefined) metadataUpdates.avatar_url = updates.avatar;
      if (updates.bio !== undefined) metadataUpdates.bio = updates.bio;
      if (updates.handle !== undefined) metadataUpdates.handle = updates.handle;

      if (Object.keys(metadataUpdates).length > 0) {
        try {
          await supabase.auth.updateUser({
            data: metadataUpdates,
          });
        } catch (metaErr) {
          console.warn('Notice updating user metadata:', metaErr);
        }
      }

      const updatedUser: User = {
        ...currentUser,
        name: sanitizedProfileUpdates.display_name,
        avatar: sanitizedProfileUpdates.avatar_url || currentUser.avatar,
        bio: updates.bio !== undefined ? updates.bio : currentUser.bio,
        handle: updates.handle !== undefined ? updates.handle : currentUser.handle,
      };
      setCurrentUser(updatedUser);
      return updatedUser;
    }

    const updated = await api.updateProfile({
      ...updates,
      role: currentUser.role, // Preserves authoritative role
    });
    setCurrentUser(updated);
    return updated;
  };

  // --- Developer/Test User Switching (Gated to Local Fallback Only) ---
  const handleSwitchUser = async (userId: string) => {
    if (isSupabaseConfigured) {
      console.warn('User switching is disabled in production Supabase mode.');
      return;
    }
    try {
      setLoading(true);
      const switched = await api.switchUser(userId);
      setCurrentUser(switched);
    } catch (err) {
      console.error('Failed to switch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await loadSupabaseUserProfile(user);
    } else {
      const me = await api.getCurrentUser();
      setCurrentUser(me);
    }
  };

  const handleRefreshOnboarding = async () => {
    await loadOnboardingStatus();
  };

  // Verified role flags
  const isAdmin = Boolean(currentUser?.role === 'admin');
  const isBrandOwner = Boolean(
    currentUser?.role === 'brand_owner' || 
    currentUser?.role === 'brand_admin'
  );
  const isBrandAdmin = Boolean(isAdmin || isBrandOwner);
  const isCreator = Boolean(currentUser?.role === 'creator');
  const isCustomer = Boolean(
    currentUser?.role === 'customer' || 
    currentUser?.role === 'user' ||
    (!isAdmin && !isBrandOwner && !isCreator)
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        loading,
        isAdmin,
        isBrandAdmin,
        isBrandOwner,
        isCreator,
        isCustomer,
        isSupabaseMode: isSupabaseConfigured,
        emailVerificationPending,
        onboardingCompleted,
        onboardingPersona,
        refreshOnboarding: handleRefreshOnboarding,
        signUp,
        signIn,
        signOut,
        sendPasswordReset,
        resendVerificationEmail,
        updateProfile,
        switchUser: handleSwitchUser,
        refreshUser: handleRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
