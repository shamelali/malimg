import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData, ingestIotData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dashboard = await getDashboardData();
  return NextResponse.json({ devices: dashboard.iot });
}

// Hardware/edge ingest: ultrasonics, ammonia sensors, pool probes, smart locks.
export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, 'ranger');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 120 });
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      deviceId?: string;
      value?: string;
      metric?: string;
      battery?: number;
      status?: 'live' | 'warning' | 'offline';
    };
    if (!body.deviceId) return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    const device = await ingestIotData(body);
    return NextResponse.json({ device }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ingest failed' }, { status: 400 });
  }
}
