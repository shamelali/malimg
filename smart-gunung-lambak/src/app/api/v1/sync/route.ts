import { NextRequest, NextResponse } from 'next/server';
import { syncOfflineQueueData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, 'ranger');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 30 });
  if (limited) return limited;
  return NextResponse.json(await syncOfflineQueueData());
}
