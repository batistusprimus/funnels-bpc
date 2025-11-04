/**
 * API v1 - OpenAPI Spec endpoint
 * GET /api/v1/docs - Retourne la spec OpenAPI
 */

import { NextResponse } from 'next/server';
import { openApiSpec } from '@/lib/openapi-spec';

export async function GET() {
  return NextResponse.json(openApiSpec);
}

