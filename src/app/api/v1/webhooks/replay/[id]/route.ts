/**
 * API v1 - Webhook Replay endpoint
 * POST /api/v1/webhooks/replay/:id - Replay un webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest, rateLimitApiRequest, hasScope } from '@/lib/api-auth';
import { getWebhookManager } from '@/lib/webhook-manager';

// POST /api/v1/webhooks/replay/:id
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  // Authentification
  const authResult = await authenticateApiRequest(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  // Vérifier permissions
  if (!hasScope(authResult.context.api_key, 'write:webhooks')) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Required scope: write:webhooks' },
      { status: 403 }
    );
  }

  // Rate limiting
  const rateLimitResult = await rateLimitApiRequest(authResult.context, '/api/v1/webhooks/replay');
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
    const webhookManager = getWebhookManager();
    const result = await webhookManager.replayWebhook(resolvedParams.id);

    return NextResponse.json({ data: result });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to replay webhook', details: error.message },
      { status: 500 }
    );
  }
}

