import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogData } from '@/lib/dataService';
import { requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

function csvEscape(value: unknown) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(request: NextRequest) {
  const forbidden = requireCapability(request, 'reports');
  if (forbidden) return forbidden;

  const logs = await getAuditLogData();
  const format = request.nextUrl.searchParams.get('format') ?? 'csv';

  if (format === 'json') return NextResponse.json({ logs });

  const header = 'timestamp,actor,action,ip,result';
  const rows = logs.map((log) => [log.timestamp, log.actor, log.action, log.ip, log.result].map(csvEscape).join(','));
  const csv = [header, ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="smart-lambak-audit-log.csv"'
    }
  });
}
