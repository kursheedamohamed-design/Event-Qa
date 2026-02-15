import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Using NEXT_PUBLIC_ prefix as configured in Vercel settings
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// Initialize the client only if keys are present
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isProductionReady = !!supabase;

console.log(isProductionReady ? "✅ Supabase Connected (Production Mode)" : "⚠️ Supabase Keys Missing (Local Mode)");