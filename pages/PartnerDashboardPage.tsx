
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Layout, Image as ImageIcon, Loader2, MapPin, Plus, Trash2, Sparkles, Camera, User, Tag, CheckCircle, BarChart3, Users, MessageSquare } from 'lucide-react';
import { Partner, Category, PriceType, PartnerStatus, MenuItem, UserRole } from '../types.ts';
import { getMyPartnerProfile, updatePartner } from '../services/partnerService.ts';
import { QATAR_REGIONS } from '../constants.tsx';
import { optimizeImage } from '../services/imageService.ts';
import { getCurrentUser } from '../services/authService.ts';

export const PartnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!user || user.role !== UserRole.PARTNER) {
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
      <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Portal...</p>
    </div>
  );

  if (!partner) return null;

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700 text-left">
      <header className="sticky top-[64px] z-40 bg-gray-50/95 backdrop-blur-md py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{partner.name}</h1>
            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${partner.status === PartnerStatus.APPROVED ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${partner.status === PartnerStatus.APPROVED ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
              {partner.status}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Partner Dashboard • Verified: {partner.verified ? 'Yes' : 'No'}</p>
        </div>
        <button 
          onClick={onSave} 
          disabled={isSaving} 
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : showSuccess ? <CheckCircle size={16} /> : <Save size={16} />} 
          {isSaving ? 'UPDATING...' : showSuccess ? 'SAVED' : 'SAVE CHANGES'}
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 text-indigo-600 mb-4">
               <div className="p-2 bg-indigo-50 rounded-xl"><BarChart3 size={18} /></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Views</span>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tighter">{partner.profileViews || 0}</div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 text-green-600 mb-4">
               <div className="p-2 bg-green-50 rounded-xl"><MessageSquare size={18} /></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">WhatsApp Leads</span>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tighter">{partner.whatsappClicks || 0}</div>
         </div>
         <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-xl text-white">
            <div className="flex items-center gap-3 mb-4 opacity-80">
               <div className="p-2 bg-white/20 rounded-xl"><Sparkles size={18} /></div>
               <span className="text-[10px] font-black uppercase tracking-widest">Network Rank</span>
            </div>
            <div className="text-3xl font-black tracking-tighter">TOP 10%</div>
            <p className="text-[8px] uppercase tracking-widest mt-2 opacity-60">In {partner.category} category</p>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 tracking-tight"><Layout size={20} className="text-indigo-600" /> Identity Editor</h3>
          <div className="space-y-4">
            <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Business Name</label>
               <input type="text" value={partner.name} onChange={(e) => handleUpdate('name', e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold" />
            </div>
            <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Bio / Description</label>
               <textarea rows={4} value={partner.description} onChange={(e) => handleUpdate('description', e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-medium text-sm" />
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center text-center space-y-6">
           <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-300 transform rotate-12">
              <Users size={40} />
           </div>
           <div className="space-y-2">
              <h4 className="text-xl font-black text-gray-900 tracking-tight">Expand Your Reach</h4>
              <p className="text-gray-400 text-sm font-medium px-4">Partners with verified Instagram handles and multiple portfolio images get 3x more bookings.</p>
           </div>
           <button className="px-8 py-4 bg-gray-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-indigo-100 hover:bg-indigo-50 transition-colors">Improve Profile</button>
        </section>
      </div>
    </div>
  );
};
