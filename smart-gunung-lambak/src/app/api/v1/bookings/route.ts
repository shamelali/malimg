import { NextRequest, NextResponse } from 'next/server';
import { createBookingData, getDashboardData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dashboard = await getDashboardData();
  return NextResponse.json({ bookings: dashboard.bookings });
}

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, 'booking');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 60 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const booking = await createBookingData(body);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create booking' }, { status: 400 });
  }
}
