/**
 * API v1 - Leads endpoints
 * GET /api/v1/leads - Liste des leads
 * POST /api/v1/leads - Créer un lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest, rateLimitApiRequest, hasScope } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET /api/v1/leads
export async function GET(request: NextRequest) {
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
  const rateLimitResult = await rateLimitApiRequest(authResult.context, '/api/v1/leads');
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { 
        status: rateLimitResult.status,
        headers: rateLimitResult.headers,
      }
    );
  }

  // Paramètres de requête
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const status = searchParams.get('status');
  const funnel_id = searchParams.get('funnel_id');
  const variant = searchParams.get('variant');

  // Query Supabase
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);
  let query = supabase
    .from('leads')
    .select(`
      *,
      funnels (id, name, slug)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }
  if (funnel_id) {
    query = query.eq('funnel_id', funnel_id);
  }
  if (variant) {
    query = query.eq('variant', variant);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leads', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: data || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (count || 0) > offset + limit,
    },
  });
}

// POST /api/v1/leads
export async function POST(request: NextRequest) {
  // Authentification
  const authResult = await authenticateApiRequest(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  // Vérifier permissions
  if (!hasScope(authResult.context.api_key, 'write:leads')) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Required scope: write:leads' },
      { status: 403 }
    );
  }

  // Rate limiting
  const rateLimitResult = await rateLimitApiRequest(authResult.context, '/api/v1/leads');
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { 
        status: rateLimitResult.status,
        headers: rateLimitResult.headers,
      }
    );
  }

  try {
    const body = await request.json();
    
    // Validation
    if (!body.funnel_id || !body.data) {
      return NextResponse.json(
        { error: 'Missing required fields: funnel_id, data' },
        { status: 400 }
      );
    }

    // Créer le lead
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('leads')
      .insert({
        funnel_id: body.funnel_id,
        variant: body.variant || 'a',
        data: body.data,
        utm_params: body.utm_params || {},
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create lead', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Invalid request body', details: error.message },
      { status: 400 }
    );
  }
}

