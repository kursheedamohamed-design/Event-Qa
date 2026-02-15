
import { Partner, PartnerStatus } from '../types.ts';
import { MOCK_VENDORS } from '../data/mockData.ts';
import { supabase } from './supabaseClient.ts';
import { getCurrentUser } from './authService.ts';

const STORAGE_KEY = 'qatar_party_hub_partners';

export const getPartners = async (): Promise<Partner[]> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) return [];
    return data as Partner[];
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = MOCK_VENDORS.map(v => ({ 
      ...v, 
      ownerId: 'system', // Default mock data owner
      status: PartnerStatus.APPROVED,
      whatsappClicks: 0, 
      profileViews: 0 
    })) as Partner[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

export const getPartnerById = async (id: string): Promise<Partner | null> => {
  const partners = await getPartners();
  return partners.find(p => p.id === id) || null;
};

// Filter partners by the current logged-in user
export const getMyPartnerProfile = async (): Promise<Partner | null> => {
  const user = getCurrentUser();
  if (!user) return null;
  
  const allPartners = await getPartners();
  return allPartners.find(p => p.ownerId === user.id) || null;
};

export const savePartner = async (partnerData: Omit<Partner, 'id' | 'status' | 'createdAt' | 'ownerId'>): Promise<Partner | null> => {
  const user = getCurrentUser();
  if (!user) throw new Error("Authentication required to list a service");

  const newPartner: Partner = {
    ...partnerData,
    id: Math.random().toString(36).substr(2, 9),
    ownerId: user.id,
    status: PartnerStatus.PENDING,
    createdAt: Date.now(),
    verified: false,
    featured: false,
    whatsappClicks: 0,
    profileViews: 0,
    isWhatsAppVerified: true // Set to true by default since we removed verification
  };

  if (supabase) {
    const { data, error } = await supabase.from('partners').insert([newPartner]).select();
    if (error) return null;
    return data[0] as Partner;
  }

  const partners = await getPartners();
  const updated = [...partners, newPartner];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newPartner;
};

export const updatePartner = async (id: string, updates: Partial<Partner>): Promise<void> => {
  if (supabase) {
    await supabase.from('partners').update(updates).eq('id', id);
    return;
  }

  const partners = await getPartners();
  const updated = partners.map((p) => p.id === id ? { ...p, ...updates } : p);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const updatePartnerStatus = async (id: string, status: PartnerStatus): Promise<void> => {
  await updatePartner(id, { status });
};

export const togglePartnerVerification = async (id: string): Promise<void> => {
  const partner = await getPartnerById(id);
  if (partner) {
    await updatePartner(id, { verified: !partner.verified });
  }
};

export const incrementPartnerView = async (id: string): Promise<void> => {
  const partners = await getPartners();
  const partner = partners.find(p => p.id === id);
  if (partner) {
    await updatePartner(id, { profileViews: (partner.profileViews || 0) + 1 });
  }
};

export const incrementPartnerWhatsAppClick = async (id: string): Promise<void> => {
  const partners = await getPartners();
  const partner = partners.find(p => p.id === id);
  if (partner) {
    await updatePartner(id, { whatsappClicks: (partner.whatsappClicks || 0) + 1 });
  }
};

export const deletePartner = async (id: string): Promise<void> => {
  if (supabase) {
    await supabase.from('partners').delete().eq('id', id);
    return;
  }
  const partners = await getPartners();
  const updated = partners.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
