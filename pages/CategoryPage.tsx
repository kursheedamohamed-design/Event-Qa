
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Filter, SlidersHorizontal, Search, X } from 'lucide-react';
import { Category, Vendor, VendorStatus } from '../types.ts';
import { getVendors } from '../services/vendorService.ts';
import { getVendorRating } from '../services/reviewService.ts';
import VendorCard from '../components/VendorCard.tsx';
import { CATEGORY_ICONS, QATAR_REGIONS } from '../constants.tsx';

export const CategoryPage: React.FC = () => {
  const { category: categoryParam } = useParams<{ category: string }>();
  const navigate = useNavigate();
  
  const [allApprovedVendors, setAllApprovedVendors] = useState<Vendor[]>([]);
  const [vendorRatings, setVendorRatings] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || 'All');
  const [activePrice, setActivePrice] = useState<string>('All');
  const [activeLocation, setActiveLocation] = useState<string | 'All'>('All');
  const [activeRating, setActiveRating] = useState<number | 0>(0);

  // Fix: Handle async getVendors call and pre-calculate ratings
  useEffect(() => {
    const loadData = async () => {
      const allVendors = await getVendors();
      const approved = allVendors.filter(v => v.status === VendorStatus.APPROVED);
      setAllApprovedVendors(approved);

      // Pre-calculate ratings map
      const ratingsMap: Record<string, number> = {};
      approved.forEach(v => {
        const { avg } = getVendorRating(v.id);
        ratingsMap[v.id] = avg;
      });
      setVendorRatings(ratingsMap);
    };
    loadData();
  }, []);

  // Sync state if URL changes externally
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  const filteredVendors = useMemo(() => {
    return allApprovedVendors.filter(v => {
      const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
      
      let matchesPrice = true;
      if (activePrice !== 'All') {
        const vendorPrice = parseInt(v.price.replace(/\D/g, ''));
        if (activePrice === 'Budget') matchesPrice = vendorPrice <= 200;
        else if (activePrice === 'Mid') matchesPrice = vendorPrice > 200 && vendorPrice <= 1000;
        else if (activePrice === 'Premium') matchesPrice = vendorPrice > 1000;
      }

      const matchesLocation = activeLocation === 'All' || v.location === activeLocation;
      const avgRating = vendorRatings[v.id] || 0;
      const matchesRating = activeRating === 0 || avgRating >= activeRating;

      return matchesCategory && matchesPrice && matchesLocation && matchesRating;
    });
  }, [allApprovedVendors, vendorRatings, activeCategory, activePrice, activeLocation, activeRating]);

  const hasActiveFilters = activeCategory !== 'All' || activePrice !== 'All' || activeLocation !== 'All' || activeRating !== 0;

  const resetFilters = () => {
    setActiveCategory('All');
    setActivePrice('All');
    setActiveLocation('All');
    setActiveRating(0);
    navigate('/category/All', { replace: true });
  };

  const handleCategoryChange = (val: string) => {
    setActiveCategory(val);
    navigate(`/category/${encodeURIComponent(val)}`, { replace: true });
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-4">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors group text-sm font-bold">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Hub
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 transition-all duration-500">
            {activeCategory !== 'All' && CATEGORY_ICONS[activeCategory as Category] 
              ? CATEGORY_ICONS[activeCategory as Category] 
              : <SlidersHorizontal size={20} />
            }
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {activeCategory === 'All' ? 'Browse All' : activeCategory}
            </h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{filteredVendors.length} vendors found</p>
          </div>
        </div>
      </header>

      {/* FIXED: Improved Filter Bar with Robust Horizontal Scroll */}
      <section className="sticky top-[64px] z-30 bg-gray-50/90 backdrop-blur-md border-b border-gray-100 -mx-4">
        <div className="overflow-x-auto px-4 py-3 scrollbar-hide">
          <div className="inline-flex items-center gap-3 min-w-full">
            {/* Icon Indicator */}
            <div className="flex-shrink-0 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center">
              <Filter size={18} className="text-indigo-500" />
            </div>

            {/* Category Filter */}
            <div className="relative flex-shrink-0">
              <select 
                className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider outline-none transition-all cursor-pointer ${
                  activeCategory !== 'All' 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-white border-gray-100 text-gray-600 shadow-sm'
                }`}
                value={activeCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="All">Category: All</option>
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat} className="text-gray-900 font-sans">{cat}</option>
                ))}
              </select>
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-1.5 h-1.5 rounded-full ${activeCategory !== 'All' ? 'bg-white' : 'bg-gray-300'}`} />
            </div>

            {/* Price Filter */}
            <div className="relative flex-shrink-0">
              <select 
                className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider outline-none transition-all cursor-pointer ${
                  activePrice !== 'All' 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-white border-gray-100 text-gray-600 shadow-sm'
                }`}
                value={activePrice}
                onChange={(e) => setActivePrice(e.target.value)}
              >
                <option value="All">Budget: All</option>
                <option value="Budget" className="text-gray-900 font-sans">Under QAR 200</option>
                <option value="Mid" className="text-gray-900 font-sans">QAR 200 - 1000</option>
                <option value="Premium" className="text-gray-900 font-sans">Over QAR 1000</option>
              </select>
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-1.5 h-1.5 rounded-full ${activePrice !== 'All' ? 'bg-white' : 'bg-gray-300'}`} />
            </div>

            {/* Location Filter */}
            <div className="relative flex-shrink-0">
              <select 
                className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider outline-none transition-all cursor-pointer ${
                  activeLocation !== 'All' 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-white border-gray-100 text-gray-600 shadow-sm'
                }`}
                value={activeLocation}
                onChange={(e) => setActiveLocation(e.target.value)}
              >
                <option value="All">Region: All</option>
                {QATAR_REGIONS.map(reg => (
                  <option key={reg} value={reg} className="text-gray-900 font-sans">{reg}</option>
                ))}
              </select>
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-1.5 h-1.5 rounded-full ${activeLocation !== 'All' ? 'bg-white' : 'bg-gray-300'}`} />
            </div>

            {/* Rating Filter */}
            <div className="relative flex-shrink-0">
              <select 
                className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider outline-none transition-all cursor-pointer ${
                  activeRating > 0 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-white border-gray-100 text-gray-600 shadow-sm'
                }`}
                value={activeRating}
                onChange={(e) => setActiveRating(Number(e.target.value))}
              >
                <option value="0">Rating: All</option>
                <option value="4.5" className="text-gray-900 font-sans">4.5+ Stars</option>
                <option value="4" className="text-gray-900 font-sans">4+ Stars</option>
                <option value="3" className="text-gray-900 font-sans">3+ Stars</option>
              </select>
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-1.5 h-1.5 rounded-full ${activeRating > 0 ? 'bg-white' : 'bg-gray-300'}`} />
            </div>

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
                title="Clear Filters"
              >
                <X size={16} />
              </button>
            )}
            
            {/* Spacing element to prevent cutting off the last item */}
            <div className="flex-shrink-0 w-4" />
          </div>
        </div>
      </section>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredVendors.map(vendor => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>

      {/* Empty State */}
      {filteredVendors.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="max-w-xs mx-auto space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-900">No matches found</h3>
            <p className="text-gray-500 text-sm font-medium">Try adjusting your filters to find your perfect party partner.</p>
            <button 
              onClick={resetFilters}
              className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
