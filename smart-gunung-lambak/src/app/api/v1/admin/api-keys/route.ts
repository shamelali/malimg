import { NextRequest, NextResponse } from 'next/server';
import { issueApiKeyData, listApiKeysData, revokeApiKeyData } from '@/lib/dataService';
import { rateLimit } from '@/lib/rateLimit';
import { getRole, requireCapability } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const forbidden = requireCapability(request, 'admin');
  if (forbidden) return forbidden;
  return NextResponse.json({ keys: await listApiKeysData() });
}

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, 'admin');
  if (forbidden) return forbidden;

  const limited = rateLimit(request, { limit: 30 });
  if (limited) return limited;

  const body = (await request.json().catch(() => ({}))) as { name?: string; revokeId?: string };
  const actor = getRole(request);

  if (body.revokeId) {
    const revoked = await revokeApiKeyData(body.revokeId, actor);
    if (!revoked) return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    return NextResponse.json({ revoked: true, keys: await listApiKeysData() });
  }

  const result = await issueApiKeyData(body.name ?? 'Integration key', actor);
  return NextResponse.json({ key: result.key, keyMeta: result.meta, keys: await listApiKeysData() }, { status: 201 });
}
