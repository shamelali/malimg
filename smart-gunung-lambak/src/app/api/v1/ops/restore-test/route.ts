import { NextRequest, NextResponse } from 'next/server';
import { getRestoreTestData, runRestoreTestData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { getRole, requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ restoreTest: await getRestoreTestData() });
}

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, 'admin');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 10 });
  if (limited) return limited;

  const result = await runRestoreTestData(getRole(request));
  return NextResponse.json({ restoreTest: result }, { status: 201 });
}
