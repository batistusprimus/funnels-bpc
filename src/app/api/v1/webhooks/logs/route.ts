/**
 * API v1 - Webhook Logs endpoints
 * GET /api/v1/webhooks/logs - Liste des logs de webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest, rateLimitApiRequest, hasScope } from '@/lib/api-auth';
import { getWebhookManager } from '@/lib/webhook-manager';

// GET /api/v1/webhooks/logs
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
  const rateLimitResult = await rateLimitApiRequest(authResult.context, '/api/v1/webhooks/logs');
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
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!routing_rule_id) {
    return NextResponse.json(
      { error: 'Missing required parameter: routing_rule_id' },
      { status: 400 }
    );
  }

  try {
    const webhookManager = getWebhookManager();
    const result = await webhookManager.getWebhookLogs(routing_rule_id, {
      limit,
      offset,
      status: status as any,
    });

    return NextResponse.json({
      data: result.logs,
      pagination: {
        total: result.total,
        limit,
        offset,
        has_more: result.total > offset + limit,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch webhook logs', details: error.message },
      { status: 500 }
    );
  }
}

