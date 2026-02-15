
import React, { useState } from 'react';
import { X, ShieldCheck, LogIn, Loader2, User as UserIcon, Briefcase, Mail, Lock, UserPlus, ArrowRight, Sparkles } from 'lucide-react';
import { loginWithGoogle, login, signup } from '../services/authService';
import { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user;
      if (mode === 'LOGIN') {
        user = await login(email, password);
      } else {
        if (!name.trim()) throw new Error("ദയവായി പേര് നൽകുക");
        if (password.length < 6) throw new Error("പാസ്‌വേഡിന് കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ വേണം");
        user = await signup(name, email, password, selectedRole);
      }
      onSuccess(user.role);
      onClose();
    } catch (err: any) {
      setError(err.message || "അഭ്യർത്ഥന പരാജയപ്പെട്ടു.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginWithGoogle(selectedRole);
      onSuccess(user.role);
      onClose();
    } catch (error) {
      setError('Google ലോഗിൻ പരാജയപ്പെട്ടു.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 overflow-y-auto py-10">
      <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 fade-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-all">
          <X size={20} />
        </button>

        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-100 transform -rotate-6 transition-transform hover:rotate-0">
            {mode === 'LOGIN' ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {mode === 'LOGIN' ? 'Welcome Back!' : 'Join Party Hub'}
            </h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest opacity-60">
              {mode === 'LOGIN' ? 'ലോഗിൻ ചെയ്യുക' : 'പുതിയ അക്കൗണ്ട് തുടങ്ങുക'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-red-100 animate-in shake duration-300">
                {error}
              </div>
            )}

            {mode === 'SIGNUP' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                 <div className="grid grid-cols-2 gap-3 mb-4">
                    <button 
                        type="button"
                        onClick={() => setSelectedRole(UserRole.USER)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === UserRole.USER ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 bg-gray-50'}`}
                    >
                        <UserIcon size={20} className={selectedRole === UserRole.USER ? 'text-indigo-600' : 'text-gray-400'} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">Parent</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setSelectedRole(UserRole.PARTNER)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === UserRole.PARTNER ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 bg-gray-50'}`}
                    >
                        <Briefcase size={20} className={selectedRole === UserRole.PARTNER ? 'text-indigo-600' : 'text-gray-400'} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">Partner</span>
                    </button>
                 </div>
                 
                 <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><UserIcon size={18} /></div>
                    <input 
                      type="text" 
                      placeholder="പേര് (Full Name)" 
                      className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                 </div>
              </div>
            )}

            <div className="space-y-4">
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></div>
                  <input 
                    type="email" 
                    placeholder="ഇമെയിൽ അഡ്രസ്" 
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
               </div>
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></div>
                  <input 
                    type="password" 
                    placeholder="പാസ്‌വേഡ്" 
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
               </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-5 rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-indigo-100 disabled:bg-gray-400"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <span className="text-xs tracking-widest uppercase">{mode === 'LOGIN' ? 'Login' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative py-2">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
             <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-white px-4 text-gray-300">OR</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 py-4 rounded-2xl font-bold border border-gray-100 transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
            <span className="text-[10px] tracking-widest uppercase">Continue with Google</span>
          </button>

          <div className="pt-4">
             <button 
              onClick={() => { setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setError(null); }}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
             >
               {mode === 'LOGIN' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
             </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={12} className="text-green-500" />
            Secure Authentication
          </div>
        </div>
      </div>
    </div>
  );
};
