
import React, { useState, useEffect } from 'react';
import { Heart, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Vendor, VendorStatus } from '../types.ts';
import { getCurrentUser } from '../services/authService.ts';
import { getVendors } from '../services/vendorService.ts';
import VendorCard from '../components/VendorCard.tsx';

export const ShortlistPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Vendor[]>([]);
  const user = getCurrentUser();

  // Fix: Handle async getVendors call
  useEffect(() => {
    if (user) {
      const loadFavs = async () => {
        const allVendors = await getVendors();
        const favs = allVendors.filter(v => user.favorites.includes(v.id) && v.status === VendorStatus.APPROVED);
        setFavorites(favs);
      };
      loadFavs();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-24 space-y-6">
        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mx-auto">
          <Heart size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900">Your Shortlist</h2>
          <p className="text-gray-500 text-sm font-medium">Login to save and view your favorite vendors.</p>
        </div>
        <Link to="/" className="inline-flex px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">
          Go To Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-indigo-600 transition-colors group text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Hub
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-pink-600 flex items-center justify-center text-white shadow-xl shadow-pink-100">
            <Heart size={28} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Shortlist</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{favorites.length} Vendors Saved</p>
          </div>
        </div>
      </header>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(vendor => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
            <Search size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-900">Nothing saved yet</h3>
            <p className="text-gray-500 text-sm font-medium px-8">Browse vendors and tap the heart icon to shortlist them for your party.</p>
          </div>
          <Link to="/category/All" className="inline-flex px-8 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-colors">
            Start Browsing
          </Link>
        </div>
      )}
    </div>
  );
};
