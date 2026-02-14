
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Share2, User, ShieldCheck, Instagram, Facebook, Music2, Globe, Heart, List } from 'lucide-react';
import { Partner, PriceType } from '../types.ts';
import { getPartnerById, incrementPartnerView, incrementPartnerWhatsAppClick } from '../services/partnerService.ts';
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

export const PartnerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [ratingData, setRatingData] = useState({ avg: 0, count: 0 });
  const [activeImage, setActiveImage] = useState(0);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    if (id) {
      const loadPartner = async () => {
        const found = await getPartnerById(id);
        if (found) {
          setPartner(found);
          incrementPartnerView(found.id);
          setRatingData(getVendorRating(found.id));
        }
      };
      loadPartner();
    }
  }, [id]);

  const isFavorited = useMemo(() => user?.favorites.includes(partner?.id || ''), [user, partner]);

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
    if (!partner) return;
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    const updatedUser = toggleFavorite(partner.id);
    if (updatedUser) setUser(updatedUser);
  };

  const handleWhatsApp = () => {
    if (!partner) return;
    incrementPartnerWhatsAppClick(partner.id);
    const message = encodeURIComponent(WHATSAPP_TEMPLATE(partner.name));
    window.open(`https://wa.me/${partner.whatsapp}?text=${message}`, '_blank');
  };

  if (!partner) return <div className="text-center py-20 font-bold text-gray-400">Loading profile...</div>;

  return (
    <div className="space-y-6 pb-40 animate-in fade-in duration-500 text-left">
      <header className="flex justify-between items-center px-1">
        <Link to="/" className="p-3 text-gray-500 hover:text-indigo-600 bg-white shadow-sm border border-gray-100 rounded-full transition-all active:scale-90"><ArrowLeft size={20} /></Link>
        <div className="flex gap-2">
          <button onClick={handleFavorite} className={`p-3 shadow-sm border rounded-full transition-all active:scale-90 flex items-center justify-center ${isFavorited ? 'bg-pink-600 text-white border-pink-600' : 'text-gray-500 hover:text-pink-600 bg-white border-gray-100'}`}>
            <Heart size={20} fill={isFavorited ? "currentColor" : "none"} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-5 max-w-2xl mx-auto relative overflow-hidden">
         <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden bg-gray-50 transform -rotate-3">
           {partner.profilePhoto ? <img src={partner.profilePhoto} className="w-full h-full object-cover" alt={partner.name} /> : <div className="w-full h-full flex items-center justify-center text-indigo-200"><User size={64} /></div>}
         </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight px-4">{partner.name}</h1>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] bg-gray-50 px-4 py-2 rounded-full inline-flex"><MapPin size={12} className="text-indigo-500" /> {partner.location}</div>
              <div className="flex items-center gap-2"><StarRating rating={ratingData.avg} size={14} /><span className="text-sm font-bold text-gray-400">{ratingData.avg} ({ratingData.count})</span></div>
            </div>
            <div className="flex flex-col items-center gap-1 pt-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('startingFrom')}</span>
              <div className="flex items-center justify-center gap-3">
                 <span className="text-2xl md:text-3xl font-black text-indigo-600">{t('qar')} {partner.price}</span>
              </div>
            </div>
          </div>
      </div>

      <section className="relative px-1">
        <div onScroll={handleScroll} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-[2.5rem] aspect-[16/12] md:aspect-[16/10] bg-gray-100 shadow-xl border border-gray-100">
          {partner.images.map((img, idx) => (<div key={idx} className="w-full h-full flex-shrink-0 snap-center"><img src={img} className="w-full h-full object-cover" alt={`Work ${idx + 1}`} loading="lazy" /></div>))}
        </div>
        <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl text-white text-[11px] font-black tracking-widest border border-white/10 z-10">{activeImage + 1} / {partner.images.length}</div>
      </section>

      <section className="space-y-4 px-4 pt-4">
        <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2"><div className="w-4 h-0.5 bg-indigo-500 rounded-full" /> {t('aboutService')}</h3>
        <p className="text-gray-700 leading-relaxed font-medium text-lg whitespace-pre-line">{partner.description}</p>
      </section>

      <div className="fixed bottom-[80px] md:bottom-8 inset-x-0 px-6 z-40">
        <button onClick={handleWhatsApp} className="w-full max-w-xl mx-auto flex items-center justify-center gap-3 bg-[#16a34a] text-white px-8 py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-[#15803d] transition-all">
          <WhatsAppIcon className="w-8 h-8" /> {t('bookNow')}
        </button>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSuccess={() => setUser(getCurrentUser())} />
    </div>
  );
};
