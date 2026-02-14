
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, X, Sparkles as SparklesIcon, FilterX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Category, Vendor, VendorStatus } from '../types.ts';
import { CATEGORY_ICONS } from '../constants.tsx';
import { getVendors } from '../services/vendorService.ts';
import VendorCard from '../components/VendorCard.tsx';
import { useLanguage } from '../LanguageContext.tsx';

export const HomePage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  // Fix: Handle async getVendors call
  useEffect(() => {
    const loadData = async () => {
      const allVendors = await getVendors();
      setVendors(allVendors.filter(v => v.status === VendorStatus.APPROVED));
    };
    loadData();
  }, []);

  const triggerConfetti = useCallback((isHover = false) => {
    // Defensive check to ensure confetti function exists (prevents getBoundingClientRect errors)
    if (typeof confetti !== 'function') return;

    const scalar = isHover ? 0.7 : 1;
    const particleCount = isHover ? 40 : 80;
    
    try {
      confetti({
        particleCount: particleCount,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#818cf8', '#a5b4fc', '#ffffff', '#fbbf24'],
        scalar: scalar,
        ticks: 200,
        gravity: 1.2,
        startVelocity: 30,
      });
    } catch (e) {
      console.warn("Confetti animation failed to trigger", e);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => triggerConfetti(), 1000);
    return () => clearTimeout(timer);
  }, [triggerConfetti]);

  const categories = Object.values(Category);

  const { featuredVendors, filteredVendors, isSearching } = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    const isSearching = searchLower.length > 0;

    const filtered = vendors.filter(v => 
      v.name.toLowerCase().includes(searchLower) ||
      v.description.toLowerCase().includes(searchLower) ||
      v.category.toLowerCase().includes(searchLower) ||
      v.services.some(s => s.toLowerCase().includes(searchLower)) ||
      v.location.toLowerCase().includes(searchLower)
    );

    return {
      featuredVendors: isSearching ? [] : vendors.filter(v => v.featured),
      filteredVendors: filtered,
      isSearching
    };
  }, [vendors, searchTerm]);

  return (
    <div className="space-y-12 pb-10">
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden rounded-[2.5rem] bg-indigo-900 text-center py-16 md:py-24 px-4 shadow-2xl"
      >
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen pointer-events-none"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-glitter-particles-and-bokeh-lights-1014-large.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/60 to-indigo-900/40 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm select-none">
            {t('heroTitle')}
          </h1>
          <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed font-medium select-none">
            {t('heroSub')}
          </p>

          <div className="relative max-w-md mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 transition-colors ${isSearching ? 'text-indigo-500' : 'text-indigo-300'}`} />
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-12 py-5 bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl focus:ring-4 focus:ring-indigo-500/30 outline-none text-gray-900 text-base font-medium transition-all"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isSearching && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('exploreCategories')}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/category/${encodeURIComponent(cat)}`}
              className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:border-indigo-100 transition-all group"
            >
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {CATEGORY_ICONS[cat]}
              </div>
              <span className="text-sm font-bold text-gray-700 text-center">{t(`categories.${cat}`)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Vendors */}
      {!isSearching && featuredVendors.length > 0 && (
        <section className="relative -mx-4 px-4 py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/40 -z-10" />
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500 text-white rounded-lg shadow-amber-200 shadow-md">
                    <SparklesIcon className="w-5 h-5 fill-current" />
                  </div>
                  <span className="text-amber-600 text-sm font-extrabold uppercase tracking-[0.2em]">{t('partnerHighlights')}</span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('featuredPartners')}</h2>
                <p className="text-gray-500 max-w-md">{t('featuredSub')}</p>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
              {featuredVendors.map(vendor => (
                <div key={vendor.id} className="w-[85vw] sm:w-[320px] md:w-[380px] flex-shrink-0 snap-center">
                  <VendorCard vendor={vendor} showFeaturedBadge />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Vendor Listing */}
      <section id="results" className="scroll-mt-20">
        <div className="flex justify-between items-end mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSearching ? t('searchResults') : t('discoverAll')}
            </h2>
          </div>
          {!isSearching && (
            <Link to="/category/All" className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline">
              {t('viewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        
        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
            {filteredVendors.map(vendor => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="max-w-xs mx-auto space-y-6">
              <FilterX className="w-10 h-10 mx-auto text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900">{t('noMatches')}</h3>
              <button onClick={() => setSearchTerm('')} className="inline-flex px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold">{t('clearSearch')}</button>
            </div>
          </div>
        )}
      </section>

      {/* Vendor CTA */}
      <section className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-bold mb-4">{t('areYouVendor')}</h2>
          <p className="text-indigo-100 mb-8 text-lg">{t('vendorCTA')}</p>
          <Link to="/list-service" className="inline-flex px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold shadow-lg">
            {t('listServiceFree')}
          </Link>
        </div>
        <div className="absolute top-0 right-0 translate-x-1/3 w-64 h-64 bg-indigo-500/20 rounded-full -translate-y-1/2" />
      </section>
    </div>
  );
};
