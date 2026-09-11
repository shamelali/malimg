import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData, updateTaskData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dashboard = await getDashboardData();
  return NextResponse.json({ tasks: dashboard.tasks });
}

export async function PATCH(request: NextRequest) {
  const forbidden = requireCapability(request, 'ranger');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 120 });
  if (limited) return limited;

  try {
    const body = (await request.json()) as { id?: string; completed?: boolean };
    if (!body.id) return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    const task = await updateTaskData(body.id, Boolean(body.completed));
    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update task' }, { status: 400 });
  }
}
