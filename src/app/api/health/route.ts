/**
 * Health Check Endpoint
 *
 * Used by Docker healthcheck and monitoring systems
 * Returns 200 OK if service is healthy
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'gamma-klone-web',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Health Check] Database connection failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'gamma-klone-web',
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
