
import { User } from '../types';

const USER_KEY = 'qatar_party_hub_user';

/**
 * 🔐 AUTH CONNECTION:
 * ------------------
 * നിലവിൽ ഇത് ലോഗിൻ സിമുലേറ്റ് ചെയ്യുന്നു.
 * ഭാവിയിൽ supabase.auth.signInWithOAuth({ provider: 'google' }) 
 * ഉപയോഗിച്ച് ഇത് യഥാർത്ഥ ഗൂഗിൾ ലോഗിൻ ആക്കാം.
 */

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const loginWithGoogle = async (): Promise<User> => {
  // സിമുലേഷൻ ഡിലേ
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockUser: User = {
    id: 'u' + Math.random().toString(36).substr(2, 9),
    name: 'Qatari Parent',
    email: 'user@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    favorites: []
  };

  localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
  return mockUser;
};

export const logout = (): void => {
  localStorage.removeItem(USER_KEY);
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

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};
