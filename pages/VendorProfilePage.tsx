
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Share2, User, ShieldCheck, Instagram, Facebook, Music2, Globe, Play, Hash, Heart, List } from 'lucide-react';
import { Vendor, PriceType } from '../types.ts';
import { getVendorById, incrementView, incrementWhatsAppClick } from '../services/vendorService.ts';
import { WHATSAPP_TEMPLATE } from '../constants.tsx';
import { getCurrentUser, toggleFavorite } from '../services/authService.ts';
import { LoginModal } from '../components/LoginModal.tsx';
import { ReviewSection } from '../components/ReviewSection.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { StarRating } from '../components/StarRating.tsx';
import { getVendorRating } from '../services/reviewService.ts';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export const VendorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [ratingData, setRatingData] = useState({ avg: 0, count: 0 });
  const [activeImage, setActiveImage] = useState(0);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

  // Fix: Handle async getVendorById call
  useEffect(() => {
    if (id) {
      const loadVendor = async () => {
        const found = await getVendorById(id);
        if (found) {
          setVendor(found);
          incrementView(found.id);
          setRatingData(getVendorRating(found.id));
        }
      };
      loadVendor();
    }
  }, [id]);

  const isFavorited = useMemo(() => user?.favorites.includes(vendor?.id || ''), [user, vendor]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container) {
      const scrollPosition = container.scrollLeft;
      const width = container.offsetWidth;
      if (width > 0) {
        setActiveImage(Math.round(scrollPosition / width));
      }
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!vendor) return;
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    const updatedUser = toggleFavorite(vendor.id);
    if (updatedUser) setUser(updatedUser);
  };

  const cleanPrice = (price: string = '') => {
    return price.toString().replace(/QAR/gi, '').trim();
  };

  const handleWhatsApp = () => {
    if (!vendor) return;
    incrementWhatsAppClick(vendor.id);
    const message = encodeURIComponent(WHATSAPP_TEMPLATE(vendor.name));
    window.open(`https://wa.me/${vendor.whatsapp}?text=${message}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share && vendor) {
      navigator.share({
        title: `${vendor.name} - Qatar Party Hub`,
        text: vendor.description,
        url: window.location.href,
      });
    }
  };

  const formatSocialLink = (platform: string, value: string) => {
    if (!value) return null;
    let url = value;
    if (platform === 'instagram' && !value.startsWith('http')) {
      url = `https://instagram.com/${value.replace('@', '')}`;
    } else if (platform === 'facebook' && !value.startsWith('http')) {
      url = value.startsWith('facebook.com') ? `https://${value}` : `https://facebook.com/${value}`;
    } else if (platform === 'tiktok' && !value.startsWith('http')) {
      url = `https://tiktok.com/@${value.replace('@', '')}`;
    } else if (platform === 'website' && !value.startsWith('http')) {
      url = `https://${value}`;
    }
    return url;
  };

  if (!vendor) return <div className="text-center py-20 font-bold text-gray-400">Loading profile...</div>;

  const hasSocial = vendor.instagram || vendor.facebook || vendor.tiktok || vendor.website;
  const keywords = (vendor.keywords || []).filter(k => k.trim() !== '');

  return (
    <div className="space-y-6 pb-40 animate-in fade-in duration-500 text-left">
      <header className="flex justify-between items-center px-1">
        <Link to="/" className="p-3 text-gray-500 hover:text-indigo-600 bg-white shadow-sm border border-gray-100 rounded-full transition-all active:scale-90"><ArrowLeft size={20} /></Link>
        <div className="flex gap-2">
          <button onClick={handleFavorite} className={`p-3 shadow-sm border rounded-full transition-all active:scale-90 flex items-center justify-center ${isFavorited ? 'bg-pink-600 text-white border-pink-600' : 'text-gray-500 hover:text-pink-600 bg-white border-gray-100'}`}>
            <Heart size={20} fill={isFavorited ? "currentColor" : "none"} strokeWidth={2.5} />
          </button>
          <button onClick={handleShare} className="p-3 text-gray-500 hover:text-indigo-600 bg-white shadow-sm border border-gray-100 rounded-full transition-all active:scale-90"><Share2 size={20} /></button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-5 max-w-2xl mx-auto relative overflow-hidden">
         <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
         <div className="relative">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden bg-gray-50 transform -rotate-3">
              {vendor.profilePhoto ? <img src={vendor.profilePhoto} className="w-full h-full object-cover" alt={vendor.name} /> : <div className="w-full h-full flex items-center justify-center text-indigo-200"><User size={64} /></div>}
            </div>
            {vendor.verified && <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg"><ShieldCheck size={20} /></div>}
         </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight px-4">{vendor.name}</h1>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] bg-gray-50 px-4 py-2 rounded-full inline-flex"><MapPin size={12} className="text-indigo-500" /> {vendor.location}</div>
              <div className="flex items-center gap-2"><StarRating rating={ratingData.avg} size={14} /><span className="text-sm font-bold text-gray-400">{ratingData.avg} ({ratingData.count})</span></div>
            </div>
            {hasSocial && (
              <div className="flex items-center justify-center gap-4 pt-2">
                {vendor.instagram && <a href={formatSocialLink('instagram', vendor.instagram)!} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center hover:bg-pink-100 transition-all shadow-sm"><Instagram size={20} /></a>}
                {vendor.facebook && <a href={formatSocialLink('facebook', vendor.facebook)!} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-all shadow-sm"><Facebook size={20} /></a>}
                {vendor.tiktok && <a href={formatSocialLink('tiktok', vendor.tiktok)!} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-md"><Music2 size={20} /></a>}
                {vendor.website && <a href={formatSocialLink('website', vendor.website)!} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-100 transition-all shadow-sm"><Globe size={20} /></a>}
              </div>
            )}
            <div className="flex flex-col items-center gap-1 pt-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('startingFrom')}</span>
              <div className="flex items-center justify-center gap-3">
                 <span className="text-2xl md:text-3xl font-black text-indigo-600">{t('qar')} {cleanPrice(vendor.price)}</span>
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">{vendor.priceType === PriceType.HOURLY ? t('perHour') : t('perSession')}</span>
              </div>
            </div>
            <div className="pt-2"><span className="px-6 py-2.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-200">{t(`categories.${vendor.category}`)}</span></div>
          </div>
      </div>

      <section className="relative px-1">
        <div onScroll={handleScroll} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-[2.5rem] aspect-[16/12] md:aspect-[16/10] bg-gray-100 shadow-xl border border-gray-100">
          {vendor.images.map((img, idx) => (<div key={idx} className="w-full h-full flex-shrink-0 snap-center"><img src={img} className="w-full h-full object-cover" alt={`Work ${idx + 1}`} loading="lazy" /></div>))}
        </div>
        <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl text-white text-[11px] font-black tracking-widest border border-white/10 z-10">{activeImage + 1} / {vendor.images.length}</div>
      </section>

      <section className="space-y-4 px-4 pt-4">
        <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2"><div className="w-4 h-0.5 bg-indigo-500 rounded-full" /> {t('aboutService')}</h3>
        <p className="text-gray-700 leading-relaxed font-medium text-lg whitespace-pre-line">{vendor.description}</p>
      </section>

      {vendor.menu && vendor.menu.length > 0 && (
        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm mx-1 space-y-6">
           <h3 className="font-black text-gray-900 uppercase text-[12px] tracking-[0.3em] text-center flex items-center justify-center gap-2">
             <List className="w-5 h-5 text-indigo-600" /> Price List
           </h3>
           <div className="space-y-3">
              {vendor.menu.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-[2rem] border border-gray-100 transition-all hover:bg-gray-50">
                  <div className="font-black text-gray-700 text-sm tracking-tight">{item.name}</div>
                  <div className="flex items-center gap-1.5">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">QAR</span>
                     <span className="text-lg font-black text-indigo-600">{cleanPrice(item.price)}</span>
                  </div>
                </div>
              ))}
           </div>
        </section>
      )}

      {vendor.addOns && vendor.addOns.length > 0 && (
        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6 mx-1">
          <h3 className="font-black text-gray-900 uppercase text-[12px] tracking-[0.3em] text-center opacity-80">{t('optionalExtras')}</h3>
          <div className="space-y-3">
            {vendor.addOns.map((addon, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 bg-white border border-gray-50 rounded-[2rem] shadow-sm hover:scale-[1.01] transition-all">
                <span className="font-bold text-gray-700 text-sm">{addon.name}</span>
                <div className="flex items-center gap-1.5">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{t('qar')}</span>
                   <span className="text-lg font-black text-indigo-600">{cleanPrice(addon.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="px-1"><ReviewSection vendorId={vendor.id} onReviewAdded={() => setRatingData(getVendorRating(vendor.id))} /></section>

      {keywords.length > 0 && (
        <section className="px-4 py-8 opacity-40 hover:opacity-100 transition-opacity">
           <div className="flex flex-wrap gap-2 justify-center">
             {keywords.map((tag, idx) => (<span key={idx} className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Hash size={10} /> {tag}</span>))}
           </div>
        </section>
      )}

      <div className="fixed bottom-[80px] md:bottom-8 inset-x-0 px-6 z-40">
        <div className="max-w-xl mx-auto flex justify-center">
           <button onClick={handleWhatsApp} className="w-full flex items-center justify-center gap-3 bg-[#16a34a] text-white px-8 py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-[#15803d] transition-all group overflow-hidden relative">
             <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" /><WhatsAppIcon className="w-8 h-8" /> {t('bookNow')}
           </button>
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSuccess={() => setUser(getCurrentUser())} />
    </div>
  );
};
