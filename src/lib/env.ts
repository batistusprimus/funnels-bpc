import { z } from 'zod';

// Schéma de validation des variables d'environnement
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().refine(
    (url) => !url.includes('xxxxx'),
    'URL Supabase invalide - vérifiez votre .env.local'
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(50).refine(
    (key) => !key.includes('your-'),
    'Clé Supabase invalide - vérifiez votre .env.local'
  ),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(50).refine(
    (key) => !key.includes('your-'),
    'Clé service role Supabase invalide - vérifiez votre .env.local'
  ).optional(),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  
  // Node env
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

// Valider les variables d'environnement au démarrage
export function validateEnv(): Env {
  try {
    const env = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    });

    console.log('✅ Variables d\'environnement validées');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erreur de configuration:');
      error.issues.forEach((err: any) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Variables d\'environnement invalides. Consultez le README.');
    }
    throw error;
  }
}

// Vérifier si l'app est configurée
export function isConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) return false;
  if (url.includes('xxxxx') || anonKey.includes('your-')) return false;
  
  return true;
}

