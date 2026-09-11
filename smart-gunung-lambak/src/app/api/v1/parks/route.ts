import { NextResponse } from 'next/server';
import { PARKS } from '@/lib/parks';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ parks: PARKS });
}
