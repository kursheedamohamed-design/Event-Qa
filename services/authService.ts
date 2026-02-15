
import { User, UserRole } from '../types';

const USER_SESSION_KEY = 'qatar_party_hub_session';
const USERS_DB_KEY = 'qatar_party_hub_users_db';

// Get all registered users from "database"
const getUsersDB = (): (User & { password?: string })[] => {
  const stored = localStorage.getItem(USERS_DB_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save a new user to "database"
const saveUserToDB = (user: User & { password?: string }) => {
  const users = getUsersDB();
  localStorage.setItem(USERS_DB_KEY, JSON.stringify([...users, user]));
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const signup = async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const users = getUsersDB();
  if (users.find(u => u.email === email)) {
    throw new Error("ഈ ഇമെയിൽ ഉപയോഗിച്ച് നിലവിൽ ഒരു അക്കൗണ്ട് ഉണ്ട്.");
  }

  const newUser: User = {
    id: 'u' + Math.random().toString(36).substr(2, 9),
    name,
    email,
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    favorites: []
  };

  // In a real app, we'd hash the password on the server
  saveUserToDB({ ...newUser, password });
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newUser));
  return newUser;
};

export const login = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const users = getUsersDB();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error("തെറ്റായ ഇമെയിൽ അല്ലെങ്കിൽ പാസ്‌വേഡ്.");
  }

  // Remove password before saving to session
  const { password: _, ...userSession } = user;
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userSession));
  return userSession as User;
};

export const loginWithGoogle = async (role: UserRole = UserRole.USER): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const mockUser: User = {
    id: 'g' + Math.random().toString(36).substr(2, 9),
    name: role === UserRole.PARTNER ? 'Business Owner' : 'Qatari Parent',
    email: 'google-user@example.com',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=google`,
    role: role,
    favorites: []
  };

  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(mockUser));
  return mockUser;
};

export const logout = (): void => {
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
  
  // Sync with DB
  const users = getUsersDB();
  const updatedUsers = users.map(u => u.id === user.id ? { ...u, favorites: user.favorites } : u);
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
  
  return user;
};
