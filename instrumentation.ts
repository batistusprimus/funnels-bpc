export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
    console.log('🔧 Server instrumentation initialized');
    
    // Ajouter Sentry en production
    // const Sentry = await import('@sentry/nextjs');
    // Sentry.init({ dsn: process.env.SENTRY_DSN });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    console.log('🔧 Edge instrumentation initialized');
  }
}

export async function onRequestError(
  err: Error,
  request: {
    path: string;
    method: string;
    headers: Headers;
  }
) {
  console.error('🔴 Request error:', {
    error: err.message,
    path: request.path,
    method: request.method,
    timestamp: new Date().toISOString(),
  });

  // En production, envoyer à Sentry
  // Sentry.captureException(err, { extra: { request } });
}

