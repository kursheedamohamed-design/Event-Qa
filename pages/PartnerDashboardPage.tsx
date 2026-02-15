
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Layout, Image as ImageIcon, Loader2, MapPin, Plus, Trash2, Sparkles, Camera, User, Tag, CheckCircle, BarChart3, List, MessageSquare, PlusCircle } from 'lucide-react';
import { Partner, Category, PriceType, PartnerStatus, MenuItem, UserRole, AddOnService } from '../types.ts';
import { getMyPartnerProfile, updatePartner } from '../services/partnerService.ts';
import { QATAR_REGIONS } from '../constants.tsx';
import { optimizeImage } from '../services/imageService.ts';
import { optimizeDescription } from '../services/geminiService.ts';
import { getCurrentUser } from '../services/authService.ts';

export const PartnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

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

  const startingPrice = useMemo(() => {
    if (!partner || !partner.menu) return '0';
    const prices = partner.menu
      .map(item => parseInt(item.price))
      .filter(p => !isNaN(p) && p > 0);
    return prices.length > 0 ? Math.min(...prices).toString() : '0';
  }, [partner?.menu]);

  const addPriceItem = () => {
    if (!partner) return;
    const currentMenu = partner.menu || [];
    handleUpdate('menu', [...currentMenu, { name: '', price: '', thumbnail: '' }]);
  };

  const removePriceItem = (index: number) => {
    if (!partner) return;
    handleUpdate('menu', (partner.menu || []).filter((_, i) => i !== index));
  };

  const handlePriceItemUpdate = (index: number, field: keyof MenuItem, value: string) => {
    if (!partner) return;
    const updated = [...(partner.menu || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleUpdate('menu', updated);
  };

  const addAddOn = () => {
    if (!partner) return;
    const currentAddOns = partner.addOns || [];
    handleUpdate('addOns', [...currentAddOns, { name: '', price: '' }]);
  };

  const removeAddOn = (index: number) => {
    if (!partner) return;
    handleUpdate('addOns', (partner.addOns || []).filter((_, i) => i !== index));
  };

  const handleAddOnUpdate = (index: number, field: keyof AddOnService, value: string) => {
    if (!partner) return;
    const updated = [...(partner.addOns || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleUpdate('addOns', updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!partner) return;
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files) as File[];
      setIsProcessingImages(true);
      const processFiles = async () => {
        const optimizedBatch: string[] = [];
        for (const file of fileArray) {
          const reader = new FileReader();
          const optimized = await new Promise<string>((resolve) => {
            reader.onloadend = async () => {
              const result = await optimizeImage(reader.result as string, 1200, 1200, 0.7);
              resolve(result);
            };
            reader.readAsDataURL(file as Blob);
          });
          optimizedBatch.push(optimized);
        }
        handleUpdate('images', [...partner.images, ...optimizedBatch]);
        setIsProcessingImages(false);
      };
      processFiles();
    }
  };

  const handleAISuggest = async () => {
    if (!partner || !partner.name) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeDescription(partner.name, partner.category, partner.description);
      handleUpdate('description', optimized);
    } catch (err) {} finally {
      setIsOptimizing(false);
    }
  };

  const onSave = async () => {
    if (!partner) return;
    setIsSaving(true);
    await updatePartner(partner.id, {
      ...partner,
      price: startingPrice,
      status: PartnerStatus.PENDING // Send for re-review on big updates
    });
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Partner Dashboard</h1>
            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${partner.status === PartnerStatus.APPROVED ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${partner.status === PartnerStatus.APPROVED ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
              {partner.status}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Manage your profile and services</p>
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

      {/* Stats Summary */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 text-indigo-600 mb-4">
               <div className="p-2 bg-indigo-50 rounded-xl"><BarChart3 size={18} /></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Profile Views</span>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tighter">{partner.profileViews || 0}</div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 text-green-600 mb-4">
               <div className="p-2 bg-green-50 rounded-xl"><MessageSquare size={18} /></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">WhatsApp Inquiries</span>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tighter">{partner.whatsappClicks || 0}</div>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Identity & Bio */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 tracking-tight"><Layout size={20} className="text-indigo-600" /> Business Details</h3>
            <div className="space-y-4">
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Business Name</label>
                 <input type="text" value={partner.name} onChange={(e) => handleUpdate('name', e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">About Service</label>
                  <button type="button" onClick={handleAISuggest} disabled={isOptimizing} className="text-[9px] font-black text-indigo-600 flex items-center gap-1">
                    {isOptimizing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI REWRITE
                  </button>
                </div>
                <textarea rows={4} value={partner.description} onChange={(e) => handleUpdate('description', e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-medium text-sm" />
              </div>
            </div>
          </section>

          {/* Price Catalog Management */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 tracking-tight"><List size={20} className="text-indigo-600" /> Price Catalog</h3>
              <button onClick={addPriceItem} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100"><Plus size={18} /></button>
            </div>
            <div className="space-y-3">
               {(partner.menu || []).map((item, idx) => (
                 <div key={idx} className="flex gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                   <div className="flex-1">
                      <input type="text" placeholder="Service Name" className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-xs font-bold outline-none" value={item.name} onChange={(e) => handlePriceItemUpdate(idx, 'name', e.target.value)} />
                   </div>
                   <div className="w-24 relative">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[8px]">QAR</div>
                      <input type="text" placeholder="Price" className="w-full pl-8 pr-2 py-2 bg-white rounded-lg border border-gray-200 text-xs font-bold outline-none" value={item.price} onChange={(e) => handlePriceItemUpdate(idx, 'price', e.target.value)} />
                   </div>
                   <button onClick={() => removePriceItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                 </div>
               ))}
               {(partner.menu || []).length === 0 && (
                 <p className="text-center py-6 text-gray-400 text-xs font-bold uppercase tracking-widest italic">No prices listed yet.</p>
               )}
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Calculated Starting Price</span>
               <div className="text-indigo-600 font-black">QAR {startingPrice}</div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Portfolio Management */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 tracking-tight"><ImageIcon size={20} className="text-indigo-600" /> Portfolio</h3>
            <div className="grid grid-cols-3 gap-3">
              {(partner.images || []).map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button onClick={() => handleUpdate('images', partner.images.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all gap-1 group">
                {isProcessingImages ? <Loader2 size={20} className="text-indigo-400 animate-spin" /> : <Camera size={20} className="text-gray-300" />}
                <span className="text-[8px] font-black text-gray-400">ADD PHOTOS</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </section>

          {/* Optional Extras (Add-ons) */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 tracking-tight"><PlusCircle size={20} className="text-indigo-600" /> Optional Add-ons</h3>
                <button onClick={addAddOn} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100"><Plus size={18} /></button>
             </div>
             <div className="space-y-3">
               {(partner.addOns || []).map((addon, idx) => (
                 <div key={idx} className="flex gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                   <div className="flex-1">
                      <input type="text" placeholder="Extra Service" className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-xs font-bold outline-none" value={addon.name} onChange={(e) => handleAddOnUpdate(idx, 'name', e.target.value)} />
                   </div>
                   <div className="w-24 relative">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[8px]">QAR</div>
                      <input type="text" placeholder="Price" className="w-full pl-8 pr-2 py-2 bg-white rounded-lg border border-gray-200 text-xs font-bold outline-none" value={addon.price} onChange={(e) => handleAddOnUpdate(idx, 'price', e.target.value)} />
                   </div>
                   <button onClick={() => removeAddOn(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                 </div>
               ))}
             </div>
          </section>

          {/* Location & Visibility */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 tracking-tight"><MapPin size={20} className="text-indigo-600" /> Location</h3>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Primary Region</label>
              <select className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold outline-none" value={partner.location} onChange={e => handleUpdate('location', e.target.value)}>
                {QATAR_REGIONS.map(reg => <option key={reg} value={reg}>{reg}</option>)}
              </select>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
