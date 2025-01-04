import { supabase } from '../supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name,
    image: user.user_metadata?.avatar_url,
  };
}

export async function signIn(email: string, password: string): Promise<User> {
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !user) {
    throw error || new Error('Failed to sign in');
  }

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name,
    image: user.user_metadata?.avatar_url,
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateProfile(updates: Partial<User>): Promise<User> {
  const { data: { user }, error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error || !user) {
    throw error || new Error('Failed to update profile');
  }

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name,
    image: user.user_metadata?.avatar_url,
  };
} 