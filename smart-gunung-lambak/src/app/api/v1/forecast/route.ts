import { NextResponse } from 'next/server';
import { getForecastData } from '@/lib/dataService';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await getForecastData());
}
