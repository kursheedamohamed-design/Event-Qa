
import { Vendor, VendorStatus } from '../types';
import { MOCK_VENDORS } from '../data/mockData';
import { supabase } from './supabaseClient.ts';

const STORAGE_KEY = 'qatar_party_hub_vendors';

/**
 * 🤖 AUTO-SWITCH LOGIC:
 * Supabase കീ ഉണ്ടെങ്കിൽ അത് ഉപയോഗിക്കും, ഇല്ലെങ്കിൽ LocalStorage ഉപയോഗിക്കും.
 */

export const getVendors = async (): Promise<Vendor[]> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error("Supabase Error:", error);
      return [];
    }
    return data as Vendor[];
  }

  // Fallback to LocalStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = MOCK_VENDORS.map(v => ({ ...v, whatsappClicks: 0, profileViews: 0 }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

// Fix: Add getVendorById exported function
export const getVendorById = async (id: string): Promise<Vendor | null> => {
  const vendors = await getVendors();
  return vendors.find(v => v.id === id) || null;
};

export const saveVendor = async (vendor: Omit<Vendor, 'id' | 'status' | 'createdAt'>): Promise<Vendor | null> => {
  const newVendor: Vendor = {
    ...vendor,
    id: Math.random().toString(36).substr(2, 9),
    status: VendorStatus.PENDING,
    createdAt: Date.now(),
    verified: false,
    featured: false,
    whatsappClicks: 0,
    profileViews: 0,
    isWhatsAppVerified: true // Default to true
  };

  if (supabase) {
    const { data, error } = await supabase.from('vendors').insert([newVendor]).select();
    if (error) {
      console.error("Supabase Save Error:", error);
      return null;
    }
    return data[0] as Vendor;
  }

  // LocalStorage Fallback
  const vendors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const updated = [...vendors, newVendor];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newVendor;
};

export const updateVendor = async (id: string, updates: Partial<Vendor>): Promise<void> => {
  if (supabase) {
    await supabase.from('vendors').update(updates).eq('id', id);
    return;
  }

  const vendors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const updated = vendors.map((v: any) => v.id === id ? { ...v, ...updates } : v);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

// Fix: Add updateVendorStatus helper
export const updateVendorStatus = async (id: string, status: VendorStatus): Promise<void> => {
  await updateVendor(id, { status });
};

// Fix: Add toggleVendorVerification helper
export const toggleVendorVerification = async (id: string): Promise<void> => {
  const vendors = await getVendors();
  const v = vendors.find(item => item.id === id);
  if (v) {
    await updateVendor(id, { verified: !v.verified });
  }
};

export const incrementView = async (id: string): Promise<void> => {
  if (supabase) {
    // Supabase RPC for incrementing values is best, but simple update works for now
    const { data: v } = await supabase.from('vendors').select('profileViews').eq('id', id).single();
    await supabase.from('vendors').update({ profileViews: (v?.profileViews || 0) + 1 }).eq('id', id);
    return;
  }
  
  const vendors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const updated = vendors.map((v: any) => v.id === id ? { ...v, profileViews: (v.profileViews || 0) + 1 } : v);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

// Fix: Add incrementWhatsAppClick exported function
export const incrementWhatsAppClick = async (id: string): Promise<void> => {
  if (supabase) {
    const { data: v } = await supabase.from('vendors').select('whatsappClicks').eq('id', id).single();
    await supabase.from('vendors').update({ whatsappClicks: (v?.whatsappClicks || 0) + 1 }).eq('id', id);
    return;
  }
  
  const vendors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const updated = vendors.map((v: any) => v.id === id ? { ...v, whatsappClicks: (v.whatsappClicks || 0) + 1 } : v);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteVendor = async (id: string): Promise<void> => {
  if (supabase) {
    await supabase.from('vendors').delete().eq('id', id);
    return;
  }
  const vendors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const updated = vendors.filter((v: any) => v.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
