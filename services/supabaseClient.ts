import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * Vite environment variables access.
 * We use a safe check to avoid TypeScript errors during build.
 */
const env = (import.meta as any).env;
const supabaseUrl = (env?.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (env?.VITE_SUPABASE_ANON_KEY || '').trim();

// Initialize the client only if keys are present
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isProductionReady = !!supabase;

if (isProductionReady) {
  console.log("✅ Supabase Production Mode Active");
} else {
  console.warn("⚠️ Supabase Keys Missing: Running in Mock/Local mode. Google Login will not function.");
}