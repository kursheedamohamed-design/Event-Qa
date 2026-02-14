
import React, { useState } from 'react';
import { X, ShieldCheck, LogIn, Loader2 } from 'lucide-react';
import { loginWithGoogle } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      onSuccess();
      onClose();
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-[3rem] p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 fade-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-all">
          <X size={20} />
        </button>

        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-100 mb-2">
            <ShieldCheck size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">User Access</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Login to shortlist your favorite vendors and plan the perfect celebration.
            </p>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-4 rounded-2xl font-black text-gray-700 hover:bg-gray-50 hover:border-indigo-200 transition-all active:scale-95 shadow-sm group"
          >
            {isLoading ? (
              <Loader2 className="animate-spin text-indigo-600" />
            ) : (
              <>
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" alt="Google" />
                <span>CONTINUE WITH GOOGLE</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Safe • Secure • No Password Needed
          </p>
        </div>
      </div>
    </div>
  );
};
