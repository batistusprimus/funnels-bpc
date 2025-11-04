import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isConfigured } from '@/lib/env';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      env: false,
      database: false,
    },
  };

  try {
    // Check 1: Variables d'environnement
    health.checks.env = isConfigured();

    // Check 2: Connexion base de données
    if (health.checks.env) {
      const supabase = await createClient();
      const { error } = await supabase
        .from('funnels')
        .select('id')
        .limit(1);

      health.checks.database = !error;
    }

    // Statut global
    const allChecksPass = Object.values(health.checks).every((check) => check === true);
    health.status = allChecksPass ? 'ok' : 'degraded';

    return NextResponse.json(health, { 
      status: allChecksPass ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ...health,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

