import { NextRequest, NextResponse } from 'next/server';
import { stampCheckpointData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const forbidden = requireCapability(request, 'checkpoint');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 60 });
  if (limited) return limited;
  const { code } = await params;
  try {
    const checkpoint = await stampCheckpointData(code);
    return NextResponse.json({ checkpoint, pointsAwarded: 15 }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Checkpoint failed' }, { status: 400 });
  }
}
