
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, User, MapPin, Calendar, Settings, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import { getCurrentUser, logout } from '../services/authService.ts';
import { getPartners } from '../services/partnerService.ts';
import { Partner, PartnerStatus } from '../types.ts';
import VendorCard from '../components/VendorCard.tsx';

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [favorites, setFavorites] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      const allPartners = await getPartners();
      const favs = allPartners.filter(p => user.favorites.includes(p.id) && p.status === PartnerStatus.APPROVED);
      setFavorites(favs);
      setIsLoading(false);
    };
    loadData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700 text-left">
      <header className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
           <button onClick={handleLogout} className="p-3 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-2xl"><LogOut size={20} /></button>
        </div>
        <div className="w-24 h-24 rounded-[2rem] border-4 border-indigo-50 overflow-hidden shadow-xl">
          <img src={user.avatar} className="w-full h-full object-cover" />
        </div>
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user.name}</h1>
             <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Party Planner</span>
          </div>
          <p className="text-gray-500 font-medium">{user.email}</p>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <Heart className="text-pink-600 fill-pink-600" size={24} /> My Shortlist
          </h2>
          <Link to="/category/All" className="text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-1">Browse More <ChevronRight size={14} /></Link>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(partner => (
              <VendorCard key={partner.id} vendor={partner} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[3rem] border border-gray-100 border-dashed text-center space-y-6">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300"><Sparkles size={32} /></div>
             <div className="space-y-2">
                <h3 className="text-lg font-black text-gray-900">Your shortlist is empty</h3>
                <p className="text-gray-400 text-sm font-medium">Start exploring Qatar's best vendors to build your perfect party team.</p>
             </div>
             <Link to="/category/All" className="inline-flex px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Explore Vendors</Link>
          </div>
        )}
      </section>

      <section className="bg-indigo-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-black tracking-tight">Planning a Large Event?</h3>
            <p className="text-indigo-200 font-medium max-w-sm">Our premium concierge service can help you find exclusive venues and customized packages.</p>
            <button className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-black text-xs uppercase tracking-widest">Chat with an Expert</button>
         </div>
         <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </section>
    </div>
  );
};
