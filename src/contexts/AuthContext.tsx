import React, { createContext, useContext, useEffect, useState } from 'react';
import { signIn as apiSignIn, signOut as apiSignOut, getUserProfile, getCurrentUser, supabase } from '../services/supabase';
import { UserProfile } from '../types/database';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Start with true for initial auth check
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setLoading(false); // Set loading false immediately when user is found
          
          // Fetch profile in background
          const { data: profileData, error: profileError } = await getUserProfile(currentUser.id);
          if (profileError) {
            setError(String(profileError));
          } else if (profileData) {
            setProfile(profileData);
          }
        } else {
          setLoading(false); // No user found, stop loading
        }
      } catch (err) {
        // Error checking user authentication
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setLoading(false); // Set loading false immediately
        
        // Try to fetch profile in background (don't block UI)
        getUserProfile(session.user.id).then(({ data: profileData, error: profileError }) => {
          if (profileError) {
            setError(String(profileError));
          } else if (profileData) {
            setProfile(profileData);
          }
        }).catch(err => {
          // Error fetching user profile
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      
      const { data, error } = await apiSignIn(email, password);
      
      if (error) {
        return { data: null, error };
      }
      
      if (data?.user) {
        setUser(data.user);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await getUserProfile(data.user.id);
        if (profileError) {
          setError(String(profileError));
        } else if (profileData) {
          setProfile(profileData);
        }
      }
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      return { data: null, error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    await apiSignOut();
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
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
