
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Vercel-ൽ സെറ്റ് ചെയ്യുന്ന എൻവയോൺമെന്റ് വേരിയബിളുകൾ ഇവിടെ റീഡ് ചെയ്യും.
const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

// കീ ഉണ്ടെങ്കിൽ മാത്രം കണക്ഷൻ ഉണ്ടാക്കുക, ഇല്ലെങ്കിൽ null റിട്ടേൺ ചെയ്യും.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isProductionReady = !!supabase;

console.log(isProductionReady ? "✅ Supabase Connected" : "⚠️ Running in Offline/Local Mode");
