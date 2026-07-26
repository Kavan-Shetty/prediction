import { createClient } from '@supabase/supabase-js';

// Safe fallbacks to prevent Vercel blank screen if environment variables are not set yet
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('Supabase credentials missing. Running in mock/demo mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
