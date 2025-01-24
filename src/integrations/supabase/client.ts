import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { env } from '@/lib/config';

// Create Supabase client with validated environment variables
export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': `southern-savor-collective@${import.meta.env.PACKAGE_VERSION || '1.0.0'}`
      },
    },
  }
);

// Error handler for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any sensitive data from localStorage
    localStorage.removeItem('lastRoute');
    localStorage.removeItem('recipe_api_rate_limit');
  }
});

// Export typed helpers
export type SupabaseClient = typeof supabase;
