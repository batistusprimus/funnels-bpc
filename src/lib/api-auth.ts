/**
 * API Authentication & Rate Limiting
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface ApiKey {
  id: string;
  key_hash: string;
  key_preview: string;
  name: string;
  description?: string;
  scopes: string[];
  rate_limit_per_minute: number;
  rate_limit_per_hour: number;
  last_used_at?: string;
  total_requests: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface ApiContext {
  api_key: ApiKey;
  ip_address?: string;
}

// Générer une nouvelle API key
export function generateApiKey(): { key: string; hash: string; preview: string } {
  const key = `bpc_${crypto.randomBytes(32).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const preview = `${key.substring(0, 11)}...${key.slice(-8)}`;
  
  return { key, hash, preview };
}

// Vérifier une API key
export async function verifyApiKey(
  apiKey: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<ApiKey | null> {
  if (!apiKey || !apiKey.startsWith('bpc_')) {
    return null;
  }

  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', hash)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  const key = data as ApiKey;

  // Vérifier expiration
  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    return null;
  }

  // Mettre à jour last_used_at et total_requests
  await supabase
    .from('api_keys')
    .update({
      last_used_at: new Date().toISOString(),
      total_requests: key.total_requests + 1,
    })
    .eq('id', key.id);

  return key;
}

// Vérifier les permissions (scopes)
export function hasScope(apiKey: ApiKey, requiredScope: string): boolean {
  return apiKey.scopes.includes(requiredScope) || apiKey.scopes.includes('*');
}

// Rate limiting
export async function checkRateLimit(
  apiKey: ApiKey,
  endpoint: string,
  ipAddress: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ allowed: boolean; remaining: number; reset_at: Date }> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const now = new Date();

  // Vérifier rate limit par minute
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const { count: countMinute } = await supabase
    .from('api_rate_limit_log')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', apiKey.id)
    .gte('created_at', oneMinuteAgo.toISOString());

  if ((countMinute || 0) >= apiKey.rate_limit_per_minute) {
    const resetAt = new Date(oneMinuteAgo.getTime() + 60 * 1000);
    return {
      allowed: false,
      remaining: 0,
      reset_at: resetAt,
    };
  }

  // Vérifier rate limit par heure
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const { count: countHour } = await supabase
    .from('api_rate_limit_log')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', apiKey.id)
    .gte('created_at', oneHourAgo.toISOString());

  if ((countHour || 0) >= apiKey.rate_limit_per_hour) {
    const resetAt = new Date(oneHourAgo.getTime() + 60 * 60 * 1000);
    return {
      allowed: false,
      remaining: 0,
      reset_at: resetAt,
    };
  }

  // Logger la requête
  await supabase.from('api_rate_limit_log').insert({
    api_key_id: apiKey.id,
    endpoint,
    ip_address: ipAddress,
  });

  return {
    allowed: true,
    remaining: apiKey.rate_limit_per_minute - (countMinute || 0) - 1,
    reset_at: new Date(oneMinuteAgo.getTime() + 60 * 1000),
  };
}

// Middleware Next.js pour authentifier les requêtes API
export async function authenticateApiRequest(
  request: Request
): Promise<{ success: true; context: ApiContext } | { success: false; error: string; status: number }> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return {
      success: false,
      error: 'Missing Authorization header',
      status: 401,
    };
  }

  // Format: "Bearer bpc_xxxxx"
  const [type, token] = authHeader.split(' ');
  
  if (type !== 'Bearer' || !token) {
    return {
      success: false,
      error: 'Invalid Authorization format. Use: Bearer <api_key>',
      status: 401,
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const apiKey = await verifyApiKey(token, supabaseUrl, supabaseKey);
  
  if (!apiKey) {
    return {
      success: false,
      error: 'Invalid or expired API key',
      status: 401,
    };
  }

  // Récupérer l'IP
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') || 
                   'unknown';

  return {
    success: true,
    context: {
      api_key: apiKey,
      ip_address: ipAddress,
    },
  };
}

// Middleware pour vérifier le rate limit
export async function rateLimitApiRequest(
  context: ApiContext,
  endpoint: string
): Promise<{ allowed: true } | { allowed: false; error: string; status: number; headers: Record<string, string> }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const rateLimit = await checkRateLimit(
    context.api_key,
    endpoint,
    context.ip_address || 'unknown',
    supabaseUrl,
    supabaseKey
  );

  if (!rateLimit.allowed) {
    return {
      allowed: false,
      error: 'Rate limit exceeded',
      status: 429,
      headers: {
        'X-RateLimit-Limit': context.api_key.rate_limit_per_minute.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimit.reset_at.toISOString(),
        'Retry-After': Math.ceil((rateLimit.reset_at.getTime() - Date.now()) / 1000).toString(),
      },
    };
  }

  return { allowed: true };
}

// Créer une nouvelle API key
export async function createApiKey(
  name: string,
  description: string,
  scopes: string[],
  options?: {
    rate_limit_per_minute?: number;
    rate_limit_per_hour?: number;
    expires_at?: Date;
  }
): Promise<{ api_key: ApiKey; key: string }> {
  const { key, hash, preview } = generateApiKey();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      key_hash: hash,
      key_preview: preview,
      name,
      description,
      scopes,
      rate_limit_per_minute: options?.rate_limit_per_minute || 60,
      rate_limit_per_hour: options?.rate_limit_per_hour || 1000,
      expires_at: options?.expires_at?.toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create API key: ${error?.message}`);
  }

  return {
    api_key: data as ApiKey,
    key, // Retourner la clé en clair (une seule fois)
  };
}

