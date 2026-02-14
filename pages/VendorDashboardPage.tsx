
import React, { useState, useEffect, useMemo } from 'react';
import { Save, Layout, Image as ImageIcon, Loader2, MapPin, Plus, Trash2, Sparkles, Camera, Instagram, User, List, Tag, CheckCircle, Facebook, Globe, MessageCircle } from 'lucide-react';
import { Vendor, Category, PriceType, VendorStatus, MenuItem } from '../types.ts';
import { getVendors, updateVendor } from '../services/vendorService.ts';
import { QATAR_REGIONS } from '../constants.tsx';
import { optimizeImage } from '../services/imageService.ts';
import { optimizeDescription } from '../services/geminiService.ts';
import { useLanguage } from '../LanguageContext.tsx';
import { InstagramImportModal } from '../components/InstagramImportModal.tsx';

export const VendorDashboardPage: React.FC = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isProcessingProfile, setIsProcessingProfile] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isInstaModalOpen, setIsInstaModalOpen] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState('');

  const MAX_PHOTOS = 5;
  const MAX_PRICE_ITEMS = 10;

  // Fix: Handle async getVendors call
  useEffect(() => {
    const loadData = async () => {
      const all = await getVendors();
      if (all.length > 0) {
        const v = all[0];
        setVendor(v);
        setKeywordsInput(v.keywords?.join(', ') || '');
      }
    };
    loadData();
  }, []);

  const startingPrice = useMemo(() => {
    if (!vendor || !vendor.menu) return '0';
    const prices = vendor.menu
      .map(item => parseInt(item.price))
      .filter(p => !isNaN(p) && p > 0);
    return prices.length > 0 ? Math.min(...prices).toString() : '0';
  }, [vendor?.menu]);

  const handleUpdate = (field: keyof Vendor, value: any) => {
    if (vendor) setVendor({ ...vendor, [field]: value });
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingProfile(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const optimized = await optimizeImage(reader.result as string, 400, 400, 0.8);
        handleUpdate('profilePhoto', optimized);
        setIsProcessingProfile(false);
      };
      reader.readAsDataURL(file as Blob);
    }
  };

  const handlePriceItemUpdate = (index: number, field: keyof MenuItem, value: string) => {
    if (!vendor) return;
    const updated = [...(vendor.menu || [])];
    const cleanedValue = field === 'price' ? value.replace(/[^0-9]/g, '') : value;
    updated[index] = { ...updated[index], [field]: cleanedValue };
    handleUpdate('menu', updated);
  };

  const addPriceItem = () => {
    if (!vendor) return;
    const currentMenu = vendor.menu || [];
    if (currentMenu.length < MAX_PRICE_ITEMS) {
      handleUpdate('menu', [...currentMenu, { name: '', price: '', thumbnail: '' }]);
    }
  };

  const removePriceItem = (index: number) => {
    if (!vendor) return;
    handleUpdate('menu', (vendor.menu || []).filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!vendor) return;
    const files = e.target.files;
    if (files) {
      const remainingSlots = MAX_PHOTOS - vendor.images.length;
      if (remainingSlots <= 0) return;
      const fileArray = Array.from(files).slice(0, remainingSlots) as File[];
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
        handleUpdate('images', [...vendor.images, ...optimizedBatch]);
        setIsProcessingImages(false);
      };
      processFiles();
    }
  };

  const handleInstagramImport = (images: string[]) => {
    if (!vendor) return;
    const remainingSlots = MAX_PHOTOS - vendor.images.length;
    const toAdd = images.slice(0, remainingSlots);
    handleUpdate('images', [...vendor.images, ...toAdd]);
  };

  const handleAISuggest = async () => {
    if (!vendor || !vendor.name) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeDescription(vendor.name, vendor.category, vendor.description);
      handleUpdate('description', optimized);
    } catch (err) {} finally {
      setIsOptimizing(false);
    }
  };

  const onSave = async () => {
    if (!vendor) return;
    setIsSaving(true);
    const finalKeywords = keywordsInput.split(',').map(k => k.trim()).filter(k => k !== '');
    const finalVendor = {
      ...vendor,
      price: startingPrice,
      services: (vendor.menu || []).map(m => m.name).filter(n => n.trim()),
      keywords: finalKeywords,
      status: VendorStatus.PENDING 
    };
    updateVendor(vendor.id, finalVendor);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  if (!vendor) return <div className="p-10 text-center font-bold text-gray-400 uppercase tracking-widest text-xs">Accessing Portal...</div>;

  const isPhotographer = vendor.category === Category.PHOTOGRAPHER;
  const isApproved = vendor.status === VendorStatus.APPROVED;

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      <header className="sticky top-[64px] z-40 bg-gray-50/95 backdrop-blur-md py-6 flex justify-between items-center gap-4 border-b border-gray-100 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Partner Portal</h1>
            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${isApproved ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
              {vendor.status}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Manage your presence in Qatar</p>
        </div>
        <button 
          onClick={onSave} 
          disabled={isSaving} 
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:bg-gray-200"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : showSuccess ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />} 
          {isSaving ? 'UPDATING...' : showSuccess ? 'SAVED' : 'SAVE CHANGES'}
        </button>
      </header>

      {showSuccess && (
        <div className="bg-green-50 border border-green-100 text-green-700 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle size={20} /> Changes submitted! Our team will review and update your status shortly.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-1">
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 tracking-tight"><Layout className="w-5 h-5 text-indigo-600" /> Identity</h3>
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
               <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                    {isProcessingProfile ? <Loader2 size={20} className="text-indigo-400 animate-spin" /> : vendor.profilePhoto ? <img src={vendor.profilePhoto} className="w-full h-full object-cover" /> : <User size={24} className="text-gray-300" />}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Camera size={14} /><input type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
                  </label>
               </div>
               <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Service Category</label>
                    <select className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold outline-none" value={vendor.category} onChange={e => handleUpdate('category', e.target.value as Category)}>
                      {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                    <input type="text" value={vendor.name} onChange={(e) => handleUpdate('name', e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold" />
                  </div>
               </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">About your service</label>
                <button type="button" onClick={handleAISuggest} disabled={isOptimizing} className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-indigo-100 transition-colors">
                  {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI IMPROVE
                </button>
              </div>
              <textarea rows={4} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold text-sm" value={vendor.description} onChange={e => handleUpdate('description', e.target.value)} />
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 tracking-tight"><List size={20} className="text-indigo-600" /> Price Catalog</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest">Offerings (Max {MAX_PRICE_ITEMS})</label>
                  {(vendor.menu || []).length < MAX_PRICE_ITEMS && (
                    <button type="button" onClick={addPriceItem} className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all">
                      <Plus size={12} /> ADD ITEM
                    </button>
                  )}
               </div>
               <div className="space-y-3">
                 {(vendor.menu || []).map((item, idx) => (
                   <div key={idx} className="flex gap-2 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 relative group/item">
                     <div className="flex-1">
                        <input type="text" placeholder="e.g. 1kg Cake" className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-xs font-bold outline-none" value={item.name} onChange={(e) => handlePriceItemUpdate(idx, 'name', e.target.value)} />
                     </div>
                     <div className="w-24 relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[8px]">QAR</div>
                        <input type="text" inputMode="numeric" placeholder="0.00" className="w-full pl-8 pr-2 py-2 bg-white rounded-lg border border-gray-200 text-xs font-bold outline-none" value={item.price} onChange={(e) => handlePriceItemUpdate(idx, 'price', e.target.value)} />
                     </div>
                     <button type="button" onClick={() => removePriceItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                   </div>
                 ))}
               </div>
            </div>
            <div className={`grid ${isPhotographer ? 'grid-cols-2' : 'grid-cols-1'} gap-4 pt-4 border-t border-gray-100`}>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Live Starting Price</label>
                  <div className="w-full px-5 py-4 bg-indigo-50 rounded-2xl border border-indigo-100 font-black text-indigo-600 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Tag size={14} /> QAR {startingPrice}</div>
                    <span className="text-[8px] opacity-40">AUTO</span>
                  </div>
                </div>
                {isPhotographer && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rate Basis</label>
                    <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 h-[58px]">
                      {Object.values(PriceType).map(t => (
                        <button key={t} type="button" onClick={() => handleUpdate('priceType', t)} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${vendor.priceType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>{t === PriceType.HOURLY ? 'Hourly' : 'Session'}</button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 tracking-tight"><ImageIcon className="w-5 h-5 text-indigo-600" /> Portfolio</h3>
              <button 
                type="button" 
                onClick={() => setIsInstaModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-[#f09433] to-[#bc1888] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all"
              >
                <Instagram size={14} /> Sync Instagram
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {vendor.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleUpdate('images', vendor.images.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                </div>
              ))}
              {vendor.images.length < MAX_PHOTOS && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all gap-1 group">
                  {isProcessingImages ? <Loader2 size={20} className="text-indigo-400 animate-spin" /> : <Camera size={20} className="text-gray-300" />}
                  <span className="text-[8px] font-black text-gray-400">UPLOAD</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </section>

          {/* Social Presence Section (NEW) */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 tracking-tight"><Globe size={20} className="text-indigo-600" /> Social Presence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Instagram</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-600"><Instagram size={16} /></div>
                    <input type="text" className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-xs outline-none focus:ring-1 focus:ring-pink-500" value={vendor.instagram || ''} onChange={e => handleUpdate('instagram', e.target.value)} placeholder="@handle" />
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Facebook</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><Facebook size={16} /></div>
                    <input type="text" className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-xs outline-none focus:ring-1 focus:ring-blue-500" value={vendor.facebook || ''} onChange={e => handleUpdate('facebook', e.target.value)} placeholder="facebook.com/page" />
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">TikTok</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900"><MessageCircle size={16} /></div>
                    <input type="text" className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-xs outline-none focus:ring-1 focus:ring-gray-900" value={vendor.tiktok || ''} onChange={e => handleUpdate('tiktok', e.target.value)} placeholder="@tiktok_id" />
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Website</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600"><Globe size={16} /></div>
                    <input type="text" className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-xs outline-none focus:ring-1 focus:ring-indigo-500" value={vendor.website || ''} onChange={e => handleUpdate('website', e.target.value)} placeholder="www.domain.com" />
                  </div>
               </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-indigo-600 tracking-tight"><MapPin size={20} className="fill-current" /> Visibility</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Location</label>
                <select className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold outline-none" value={vendor.location} onChange={e => handleUpdate('location', e.target.value)}>
                  {QATAR_REGIONS.map(reg => <option key={reg} value={reg}>{reg}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Search Tags (Comma separated)</label>
                <textarea rows={2} className="w-full px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold text-xs" value={keywordsInput} onChange={e => setKeywordsInput(e.target.value)} placeholder="e.g. Party Cake Doha, Luxury Events Qatar..." />
              </div>
            </div>
          </section>
        </div>
      </div>
      <InstagramImportModal 
        isOpen={isInstaModalOpen} 
        onClose={() => setIsInstaModalOpen(false)} 
        onImport={handleInstagramImport} 
      />
    </div>
  );
};
