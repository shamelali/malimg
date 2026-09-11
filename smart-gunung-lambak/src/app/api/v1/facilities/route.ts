import { NextRequest, NextResponse } from 'next/server';
import { cycleFacilityStatusData, getDashboardData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dashboard = await getDashboardData();
  return NextResponse.json({ facilities: dashboard.facilities });
}

export async function PATCH(request: NextRequest) {
  const forbidden = requireCapability(request, 'ranger');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 60 });
  if (limited) return limited;

  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) return NextResponse.json({ error: 'Facility id is required' }, { status: 400 });
    const facility = await cycleFacilityStatusData(body.id);
    return NextResponse.json({ facility });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update facility' }, { status: 400 });
  }
}
