
import { User, UserRole } from '../types';
import { supabase } from './supabaseClient';

const USER_SESSION_KEY = 'qatar_party_hub_session';
const USERS_DB_KEY = 'qatar_party_hub_users_db';
const PENDING_ROLE_KEY = 'qatar_party_hub_pending_role';

const getUsersDB = (): (User & { password?: string })[] => {
  const stored = localStorage.getItem(USERS_DB_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveUserToDB = (user: User & { password?: string }) => {
  const users = getUsersDB();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex > -1) {
    users[existingIndex] = user;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } else {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify([...users, user]));
  }
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
};

/**
 * Synchronizes the Supabase session with the local application session.
 * This is called on app initialization to handle OAuth redirects.
 */
export const syncSupabaseSession = async (): Promise<User | null> => {
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const sbUser = session.user;
  const pendingRole = (localStorage.getItem(PENDING_ROLE_KEY) as UserRole) || UserRole.USER;

  // Map Supabase user to our internal User type
  const user: User = {
    id: sbUser.id,
    name: sbUser.user_metadata.full_name || sbUser.email?.split('@')[0] || 'Verified User',
    email: sbUser.email || '',
    avatar: sbUser.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sbUser.email}`,
    role: pendingRole,
    favorites: [],
    emailVerified: !!sbUser.email_confirmed_at
  };

  // Check if user exists in our local "DB" to preserve favorites etc if they were already there
  const db = getUsersDB();
  const existing = db.find(u => u.id === user.id || u.email === user.email);
  
  if (existing) {
    user.role = existing.role; // Keep existing role if they already had one
    user.favorites = existing.favorites;
  }

  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  saveUserToDB(user);
  localStorage.removeItem(PENDING_ROLE_KEY);
  
  return user;
};

export const signup = async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const users = getUsersDB();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("ഈ ഇമെയിൽ ഉപയോഗിച്ച് നിലവിൽ ഒരു അക്കൗണ്ട് ഉണ്ട്.");
  }

  const newUser: User = {
    id: 'u' + Math.random().toString(36).substr(2, 9),
    name,
    email: email.toLowerCase(),
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    favorites: [],
    emailVerified: false,
    isPendingVerification: true
  };

  saveUserToDB({ ...newUser, password });
  return newUser;
};

export const verifyEmailCode = async (email: string, code: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  if (code !== '123456') throw new Error("തെറ്റായ വെരിഫിക്കേഷൻ കോഡ്.");

  const users = getUsersDB();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (userIndex === -1) throw new Error("ഉപയോക്താവിനെ കണ്ടെത്താനായില്ല.");

  users[userIndex].emailVerified = true;
  users[userIndex].isPendingVerification = false;
  
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  
  const { password: _, ...userSession } = users[userIndex];
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userSession));
  return userSession as User;
};

export const login = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const users = getUsersDB();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (!user) {
    throw new Error("തെറ്റായ ഇമെയിൽ അല്ലെങ്കിൽ പാസ്‌വേഡ്. ദയവായി വീണ്ടും ശ്രമിക്കുക.");
  }

  const { password: _, ...userSession } = user;
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userSession));
  return userSession as User;
};

export const updateUserProfile = async (updates: Partial<User & { password?: string }>): Promise<User> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error("അനധികൃത പ്രവേശനം.");

  const users = getUsersDB();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex === -1) throw new Error("ഉപയോക്താവിനെ കണ്ടെത്താനായില്ല.");

  const updatedUser = { ...users[userIndex], ...updates };
  users[userIndex] = updatedUser;
  
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  
  const { password: _, ...userSession } = updatedUser;
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userSession));
  return userSession as User;
};

export const loginWithGoogle = async (role: UserRole = UserRole.USER): Promise<void> => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Please check your environment variables.");
  }

  // Store the intended role to set it correctly after the redirect
  localStorage.setItem(PENDING_ROLE_KEY, role);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    }
  });

  if (error) throw error;
};

export const logout = async (): Promise<void> => {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(USER_SESSION_KEY);
};

export const toggleFavorite = (vendorId: string): User | null => {
  const user = getCurrentUser();
  if (!user) return null;

  const index = user.favorites.indexOf(vendorId);
  if (index > -1) {
    user.favorites.splice(index, 1);
  } else {
    user.favorites.push(vendorId);
  }

  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  
  const users = getUsersDB();
  const updatedUsers = users.map(u => u.id === user.id ? { ...u, favorites: user.favorites } : u);
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
  
  return user;
};
