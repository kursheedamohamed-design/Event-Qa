
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, CheckCircle, Loader2, Plus, Trash2, Instagram, Hash, User, List, Tag, Facebook, Globe, MessageCircle } from 'lucide-react';
import { Category, PriceType, MenuItem } from '../types.ts';
import { QATAR_REGIONS } from '../constants.tsx';
import { saveVendor } from '../services/vendorService.ts';
import { optimizeDescription } from '../services/geminiService.ts';
import { optimizeImage } from '../services/imageService.ts';
import { useLanguage } from '../LanguageContext.tsx';
import { InstagramImportModal } from '../components/InstagramImportModal.tsx';

const CATEGORY_EXAMPLES: Record<Category, { name: string, price: string, desc: string, keywords: string, itemPlaceholder: string }> = {
  [Category.HOME_BAKER]: {
    name: "e.g. Aisha's Sweet Crumbs",
    price: "350",
    desc: "Bespoke cakes and dessert tables for magical birthdays.",
    keywords: "Birthday Cake Doha, Custom Cakes Qatar",
    itemPlaceholder: "e.g. 1kg Chocolate Cake"
  },
  [Category.PHOTOGRAPHER]: {
    name: "e.g. Joyful Clicks Photography",
    price: "750",
    desc: "Candid and posed photography for birthday celebrations.",
    keywords: "Birthday Photographer Qatar, Kids Photography",
    itemPlaceholder: "e.g. 2-Hour Coverage"
  },
  [Category.HENNA_ARTIST]: {
    name: "e.g. Henna by Noor",
    price: "100",
    desc: "Beautiful traditional and modern henna designs.",
    keywords: "Henna Artist Qatar, Kids Henna Party",
    itemPlaceholder: "e.g. Full Hand Design"
  },
  [Category.PERFORMER]: {
    name: "e.g. Magic Max & Crew",
    price: "600",
    desc: "Professional magic shows and interactive balloon art.",
    keywords: "Magician Doha, Birthday Performer",
    itemPlaceholder: "e.g. 45-Min Magic Show"
  },
  [Category.DECORATOR]: {
    name: "e.g. Dream Themes Qatar",
    price: "800",
    desc: "Creating stunning environments for your parties.",
    keywords: "Party Decor Qatar, Balloon Decor Doha",
    itemPlaceholder: "e.g. Standard Balloon Arch"
  },
  [Category.MAKEUP_ARTIST]: {
    name: "e.g. Glow Up Kids Glam",
    price: "500",
    desc: "Professional face painting and mini-glam stations.",
    keywords: "Face Painting Doha, Kids Makeup Artist",
    itemPlaceholder: "e.g. Full Face Paint"
  },
  [Category.VENUE]: {
    name: "e.g. Starry Kids Playland",
    price: "2500",
    desc: "The ultimate indoor playground and party venue.",
    keywords: "Kids Party Venue, Play Area Lusail",
    itemPlaceholder: "e.g. Weekend Hall Hire"
  },
  [Category.BOOTH]: {
    name: "e.g. Popcorn & Candy Cloud",
    price: "400",
    desc: "Interactive live food booths for celebrations.",
    keywords: "Food Booth Qatar, Cotton Candy Doha",
    itemPlaceholder: "e.g. Popcorn Machine (2hrs)"
  }
};

export const VendorFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isProcessingProfile, setIsProcessingProfile] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isInstaModalOpen, setIsInstaModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: Category.HOME_BAKER,
    description: '',
    priceList: [] as MenuItem[], 
    priceType: PriceType.SESSION,
    location: QATAR_REGIONS[0],
    whatsapp: '',
    isWhatsAppVerified: false,
    keywords: '',
    profilePhoto: '',
    images: [] as string[],
    instagram: '',
    facebook: '',
    tiktok: '',
    website: ''
  });

  const MAX_PHOTOS = 5;
  const MAX_PRICE_ITEMS = 10;
  const currentExample = CATEGORY_EXAMPLES[formData.category];
  const isPhotographer = formData.category === Category.PHOTOGRAPHER;

  // Automatically calculate starting price from Price List
  const startingPrice = useMemo(() => {
    const prices = formData.priceList
      .map(item => parseInt(item.price))
      .filter(p => !isNaN(p) && p > 0);
    return prices.length > 0 ? Math.min(...prices).toString() : '0';
  }, [formData.priceList]);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingProfile(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const optimized = await optimizeImage(reader.result as string, 400, 400, 0.8);
        handleInputChange('profilePhoto', optimized);
        setIsProcessingProfile(false);
      };
      reader.readAsDataURL(file as Blob);
    }
  };

  const handlePriceItemUpdate = (index: number, field: keyof MenuItem, value: string) => {
    const updated = [...formData.priceList];
    const cleanedValue = field === 'price' ? value.replace(/[^0-9]/g, '') : value;
    updated[index] = { ...updated[index], [field]: cleanedValue };
    handleInputChange('priceList', updated);
  };

  const addPriceItem = () => {
    if (formData.priceList.length < MAX_PRICE_ITEMS) {
      handleInputChange('priceList', [...formData.priceList, { name: '', price: '', thumbnail: '' }]);
    }
  };

  const removePriceItem = (index: number) => {
    handleInputChange('priceList', formData.priceList.filter((_, i) => i !== index));
  };

  const startWhatsAppVerification = () => {
    const cleanNum = formData.whatsapp.replace('974', '');
    if (!/^\d{8}$/.test(cleanNum)) {
      alert('Enter valid 8-digit number.');
      return;
    }
    setIsVerifyModalOpen(true);
  };

  const handleOtpVerify = () => {
    setIsOtpLoading(true);
    setTimeout(() => {
      if (otpValue === '123456') {
        handleInputChange('isWhatsAppVerified', true);
        setIsVerifyModalOpen(false);
        setOtpValue('');
      } else {
        alert('Invalid code (Tip: 123456)');
      }
      setIsOtpLoading(false);
    }, 1200);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = MAX_PHOTOS - formData.images.length;
      if (remainingSlots <= 0) return;
      const fileArray = Array.from(files).slice(0, remainingSlots) as File[];
      setIsProcessingImages(true);
      const processFiles = async () => {
        const optimizedBatch: string[] = [];
        for (const file of fileArray) {
          const optimized = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
              const result = await optimizeImage(reader.result as string, 1200, 1200, 0.7);
              resolve(result);
            };
            reader.readAsDataURL(file as Blob);
          });
          optimizedBatch.push(optimized);
        }
        setFormData(prev => ({ ...prev, images: [...prev.images, ...optimizedBatch] }));
        setIsProcessingImages(false);
      };
      processFiles();
    }
  };

  const handleAISuggest = async () => {
    if (!formData.name) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeDescription(formData.name, formData.category, formData.description);
      handleInputChange('description', optimized);
    } catch (err) {} finally {
      setIsOptimizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.isWhatsAppVerified) {
      alert("Please verify WhatsApp first.");
      return;
    }
    if (formData.images.length === 0) {
      alert("Please add at least one photo.");
      return;
    }
    if (formData.priceList.length === 0) {
      alert("Please add at least one item to your price list.");
      return;
    }

    setIsSubmitting(true);
    saveVendor({ 
      ...formData,
      price: startingPrice, // Use automatically calculated price
      services: formData.priceList.map(item => item.name).filter(n => n.trim()),
      menu: formData.priceList.filter(item => item.name.trim()),
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k !== '')
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleInstagramImport = (images: string[]) => {
    const remainingSlots = MAX_PHOTOS - formData.images.length;
    const toAdd = images.slice(0, remainingSlots);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...toAdd] }));
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 animate-bounce">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Submitted!</h1>
        <p className="text-gray-500 font-medium text-sm">Your listing is under review and will be live soon.</p>
        <button onClick={() => navigate('/')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100">Return Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 px-1">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">List Your Service</h1>
        <p className="text-gray-500 font-medium text-sm">Reach hundreds of parents across Qatar.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Section 1: Identity */}
        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-black text-sm">1</div>
            <h2 className="text-xl font-bold text-gray-900">Identity</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
             <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group-hover:border-indigo-300 transition-all">
                  {isProcessingProfile ? <Loader2 size={24} className="text-indigo-400 animate-spin" /> : formData.profilePhoto ? <img src={formData.profilePhoto} className="w-full h-full object-cover" /> : <User size={32} className="text-gray-300" />}
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg cursor-pointer">
                  <Camera size={18} /><input type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
                </label>
             </div>

             <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <select className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={formData.category} onChange={e => handleInputChange('category', e.target.value as Category)}>
                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Business Title</label>
                  <input type="text" placeholder={currentExample.name} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} />
                </div>
             </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Story</label>
              <button type="button" onClick={handleAISuggest} disabled={isOptimizing} className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-indigo-100">
                {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI IMPROVE
              </button>
            </div>
            <textarea rows={3} placeholder={currentExample.desc} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold focus:ring-2 focus:ring-indigo-500" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} />
          </div>
        </section>

        {/* Section 2: Price List */}
        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-black text-sm">2</div>
            <h2 className="text-xl font-bold text-gray-900">Price List</h2>
          </div>
          
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest">Pricing (Max {MAX_PRICE_ITEMS})</label>
                {formData.priceList.length < MAX_PRICE_ITEMS && (
                  <button type="button" onClick={addPriceItem} className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-700 active:scale-95 transition-all">
                    <Plus size={12} /> ADD ITEM
                  </button>
                )}
             </div>

             <div className="space-y-3">
                {formData.priceList.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-1">
                    <div className="flex-1">
                      <input type="text" placeholder={currentExample.itemPlaceholder} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500" value={item.name} onChange={(e) => handlePriceItemUpdate(idx, 'name', e.target.value)} />
                    </div>
                    <div className="w-28 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[9px]">QAR</div>
                      <input type="text" inputMode="numeric" placeholder="Price" className="w-full pl-10 pr-3 py-3 bg-white rounded-xl border border-gray-200 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500" value={item.price} onChange={(e) => handlePriceItemUpdate(idx, 'price', e.target.value)} />
                    </div>
                    <button type="button" onClick={() => removePriceItem(idx)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                  </div>
                ))}
                {formData.priceList.length === 0 && <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] text-gray-400 font-bold uppercase tracking-widest flex flex-col items-center gap-2"><List size={24} className="text-gray-200" /> No items added</div>}
             </div>
          </div>

          <div className={`grid ${isPhotographer ? 'grid-cols-2' : 'grid-cols-1'} gap-4 pt-4 border-t border-gray-100`}>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Calculated Starting Price</label>
              <div className="relative group/price">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600"><Tag size={16} /></div>
                <div className="w-full pl-11 pr-5 py-4 bg-indigo-50 rounded-2xl border border-indigo-100 font-black text-indigo-600 text-lg flex items-center justify-between">
                  <span>QAR {startingPrice}</span>
                  <span className="text-[8px] uppercase tracking-tighter opacity-50">Auto-calculated</span>
                </div>
              </div>
            </div>
            {isPhotographer && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rate Basis</label>
                <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 h-[58px]">
                  {Object.values(PriceType).map(t => (
                    <button key={t} type="button" onClick={() => handleInputChange('priceType', t)} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${formData.priceType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>
                      {t === PriceType.HOURLY ? 'Hourly' : 'Session'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Portfolio */}
        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-black text-sm">3</div>
              <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
            </div>
            <button 
              type="button" 
              onClick={() => setIsInstaModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-[#f09433] to-[#bc1888] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all"
            >
              <Instagram size={14} /> Import IG
            </button>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleInputChange('images', formData.images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
                  </div>
              ))}
              {formData.images.length < MAX_PHOTOS && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all gap-1 group">
                  {isProcessingImages ? <Loader2 size={18} className="text-indigo-400 animate-spin" /> : <Camera size={18} className="text-gray-300" />}
                  <span className="text-[8px] font-black text-gray-400 uppercase">ADD</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
        </section>

        {/* Section 4: Digital Presence (NEW) */}
        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-black text-sm">4</div>
            <h2 className="text-xl font-bold text-gray-900">Digital Presence</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Instagram Handle</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-600"><Instagram size={18} /></div>
                <input type="text" placeholder="@your_handle" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-pink-500 transition-all" value={formData.instagram} onChange={e => handleInputChange('instagram', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Facebook</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><Facebook size={18} /></div>
                <input type="text" placeholder="facebook.com/yourpage" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.facebook} onChange={e => handleInputChange('facebook', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">TikTok</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900"><MessageCircle size={18} /></div>
                <input type="text" placeholder="@your_tiktok" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-gray-900 transition-all" value={formData.tiktok} onChange={e => handleInputChange('tiktok', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Website</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600"><Globe size={18} /></div>
                <input type="text" placeholder="www.yourwebsite.com" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.website} onChange={e => handleInputChange('website', e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Reach */}
        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-black text-sm">5</div>
            <h2 className="text-xl font-bold text-gray-900">Reach</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Location</label>
              <select className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.location} onChange={e => handleInputChange('location', e.target.value)}>
                {QATAR_REGIONS.map(reg => <option key={reg} value={reg}>{reg}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp Number</label>
              <div className="flex items-center rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-r border-gray-100 text-gray-400 font-bold bg-white">+974</div>
                <input type="tel" className="flex-1 px-4 py-4 bg-transparent font-bold outline-none text-gray-900" value={formData.whatsapp.replace('974', '')} onChange={e => handleInputChange('whatsapp', '974' + e.target.value.replace(/\D/g, ''))} />
                <button type="button" onClick={startWhatsAppVerification} className="px-6 text-green-600 font-black text-[10px] uppercase h-full">{formData.isWhatsAppVerified ? 'Verified' : 'Verify'}</button>
              </div>
            </div>
          </div>
        </section>

        <button type="submit" disabled={isSubmitting || !formData.isWhatsAppVerified} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-gray-200">
          {isSubmitting ? 'Processing...' : 'Submit Listing'}
        </button>
      </form>

      <InstagramImportModal 
        isOpen={isInstaModalOpen} 
        onClose={() => setIsInstaModalOpen(false)} 
        onImport={handleInstagramImport} 
      />

      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 text-center space-y-6 shadow-2xl">
            <h3 className="text-xl font-black text-gray-900">Confirm OTP</h3>
            <p className="text-gray-500 text-sm font-medium">Enter 123456 to verify.</p>
            <input type="text" maxLength={6} placeholder="000000" className="w-full px-6 py-5 bg-gray-50 rounded-2xl text-center text-3xl font-black outline-none border border-gray-100 text-green-700" value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))} />
            <button onClick={handleOtpVerify} disabled={otpValue.length !== 6 || isOtpLoading} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black active:scale-95 transition-all">
              {isOtpLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm'}
            </button>
            <button onClick={() => setIsVerifyModalOpen(false)} className="text-gray-400 font-bold text-xs uppercase tracking-widest block w-full">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};
