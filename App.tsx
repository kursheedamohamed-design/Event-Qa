
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Heart, User, LogOut } from 'lucide-react';
import { HomePage } from './pages/HomePage.tsx';
import { CategoryPage } from './pages/CategoryPage.tsx';
import { VendorProfilePage } from './pages/VendorProfilePage.tsx';
import { VendorFormPage } from './pages/VendorFormPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { VendorDashboardPage } from './pages/VendorDashboardPage.tsx';
import { ShortlistPage } from './pages/ShortlistPage.tsx';
import { InstallPrompt } from './components/InstallPrompt.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { getCurrentUser, logout } from './services/authService.ts';
import { User as UserType } from './types.ts';
import { LanguageProvider, useLanguage } from './LanguageContext.tsx';

const BottomNav: React.FC<{ isUser: boolean }> = ({ isUser }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useLanguage();

  const navItems = [
    { label: t('home'), icon: Home, path: '/' },
    { label: t('browse'), icon: LayoutGrid, path: '/category/All' },
    { label: t('saved'), icon: Heart, path: '/saved' },
    ...(!isUser ? [{ label: t('portal'), icon: User, path: '/vendor-dashboard' }] : []),
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-3 z-50 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}
          >
            <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

const AppContent: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<UserType | null>(getCurrentUser());
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = '#/';
  };

  const isUser = !!user;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-left">
      <InstallPrompt />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={() => setUser(getCurrentUser())} 
      />
      
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:rotate-12 transition-transform">
              Q
            </div>
            <span className="font-bold text-lg tracking-tight">{t('appName')}</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link to="/" className="hover:text-indigo-600">{t('home')}</Link>
              <Link to="/saved" className="hover:text-indigo-600">{t('saved')}</Link>
              {!isUser && (
                <Link to="/vendor-dashboard" className="hover:text-indigo-600 font-bold text-indigo-600">{t('vendorPortal')}</Link>
              )}
              
              {!user ? (
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
                  {t('parentLogin')}
                </button>
              ) : (
                <div className="flex items-center gap-4 bg-gray-50 pl-4 pr-2 py-1.5 rounded-2xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-500">{t('hiParent')}</span>
                  <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                  </div>
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              {!user ? (
                <button onClick={() => setIsLoginOpen(true)} className="p-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                  {t('portal')}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-indigo-100 shadow-sm">
                     <img src={user.avatar} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 mb-16 md:mb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/vendor/:id" element={<VendorProfilePage />} />
          <Route path="/list-service" element={<VendorFormPage />} />
          <Route path="/vendor-dashboard" element={<VendorDashboardPage />} />
          <Route path="/saved" element={<ShortlistPage />} />
          <Route path="/admin" element={isAdmin ? <AdminPage /> : <HomePage />} />
        </Routes>
      </main>

      <BottomNav isUser={isUser} />

      <footer className="bg-white border-t border-gray-100 py-10 pb-32 md:pb-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-bold text-xl mb-2 text-gray-900">{t('appName')}</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            The premium marketplace for all celebrations in Qatar.
          </p>
          <div className="flex justify-center gap-6 text-sm font-medium text-gray-400 mb-8">
            <Link to="/" className="hover:text-indigo-600">{t('home')}</Link>
            <Link to="/saved" className="hover:text-indigo-600">{t('saved')}</Link>
            <Link to="/list-service" className="hover:text-indigo-600">{t('listServiceFree')}</Link>
          </div>
          
          <div className="pt-8 border-t border-gray-50 flex flex-col items-center gap-4">
            <p className="text-xs text-gray-300 font-medium">© {new Date().getFullYear()} {t('appName')}.</p>
            <button 
              onClick={() => setIsAdmin(!isAdmin)}
              className="text-[10px] text-gray-200 hover:text-indigo-200 transition-colors uppercase tracking-[0.3em] font-black"
            >
              {t('systemAccess')}
            </button>
          </div>
        </div>
      </footer>
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
