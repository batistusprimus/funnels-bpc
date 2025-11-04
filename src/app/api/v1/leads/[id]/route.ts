/**
 * API v1 - Single Lead endpoints
 * GET /api/v1/leads/:id - Récupérer un lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest, rateLimitApiRequest, hasScope } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET /api/v1/leads/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Authentification
  const authResult = await authenticateApiRequest(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  // Vérifier permissions
  if (!hasScope(authResult.context.api_key, 'read:leads')) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Required scope: read:leads' },
      { status: 403 }
    );
  }

  // Rate limiting
  const rateLimitResult = await rateLimitApiRequest(authResult.context, '/api/v1/leads/:id');
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { 
        status: rateLimitResult.status,
        headers: rateLimitResult.headers,
      }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      funnels (id, name, slug)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Lead not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data });
}

