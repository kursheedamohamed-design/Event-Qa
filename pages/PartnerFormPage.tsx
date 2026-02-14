
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, CheckCircle, Loader2, Plus, Trash2, Instagram, User, Tag } from 'lucide-react';
import { Category, PriceType, MenuItem } from '../types.ts';
import { QATAR_REGIONS } from '../constants.tsx';
import { savePartner, getMyPartnerProfile } from '../services/partnerService.ts';
import { optimizeDescription } from '../services/geminiService.ts';
import { optimizeImage } from '../services/imageService.ts';
import { useLanguage } from '../LanguageContext.tsx';
import { InstagramImportModal } from '../components/InstagramImportModal.tsx';
import { getCurrentUser } from '../services/authService.ts';
import { LoginModal } from '../components/LoginModal.tsx';

const CATEGORY_EXAMPLES: Record<Category, { name: string, price: string, desc: string, keywords: string, itemPlaceholder: string }> = {
  [Category.HOME_BAKER]: { name: "e.g. Aisha's Sweet Crumbs", price: "350", desc: "Bespoke cakes and dessert tables.", keywords: "Cake", itemPlaceholder: "e.g. 1kg Cake" },
  [Category.PHOTOGRAPHER]: { name: "e.g. Joyful Clicks", price: "750", desc: "Capturing candid moments.", keywords: "Photo", itemPlaceholder: "e.g. 2hr Session" },
  [Category.HENNA_ARTIST]: { name: "e.g. Henna by Noor", price: "100", desc: "Modern henna designs.", keywords: "Henna", itemPlaceholder: "e.g. Simple Design" },
  [Category.PERFORMER]: { name: "e.g. Magic Max", price: "600", desc: "Interactive magic shows.", keywords: "Magic", itemPlaceholder: "e.g. 45-min Show" },
  [Category.DECORATOR]: { name: "e.g. Dream Themes", price: "800", desc: "Balloon and theme decor.", keywords: "Decor", itemPlaceholder: "e.g. Balloon Arch" },
  [Category.MAKEUP_ARTIST]: { name: "e.g. Glow Up Glam", price: "500", desc: "Professional event makeup.", keywords: "Makeup", itemPlaceholder: "e.g. Full Glam" },
  [Category.VENUE]: { name: "e.g. Starry Playland", price: "2500", desc: "The ultimate event venue.", keywords: "Venue", itemPlaceholder: "e.g. Hall Hire" },
  [Category.BOOTH]: { name: "e.g. Popcorn Cloud", price: "400", desc: "Live food booth experience.", keywords: "Food", itemPlaceholder: "e.g. Booth Hire" }
};

export const PartnerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isProcessingProfile, setIsProcessingProfile] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [isInstaModalOpen, setIsInstaModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: Category.HOME_BAKER,
    description: '',
    priceList: [] as MenuItem[], 
    priceType: PriceType.SESSION,
    location: QATAR_REGIONS[0],
    whatsapp: '',
    isWhatsAppVerified: true,
    keywords: '',
    profilePhoto: '',
    images: [] as string[],
    instagram: '',
    facebook: '',
    tiktok: '',
    website: ''
  });

  const MAX_PHOTOS = 5;
  const currentExample = CATEGORY_EXAMPLES[formData.category];

  useEffect(() => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      // Check if user already has a partner profile
      const checkProfile = async () => {
        const existing = await getMyPartnerProfile();
        if (existing) navigate('/partner-dashboard');
      };
      checkProfile();
    }
  }, [user, navigate]);

  const startingPrice = useMemo(() => {
    const prices = formData.priceList.map(item => parseInt(item.price)).filter(p => !isNaN(p) && p > 0);
    return prices.length > 0 ? Math.min(...prices).toString() : '0';
  }, [formData.priceList]);

  const handleInputChange = (name: string, value: any) => setFormData(prev => ({ ...prev, [name]: value }));

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

  const addPriceItem = () => {
    if (formData.priceList.length < 10) {
      handleInputChange('priceList', [...formData.priceList, { name: '', price: '', thumbnail: '' }]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) { alert("Please add portfolio photos."); return; }
    if (!formData.whatsapp || formData.whatsapp.length < 11) { alert("Please enter a valid WhatsApp number."); return; }

    setIsSubmitting(true);
    try {
      await savePartner({ 
        ...formData,
        price: startingPrice,
        services: formData.priceList.map(item => item.name).filter(n => n.trim()),
        menu: formData.priceList.filter(item => item.name.trim()),
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k !== '')
      });
      setIsSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return (
    <div className="py-20 text-center">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => navigate('/')} onSuccess={() => setUser(getCurrentUser())} />
      <Loader2 className="animate-spin mx-auto text-indigo-200" size={40} />
      <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Authenticating Partner Access...</p>
    </div>
  );

  if (isSuccess) return (
    <div className="max-w-xl mx-auto py-20 text-center space-y-6">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 animate-bounce">
        <CheckCircle className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Profile Submitted!</h1>
      <p className="text-gray-500 font-medium">Your business is being reviewed. You can now access your dashboard.</p>
      <button onClick={() => navigate('/partner-dashboard')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Go to Dashboard</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-20 px-1 animate-in fade-in duration-500">
      <header className="mb-10 text-center md:text-left flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Partner Signup</h1>
          <p className="text-gray-500 font-medium text-sm">Welcome, {user.name}. Let's create your business profile.</p>
        </div>
        <div className="w-12 h-12 rounded-xl border-2 border-indigo-100 overflow-hidden shadow-sm">
          <img src={user.avatar} className="w-full h-full object-cover" />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-black text-sm">1</div>
            <h2 className="text-xl font-bold text-gray-900">Brand Identity</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
             <div className="relative">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                  {isProcessingProfile ? <Loader2 className="text-indigo-400 animate-spin" /> : formData.profilePhoto ? <img src={formData.profilePhoto} className="w-full h-full object-cover" /> : <User size={32} className="text-gray-300" />}
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg cursor-pointer">
                  <Camera size={18} /><input type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
                </label>
             </div>
             <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Category</label>
                  <select className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold outline-none" value={formData.category} onChange={e => handleInputChange('category', e.target.value as Category)}>
                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Business Title</label>
                  <input type="text" placeholder={currentExample.name} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} required />
                </div>
             </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">About your service</label>
              <button type="button" onClick={handleAISuggest} disabled={isOptimizing} className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg flex items-center gap-1">
                {isOptimizing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI IMPROVE
              </button>
            </div>
            <textarea rows={3} placeholder={currentExample.desc} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} required />
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-black text-sm">2</div>
            <h2 className="text-xl font-bold text-gray-900">Reach & Contact</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Region in Qatar</label>
              <select className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold outline-none" value={formData.location} onChange={e => handleInputChange('location', e.target.value)}>
                {QATAR_REGIONS.map(reg => <option key={reg} value={reg}>{reg}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Business WhatsApp Number</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+974</div>
                  <input type="tel" className="w-full pl-16 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold" value={formData.whatsapp.replace('974', '')} onChange={e => handleInputChange('whatsapp', '974' + e.target.value.replace(/\D/g, ''))} placeholder="0000 0000" required />
                </div>
              </div>
              <p className="text-[9px] text-gray-400 font-bold mt-2">Clients will reach you directly via this WhatsApp number.</p>
            </div>
          </div>
        </section>

        <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all disabled:bg-gray-200">
          {isSubmitting ? 'PROCESSING...' : 'LIST MY SERVICE'}
        </button>
      </form>

      <InstagramImportModal 
        isOpen={isInstaModalOpen} 
        onClose={() => setIsInstaModalOpen(false)} 
        onImport={images => handleInputChange('images', [...formData.images, ...images])} 
      />
    </div>
  );
};
