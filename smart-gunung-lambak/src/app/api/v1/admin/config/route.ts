import { NextRequest, NextResponse } from 'next/server';
import { getConfigData, updateConfigData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { getRole, requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const forbidden = requireCapability(request, 'admin');
  if (forbidden) return forbidden;
  return NextResponse.json({ config: await getConfigData() });
}

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, 'admin');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 30 });
  if (limited) return limited;

  const body = (await request.json().catch(() => ({}))) as Record<string, number>;
  const config = await updateConfigData(body, getRole(request));
  return NextResponse.json({ config });
}
