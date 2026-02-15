import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * Environment variables access.
 * Using process.env to resolve TypeScript errors and align with the project's environment configuration.
 */
// @ts-ignore - process.env is provided by the environment
const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
// @ts-ignore - process.env is provided by the environment
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Initialize the client only if both keys are present
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isProductionReady = !!supabase;

console.log(isProductionReady ? "✅ Supabase Connected" : "⚠️ Supabase Keys Missing (Running in Local/Mock Mode)");