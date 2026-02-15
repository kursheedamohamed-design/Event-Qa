import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Use process.env for environment variables to resolve "Property 'env' does not exist on type 'ImportMeta'" errors.
const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

// കീ ഉണ്ടെങ്കിൽ മാത്രം കണക്ഷൻ ഉണ്ടാക്കുക
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isProductionReady = !!supabase;

console.log(isProductionReady ? "✅ Supabase Connected" : "⚠️ Running in Offline/Local Mode");