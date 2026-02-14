
import React, { useState, useEffect } from 'react';
import { Smartphone, X, Download, Star } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const timer = setTimeout(() => {
      const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      
      if (!isStandalone && !isDismissed) {
        setIsVisible(true);
      }
    }, 60000); // Reduced to 60 seconds for better visibility after initial browse

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('To add this app to your home screen:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"');
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setTimeout(() => localStorage.removeItem('pwa_prompt_dismissed'), 3 * 24 * 60 * 60 * 1000); // Remind after 3 days
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[85px] left-3 right-3 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-indigo-50 flex flex-col gap-3 relative overflow-hidden">
        
        {/* Compact Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-gray-600 active:scale-90 transition-all z-10"
        >
          <X size={16} />
        </button>

        {/* Top Section: Icon & Text (Side-by-Side) */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100 flex-shrink-0">
            <Smartphone size={22} />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="text-sm font-black text-gray-900 leading-tight">Install Party Hub</h3>
            <p className="text-[10px] text-gray-500 font-medium leading-tight">
              Get instant access to top vendors.
            </p>
          </div>
        </div>

        {/* Bottom Section: Compact Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={handleInstallClick}
            className="flex-[2] bg-indigo-600 text-white py-2.5 rounded-xl font-black text-[11px] flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-100 active:scale-95 transition-all uppercase tracking-wider"
          >
            <Download size={14} /> Install Now
          </button>
          <button 
            onClick={handleDismiss}
            className="flex-1 py-2.5 bg-gray-50 text-gray-400 rounded-xl font-black text-[11px] active:scale-95 transition-all uppercase tracking-wider"
          >
            Later
          </button>
        </div>

        {/* Subtle Footer Decor */}
        <div className="flex items-center justify-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-[0.2em] opacity-70">
          <Star size={8} fill="currentColor" /> Offline Ready
        </div>
      </div>
    </div>
  );
};
