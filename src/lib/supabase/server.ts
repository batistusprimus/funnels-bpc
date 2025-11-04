import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const missingConfigMessage = 'Supabase non configuré. Consultez le README pour les instructions.';

function createErrorClient(): SupabaseClient<Database> {
  const thrower = () => {
    throw new Error(missingConfigMessage);
  };

  return new Proxy(thrower as unknown as SupabaseClient<Database>, {
    get() {
      return thrower;
    },
    apply() {
      return thrower();
    },
  });
}

let hasLoggedMissingConfig = false;

export async function createClient() {
  const cookieStore = await cookies();

  // Validation des variables d'environnement
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.includes('xxxxx') || anonKey.includes('your-')) {
    if (!hasLoggedMissingConfig) {
      console.error('❌ [Server] Supabase configuration invalide. Vérifiez votre fichier .env.local');
      hasLoggedMissingConfig = true;
    }
    return createErrorClient();
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
          console.warn('⚠️ [Server] Cannot set cookies from Server Component', error);
        }
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
}

