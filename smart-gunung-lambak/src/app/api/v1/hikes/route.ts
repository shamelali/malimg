import { NextRequest, NextResponse } from 'next/server';
import { getHikesData, recordHikeData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hikes = await getHikesData();
  return NextResponse.json({ hikes });
}

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, 'hike');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 60 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const result = await recordHikeData(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save hike' }, { status: 400 });
  }
}
