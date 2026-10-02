import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

let supabaseClient: SupabaseClient | null = null;

if (ENV.SUPABASE_URL && ENV.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabaseClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log('[Supabase] Initialized successfully with Service Role Key');
  } catch (error) {
    console.warn('[Supabase] Initialization warning:', error);
  }
} else {
  console.log('[Supabase] Supabase credentials not configured. Using local backend storage & database engine.');
}

export const getSupabase = (): SupabaseClient | null => supabaseClient;
