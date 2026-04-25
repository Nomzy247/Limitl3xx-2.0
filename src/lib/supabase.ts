import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const isValid = (val: any): boolean => {
      if (!val) return false;
      const s = String(val).trim();
      return s !== '' && s !== 'undefined' && s !== 'null';
    };

    if (!isValid(supabaseUrl) || !isValid(supabaseAnonKey)) {
      console.warn('Supabase configuration is missing. Real-time database features will be unavailable.');
      return null;
    }

    supabaseInstance = createClient(supabaseUrl as string, supabaseAnonKey as string);
    return supabaseInstance;
  } catch (error) {
    console.error('Supabase initialization failed:', error);
    return null;
  }
};

// For compatibility, we'll keep getSupabase() but stop using the module-level constant
// Application code should call getSupabase() to get the client instance.
