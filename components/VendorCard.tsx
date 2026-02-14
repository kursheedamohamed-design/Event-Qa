
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, CheckCircle2, User, Heart } from 'lucide-react';
import { Vendor } from '../types.ts';
import { getVendorRating } from '../services/reviewService.ts';
import { StarRating } from './StarRating.tsx';
import { getCurrentUser, toggleFavorite } from '../services/authService.ts';
import { LoginModal } from './LoginModal.tsx';
import { useLanguage } from '../LanguageContext.tsx';

interface VendorCardProps {
  vendor: Vendor;
  showFeaturedBadge?: boolean;
}

const WhatsAppIconMini = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const VendorCard: React.FC<VendorCardProps> = ({ vendor, showFeaturedBadge }) => {
  const isFeatured = vendor.featured || showFeaturedBadge;
  const ratingData = useMemo(() => getVendorRating(vendor.id), [vendor.id]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const { t } = useLanguage();

  const isFavorited = useMemo(() => user?.favorites.includes(vendor.id), [user, vendor.id]);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  return (
    <>
      <Link 
        to={`/partner/${vendor.id}`}
        className={`group relative bg-white rounded-[2.5rem] overflow-hidden border ${isFeatured ? 'border-amber-200' : 'border-gray-100'} hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full shadow-sm`}
      >
        <div className="relative aspect-[16/11] overflow-hidden">
          <img 
            src={vendor.images[0] || 'https://picsum.photos/seed/placeholder/800/600'} 
            alt={vendor.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-4 left-4">
            <div className="px-3.5 py-1.5 bg-white/95 rounded-xl text-[10px] font-black uppercase tracking-wider text-indigo-600 shadow-sm border border-indigo-50">
              {t(`categories.${vendor.category}`)}
            </div>
          </div>
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <button 
              onClick={handleFavorite}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md ${isFavorited ? 'bg-pink-600 text-white' : 'bg-white/90 text-gray-400 hover:text-pink-500'}`}
            >
              <Heart size={20} fill={isFavorited ? "currentColor" : "none"} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        <div className="px-5 pb-5 pt-0 flex-grow flex flex-col relative">
          <div className="relative -mt-10 mb-4 flex items-end justify-between">
            <div className="w-16 h-16 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden flex-shrink-0 ml-1">
              {vendor.profilePhoto ? (
                <img src={vendor.profilePhoto} alt={vendor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300">
                  <User size={24} />
                </div>
              )}
            </div>
            <div className="flex flex-col items-end">
               <span className="flex items-center gap-1 text-indigo-600 font-black text-xs bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm">
                 QAR {cleanPrice(vendor.price)}
               </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-[1.2rem] leading-tight text-indigo-600 group-hover:text-indigo-700 transition-colors tracking-tight">
              {vendor.name}
            </h3>
            {vendor.verified && (
              <CheckCircle2 className="w-4 h-4 text-blue-500 fill-white" />
            )}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={ratingData.avg} size={13} />
            <span className="text-[12px] text-gray-400 font-bold">{ratingData.avg} ({ratingData.count})</span>
          </div>
          <p className="text-gray-500 text-[13px] line-clamp-2 mb-6 flex-grow font-medium leading-relaxed text-left">
            {vendor.description}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
            <div className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              {vendor.location}
            </div>
            <div className="flex items-center text-green-600 font-black text-[11px] uppercase tracking-widest group-hover:scale-105 transition-transform">
              <WhatsAppIconMini className="w-4 h-4 mr-1.5" />
              BOOK NOW
            </div>
          </div>
        </div>
      </Link>
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={() => setUser(getCurrentUser())}
      />
    </>
  );
};

export default VendorCard;
