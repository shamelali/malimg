import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  let database = 'seeded-memory';

  if (isDatabaseConfigured && db) {
    try {
      await db.execute(sql`SELECT 1 AS ok`);
      database = 'postgresql-ok';
    } catch (error) {
      database = 'postgresql-error';
      return NextResponse.json(
        {
          status: 'degraded',
          service: 'smart-gunung-lambak',
          time: new Date().toISOString(),
          database,
          error: error instanceof Error ? error.message : 'Database health check failed',
          region: 'ap-southeast-1'
        },
        { status: 503 }
      );
    }
  }

  return NextResponse.json({
    status: 'ok',
    service: 'smart-gunung-lambak',
    time: new Date().toISOString(),
    database,
    region: 'ap-southeast-1'
  });
}
