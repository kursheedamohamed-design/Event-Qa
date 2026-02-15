import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Vite-ൽ എൻവയോൺമെന്റ് വേരിയബിളുകൾ ഇങ്ങനെയാണ് വിളിക്കേണ്ടത്
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// കീ ഉണ്ടെങ്കിൽ മാത്രം കണക്ഷൻ ഉണ്ടാക്കുക
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isProductionReady = !!supabase;

console.log(isProductionReady ? "✅ Supabase Connected" : "⚠️ Running in Offline/Local Mode");