import { NextRequest, NextResponse } from 'next/server';
import { createSosData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, 'sos');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;
  const body = await request.json().catch(() => ({}));
  const payload = await createSosData(body);
  return NextResponse.json(
    { ...payload, dispatchedTo: ['MPK Kluang', 'APM', 'Klinik Kesihatan'], etaMinutes: payload.alert.etaMinutes },
    { status: 201 }
  );
}
