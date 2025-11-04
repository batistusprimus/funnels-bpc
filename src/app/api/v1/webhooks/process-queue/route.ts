/**
 * API v1 - Process Webhook Queue (Cron endpoint)
 * POST /api/v1/webhooks/process-queue - Process la queue des webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWebhookManager } from '@/lib/webhook-manager';

// Protection: Vérifier que c'est un cron job
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';
  
  return authHeader === `Bearer ${cronSecret}`;
}

// POST /api/v1/webhooks/process-queue
export async function POST(request: NextRequest) {
  // Vérifier l'authentification
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const webhookManager = getWebhookManager();
    await webhookManager.processQueue();

    return NextResponse.json({
      success: true,
      message: 'Queue processed successfully',
    });

  } catch (error: any) {
    console.error('Error processing webhook queue:', error);
    return NextResponse.json(
      { error: 'Failed to process queue', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint pour vérifier le statut (dev only)
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  return NextResponse.json({
    message: 'Webhook queue processor endpoint',
    usage: 'POST /api/v1/webhooks/process-queue with Authorization: Bearer <CRON_SECRET>',
  });
}

