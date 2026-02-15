
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Camera, Loader2, CheckCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { getCurrentUser, updateUserProfile, logout } from '../services/authService';
import { useLanguage } from '../LanguageContext';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState(getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  if (!user) {
    navigate('/');
    return null;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const updates: any = { name, email };
      if (password) updates.password = password;
      
      const updatedUser = await updateUserProfile(updates);
      setUser(updatedUser);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "അപ്‌ഡേറ്റ് പരാജയപ്പെട്ടു.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("നിങ്ങളുടെ അക്കൗണ്ട് ശാശ്വതമായി ഇല്ലാതാക്കണോ? ഈ പ്രവർത്തനം മാറ്റാൻ കഴിയില്ല.")) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 px-1 animate-in fade-in duration-500 text-left">
      <header className="mb-10 flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 text-gray-500 hover:text-indigo-600 bg-white shadow-sm border border-gray-100 rounded-full transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Manage your profile & security</p>
        </div>
      </header>

      <form onSubmit={handleUpdate} className="space-y-8">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-red-100">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-green-100 flex items-center gap-2">
            <CheckCircle size={16} /> പ്രൊഫൈൽ വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു!
          </div>
        )}

        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600">
             <User size={20} />
             <h2 className="text-xl font-bold text-gray-900">Personal Info</h2>
          </div>

          <div className="flex flex-col items-center gap-4 py-4">
             <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] border-4 border-indigo-50 overflow-hidden shadow-xl bg-gray-50">
                  <img src={user.avatar} className="w-full h-full object-cover" />
                </div>
                <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                  <Camera size={14} />
                </button>
             </div>
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Tap to change avatar</p>
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Display Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={18} /></div>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all"
                    required
                  />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all"
                    required
                  />
                  {user.emailVerified && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" title="Verified">
                      <ShieldCheck size={18} />
                    </div>
                  )}
                </div>
             </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600">
             <Lock size={20} />
             <h2 className="text-xl font-bold text-gray-900">Security</h2>
          </div>

          <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">New Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></div>
                <input 
                  type="password" 
                  placeholder="മാറ്റാൻ താല്പര്യമുണ്ടെങ്കിൽ മാത്രം നൽകുക"
                  className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
          </div>
        </section>

        <div className="pt-4 flex flex-col gap-4">
           <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-400"
           >
             {isLoading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} /> Update Profile</>}
           </button>

           <button 
            type="button"
            onClick={handleDeleteAccount}
            className="w-full py-4 bg-red-50 text-red-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
           >
             <Trash2 size={14} /> Delete Account
           </button>
        </div>
      </form>
    </div>
  );
};
