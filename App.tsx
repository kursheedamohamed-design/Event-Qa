
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutGrid, Heart, User, LogOut, Briefcase, LogIn, Settings } from 'lucide-react';
import { HomePage } from './pages/HomePage.tsx';
import { CategoryPage } from './pages/CategoryPage.tsx';
import { PartnerProfilePage } from './pages/PartnerProfilePage.tsx';
import { PartnerFormPage } from './pages/PartnerFormPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { PartnerDashboardPage } from './pages/PartnerDashboardPage.tsx';
import { UserDashboardPage } from './pages/UserDashboardPage.tsx';
import { ShortlistPage } from './pages/ShortlistPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { InstallPrompt } from './components/InstallPrompt.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { getCurrentUser, logout } from './services/authService.ts';
import { User as UserType, UserRole } from './types.ts';
import { LanguageProvider, useLanguage } from './LanguageContext.tsx';

const BottomNav: React.FC<{ user: UserType | null }> = ({ user }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useLanguage();

  const isPartner = user?.role === UserRole.PARTNER;

  const navItems = [
    { label: t('home'), icon: Home, path: '/' },
    { label: t('browse'), icon: LayoutGrid, path: '/category/All' },
    { 
      label: isPartner ? 'Portal' : 'Saved', 
      icon: isPartner ? Briefcase : Heart, 
      path: isPartner ? '/partner-dashboard' : '/saved' 
    },
    { 
      label: 'Me', 
      icon: User, 
      path: user ? (isPartner ? '/partner-dashboard' : '/my-profile') : '/list-service' 
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-3 z-50 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
        const Icon = item.icon;
        return (
          <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}>
            <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

const AppContent: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(getCurrentUser());
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { 
    window.scrollTo(0, 0); 
    setUser(getCurrentUser());
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  const handleLoginSuccess = (role: UserRole) => {
    const updatedUser = getCurrentUser();
    setUser(updatedUser);
    
    if (role === UserRole.PARTNER) {
      navigate('/partner-dashboard');
    } else {
      navigate('/my-profile');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-left">
      <InstallPrompt />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={handleLoginSuccess} 
      />
      
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:rotate-12 transition-transform">Q</div>
            <span className="font-bold text-lg tracking-tight">{t('appName')}</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link to="/" className="hover:text-indigo-600">{t('home')}</Link>
              {user?.role === UserRole.PARTNER ? (
                <Link to="/partner-dashboard" className="hover:text-indigo-600 font-bold text-indigo-600">Partner Portal</Link>
              ) : (
                <>
                  <Link to="/saved" className="hover:text-indigo-600">{t('saved')}</Link>
                  {!user && <Link to="/list-service" className="hover:text-indigo-600 font-bold text-indigo-600">List Your Service</Link>}
                </>
              )}
              
              {!user ? (
                <button onClick={() => setIsLoginOpen(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold tracking-tight">Login</button>
              ) : (
                <div className="flex items-center gap-4 bg-gray-50 pl-4 pr-2 py-1.5 rounded-2xl border border-gray-100">
                  <Link to={user.role === UserRole.PARTNER ? "/partner-dashboard" : "/my-profile"} className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform">
                    <img src={user.avatar} className="w-full h-full object-cover" />
                  </Link>
                  <Link to="/settings" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Settings size={18} /></Link>
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
                </div>
              )}
            </div>
            
            <div className="md:hidden">
               {!user && (
                 <button onClick={() => setIsLoginOpen(true)} className="p-2 text-indigo-600"><LogIn size={20} /></button>
               )}
               {user && (
                 <Link to="/settings" className="p-2 text-indigo-600"><Settings size={20} /></Link>
               )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 mb-16 md:mb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/partner/:id" element={<PartnerProfilePage />} />
          <Route path="/list-service" element={<PartnerFormPage />} />
          <Route path="/partner-dashboard" element={<PartnerDashboardPage />} />
          <Route path="/my-profile" element={<UserDashboardPage />} />
          <Route path="/saved" element={<ShortlistPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <BottomNav user={user} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
};
