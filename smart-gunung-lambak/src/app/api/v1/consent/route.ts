import { NextRequest, NextResponse } from 'next/server';
import { getConsentStatsData, recordConsentData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const forbidden = requireCapability(request, 'reports');
  if (forbidden) return forbidden;
  return NextResponse.json({ consent: await getConsentStatsData() });
}

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, 'hike');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 30 });
  if (limited) return limited;

  const body = (await request.json().catch(() => ({}))) as { accepted?: boolean; scope?: string };
  const record = await recordConsentData(Boolean(body.accepted), body.scope ?? 'pdpa-v1', 'Visitor app');
  return NextResponse.json({ consent: record }, { status: 201 });
}
