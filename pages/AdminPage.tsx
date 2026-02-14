
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Eye, Trash2, ShieldCheck, Sparkles, MessageCircle, Lock, TrendingUp, Users, Clock, Rocket, ExternalLink, Database, Key, Server, Loader2 } from 'lucide-react';
import { Vendor, VendorStatus } from '../types.ts';
import { getVendors, updateVendorStatus, deleteVendor, toggleVendorVerification } from '../services/vendorService.ts';
import { isProductionReady } from '../services/supabaseClient.ts';

export const AdminPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<'vendors' | 'checklist'>('vendors');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadVendors();
    }
  }, [isAuthenticated]);

  const loadVendors = async () => {
    setIsLoading(true);
    const data = await getVendors();
    setVendors(data.sort((a, b) => b.createdAt - a.createdAt));
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '2025') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Passcode');
    }
  };

  const handleStatusChange = async (id: string, status: VendorStatus) => {
    await updateVendorStatus(id, status);
    loadVendors();
  };

  const handleToggleVerification = async (id: string) => {
    await toggleVendorVerification(id);
    loadVendors();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      await deleteVendor(id);
      loadVendors();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl space-y-6 text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-xl">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">Admin Access</h2>
            <p className="text-gray-400 text-sm font-medium">Enter secure passcode to continue.</p>
          </div>
          <input 
            type="password" 
            placeholder="••••" 
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-center text-2xl font-black tracking-[0.5em] outline-none border border-gray-100 focus:ring-2 focus:ring-indigo-500"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoFocus
          />
          <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black active:scale-95 transition-all">ENTER PANEL</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
             <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isProductionReady ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                <Server size={10} /> {isProductionReady ? 'Supabase Connected' : 'Local Mode'}
             </div>
          </div>
          <p className="text-gray-500 font-medium">Manage the Qatar Party Hub network.</p>
        </div>
        
        <div className="flex bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
          <button onClick={() => setActiveTab('vendors')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vendors' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Partners</button>
          <button onClick={() => setActiveTab('checklist')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'checklist' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Launch Guide</button>
        </div>
      </header>

      {activeTab === 'vendors' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 text-indigo-600 mb-2">
                <Users size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Partners</span>
              </div>
              <div className="text-3xl font-black text-gray-900">{vendors.length}</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm border-l-4 border-l-green-500">
              <div className="flex items-center gap-3 text-green-600 mb-2">
                <TrendingUp size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Services</span>
              </div>
              <div className="text-3xl font-black text-gray-900">{vendors.filter(v => v.status === VendorStatus.APPROVED).length}</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm border-l-4 border-l-amber-500">
              <div className="flex items-center gap-3 text-amber-600 mb-2">
                <Clock size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Review Required</span>
              </div>
              <div className="text-3xl font-black text-gray-900">{vendors.filter(v => v.status === VendorStatus.PENDING).length}</div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm overflow-x-auto">
            {isLoading ? (
               <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-200" /></div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5">Partner</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Verification</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={v.images[0]} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                          <div>
                            <div className="font-black text-gray-900 flex items-center gap-1.5">{v.name}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{v.category} • {v.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          v.status === VendorStatus.APPROVED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {v.status}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <button 
                            onClick={() => handleToggleVerification(v.id)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                              v.verified ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {v.verified ? 'Verified ✓' : 'Verify'}
                          </button>
                      </td>
                      <td className="px-8 py-6 text-right space-x-1">
                        {v.status === VendorStatus.PENDING && (
                          <button onClick={() => handleStatusChange(v.id, VendorStatus.APPROVED)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle2 size={22} /></button>
                        )}
                        <button onClick={() => handleDelete(v.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2"><Rocket className="text-indigo-600" /> Auto-Setup Guide</h3>
            <div className="space-y-4">
               <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-900 leading-relaxed">
                    1. Supabase അക്കൗണ്ട് തുറക്കുക.<br/>
                    2. SQL Editor-ൽ `setup.sql` ഫയലിലെ കോഡ് പേസ്റ്റ് ചെയ്ത് റൺ ചെയ്യുക.<br/>
                    3. Vercel Settings-ൽ Supabase Keys നൽകുക.
                  </p>
               </div>
               {/* Previous Checklist remains... */}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
