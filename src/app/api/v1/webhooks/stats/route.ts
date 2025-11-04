/**
 * API v1 - Webhook Stats endpoint
 * GET /api/v1/webhooks/stats - Statistiques des webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest, rateLimitApiRequest, hasScope } from '@/lib/api-auth';
import { getWebhookManager } from '@/lib/webhook-manager';

// GET /api/v1/webhooks/stats
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
  if (!hasScope(authResult.context.api_key, 'read:webhooks')) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Required scope: read:webhooks' },
      { status: 403 }
    );
  }

  // Rate limiting
  const rateLimitResult = await rateLimitApiRequest(authResult.context, '/api/v1/webhooks/stats');
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { 
        status: rateLimitResult.status,
        headers: rateLimitResult.headers,
      }
    );
  }

  // Paramètres
  const { searchParams } = new URL(request.url);
  const routing_rule_id = searchParams.get('routing_rule_id');
  const days = parseInt(searchParams.get('days') || '7');

  if (!routing_rule_id) {
    return NextResponse.json(
      { error: 'Missing required parameter: routing_rule_id' },
      { status: 400 }
    );
  }

  try {
    const webhookManager = getWebhookManager();
    const stats = await webhookManager.getWebhookStats(routing_rule_id, days);

    return NextResponse.json({ data: stats });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch webhook stats', details: error.message },
      { status: 500 }
    );
  }
}

