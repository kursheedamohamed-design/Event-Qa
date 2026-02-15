
import React, { useState } from 'react';
import { X, ShieldCheck, LogIn, Loader2, User as UserIcon, Briefcase, Mail, Lock, UserPlus, ArrowRight, Sparkles, Check, Send } from 'lucide-react';
import { loginWithGoogle, login, signup, verifyEmailCode } from '../services/authService';
import { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'VERIFY';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'LOGIN') {
        const user = await login(email, password);
        onSuccess(user.role);
        onClose();
      } else if (mode === 'SIGNUP') {
        if (!name.trim()) throw new Error("ദയവായി നിങ്ങളുടെ പൂർണ്ണരൂപത്തിലുള്ള പേര് നൽകുക");
        if (password.length < 6) throw new Error("പാസ്‌വേഡിന് കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ വേണം");
        await signup(name, email, password, selectedRole);
        setMode('VERIFY');
      } else if (mode === 'VERIFY') {
        if (otpCode.length !== 6) throw new Error("ദയവായി 6 അക്ഷരങ്ങളുള്ള കോഡ് നൽകുക");
        const user = await verifyEmailCode(email, otpCode);
        onSuccess(user.role);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "അഭ്യർത്ഥന പരാജയപ്പെട്ടു.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Supabase OAuth initiates a redirect, so the UI will freeze/reload
      await loginWithGoogle(selectedRole);
    } catch (error: any) {
      setError(error.message || 'Google ലോഗിൻ പരാജയപ്പെട്ടു.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 overflow-y-auto py-10">
      <div className="absolute inset-0 bg-indigo-950/70 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 fade-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-all active:scale-90">
          <X size={20} />
        </button>

        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-indigo-600/20 rounded-[2.5rem] blur-xl animate-pulse" />
            <div className="relative w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-200 transform -rotate-6 transition-transform hover:rotate-0">
              {mode === 'LOGIN' ? <LogIn size={32} /> : mode === 'SIGNUP' ? <UserPlus size={32} /> : <Send size={32} />}
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {mode === 'LOGIN' ? 'Welcome Back!' : mode === 'SIGNUP' ? 'Join the Network' : 'Verify Email'}
            </h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest opacity-60">
              {mode === 'LOGIN' ? 'തുടരാൻ ലോഗിൻ ചെയ്യുക' : mode === 'SIGNUP' ? 'നിങ്ങളുടെ അക്കൗണ്ട് തുടങ്ങുക' : `കോഡ് ${email}-ലേക്ക് അയച്ചു`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-red-100 animate-in shake duration-300">
                {error}
              </div>
            )}

            {mode === 'VERIFY' ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
                 <div className="relative">
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="000000" 
                      className="w-full px-6 py-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-600 font-black text-3xl tracking-[0.5em] text-center transition-all"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                 </div>
                 <p className="text-[9px] text-gray-400 font-bold uppercase text-center leading-relaxed">
                   സ്പാം ഫോൾഡർ കൂടെ പരിശോധിക്കുക. <br/> (Tip: Simulation code is <span className="text-indigo-600">123456</span>)
                 </p>
              </div>
            ) : (
              <>
                {mode === 'SIGNUP' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-400">
                     <div className="grid grid-cols-2 gap-3 mb-2">
                        <button 
                            type="button"
                            onClick={() => setSelectedRole(UserRole.USER)}
                            className={`group p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden ${selectedRole === UserRole.USER ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100' : 'border-gray-100 bg-gray-50'}`}
                        >
                            {selectedRole === UserRole.USER && <div className="absolute top-2 right-2 text-indigo-600"><Check size={12} strokeWidth={4} /></div>}
                            <UserIcon size={24} className={selectedRole === UserRole.USER ? 'text-indigo-600' : 'text-gray-400'} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${selectedRole === UserRole.USER ? 'text-indigo-600' : 'text-gray-500'}`}>Parent</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setSelectedRole(UserRole.PARTNER)}
                            className={`group p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden ${selectedRole === UserRole.PARTNER ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100' : 'border-gray-100 bg-gray-50'}`}
                        >
                            {selectedRole === UserRole.PARTNER && <div className="absolute top-2 right-2 text-indigo-600"><Check size={12} strokeWidth={4} /></div>}
                            <Briefcase size={24} className={selectedRole === UserRole.PARTNER ? 'text-indigo-600' : 'text-gray-400'} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${selectedRole === UserRole.PARTNER ? 'text-indigo-600' : 'text-gray-500'}`}>Partner</span>
                        </button>
                     </div>
                     
                     <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><UserIcon size={18} /></div>
                        <input 
                          type="text" 
                          placeholder="പേര് (Full Name)" 
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-sm transition-all"
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
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-sm transition-all"
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
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-sm transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                   </div>
                </div>
              </>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-5 rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-indigo-100 disabled:bg-gray-400 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <span className="text-xs tracking-widest uppercase">
                    {mode === 'LOGIN' ? 'Login' : mode === 'SIGNUP' ? 'Create Account' : 'Verify Now'}
                  </span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {mode !== 'VERIFY' && (
            <>
              <div className="relative py-2">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                 <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-white px-4 text-gray-300">OR</span></div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 py-4 rounded-2xl font-bold border border-gray-100 transition-all active:scale-95 shadow-sm disabled:opacity-50 hover:bg-gray-50"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />}
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
            </>
          )}

          {mode === 'VERIFY' && (
            <div className="pt-2">
               <button 
                onClick={() => setMode('SIGNUP')}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
               >
                 Back to Signup
               </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={12} className="text-green-500" />
            Secured by Qatar Party Hub
          </div>
        </div>
      </div>
    </div>
  );
};
