
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Layout, Image as ImageIcon, Loader2, MapPin, Plus, Trash2, Sparkles, Camera, User, Tag, CheckCircle } from 'lucide-react';
import { Partner, Category, PriceType, PartnerStatus, MenuItem } from '../types.ts';
import { getMyPartnerProfile, updatePartner } from '../services/partnerService.ts';
import { QATAR_REGIONS } from '../constants.tsx';
import { optimizeImage } from '../services/imageService.ts';
import { optimizeDescription } from '../services/geminiService.ts';
import { useLanguage } from '../LanguageContext.tsx';
import { getCurrentUser } from '../services/authService.ts';

export const PartnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      const profile = await getMyPartnerProfile();
      if (!profile) {
        navigate('/list-service');
      } else {
        setPartner(profile);
      }
      setIsLoading(false);
    };
    loadData();
  }, [user, navigate]);

  const handleUpdate = (field: keyof Partner, value: any) => {
    if (partner) setPartner({ ...partner, [field]: value });
  };

  const onSave = async () => {
    if (!partner) return;
    setIsSaving(true);
    await updatePartner(partner.id, partner);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  if (isLoading) return (
    <div className="py-20 text-center">
      <Loader2 className="animate-spin mx-auto text-indigo-200" size={40} />
      <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
    </div>
  );

  if (!partner) return null;

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      <header className="sticky top-[64px] z-40 bg-gray-50/95 backdrop-blur-md py-6 flex justify-between items-center gap-4 border-b border-gray-100 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Manage Business</h1>
            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${partner.status === PartnerStatus.APPROVED ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${partner.status === PartnerStatus.APPROVED ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
              {partner.status}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Editing: {partner.name}</p>
        </div>
        <button 
          onClick={onSave} 
          disabled={isSaving} 
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-100 disabled:bg-gray-200 transition-all active:scale-95"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : showSuccess ? <CheckCircle size={16} /> : <Save size={16} />} 
          {isSaving ? 'UPDATING...' : showSuccess ? 'SAVED' : 'SAVE CHANGES'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-1">
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 tracking-tight"><Layout size={20} className="text-indigo-600" /> Identity</h3>
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
               <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden">
                 {partner.profilePhoto ? <img src={partner.profilePhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><User size={24} /></div>}
               </div>
               <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                    <input type="text" value={partner.name} onChange={(e) => handleUpdate('name', e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold" />
                  </div>
               </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 tracking-tight"><Tag size={20} className="text-indigo-600" /> Stats Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="text-indigo-600 font-black text-2xl tracking-tighter">{partner.profileViews || 0}</div>
                <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Profile Views</div>
              </div>
              <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
                <div className="text-green-600 font-black text-2xl tracking-tighter">{partner.whatsappClicks || 0}</div>
                <div className="text-[8px] font-black text-green-400 uppercase tracking-widest">WhatsApp Leads</div>
              </div>
            </div>
          </section>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="text-center py-10 space-y-4">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300"><Sparkles size={32} /></div>
             <h4 className="font-black text-gray-900 tracking-tight">Pro Features Coming Soon</h4>
             <p className="text-gray-400 text-xs font-medium px-10">Advanced analytics, priority placement, and direct bookings are on their way to help you grow your business in Qatar.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
