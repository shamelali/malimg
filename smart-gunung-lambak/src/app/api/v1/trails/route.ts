import { NextResponse } from 'next/server';
import { getTrailsData } from '@/lib/dataService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const payload = await getTrailsData();
  return NextResponse.json(payload);
}
