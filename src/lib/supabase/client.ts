import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Validation des variables d'environnement
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.includes('xxxxx') || anonKey.includes('your-')) {
    console.error('❌ Supabase configuration invalide. Vérifiez votre fichier .env.local');
    throw new Error('Supabase non configuré. Consultez le README pour les instructions.');
  }

  return createBrowserClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      fetch: (url, options = {}) => {
        // Ajouter timeout et retry
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        return fetch(url, {
          ...options,
          signal: controller.signal,
        })
          .then((response) => {
            clearTimeout(timeout);
            return response;
          })
          .catch((error) => {
            clearTimeout(timeout);
            console.error('🔴 Supabase fetch error:', {
              url,
              error: error.message,
              timestamp: new Date().toISOString(),
            });
            throw error;
          });
      },
    },
  });
}

