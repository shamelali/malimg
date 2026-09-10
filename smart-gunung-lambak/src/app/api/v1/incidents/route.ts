import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData, reportIncidentData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { requireCapability } from '@/lib/serverAuth';
import type { Incident } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dashboard = await getDashboardData();
  return NextResponse.json({ incidents: dashboard.incidents });
}

export async function POST(request: NextRequest) {
  // Visitors and staff can all report safety/wildlife incidents.
  const forbidden = requireCapability(request, 'sos');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 30 });
  if (limited) return limited;

  try {
    const body = (await request.json()) as Partial<Incident> & { reportedBy?: string };
    const incident = await reportIncidentData({
      type: body.type,
      severity: body.severity,
      titleEn: body.titleEn,
      titleBm: body.titleBm,
      zone: body.zone,
      latitude: body.latitude,
      longitude: body.longitude,
      reportedBy: body.reportedBy
    });
    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to report incident' }, { status: 400 });
  }
}
