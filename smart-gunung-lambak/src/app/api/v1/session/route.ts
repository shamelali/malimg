import { NextRequest, NextResponse } from 'next/server';
import { isServerRole, SESSION_COOKIE, type ServerRole } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { role?: string };
  if (!isServerRole(body.role)) {
    return NextResponse.json({ error: 'Valid role is required' }, { status: 400 });
  }

  const role: ServerRole = body.role;
  const response = NextResponse.json({
    authenticated: true,
    role,
    note: 'Demo cookie session. Replace with SSO, MFA and signed JWT/session cookies in production.'
  });

  response.cookies.set(SESSION_COOKIE, role, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false, role: 'visitor' });
  response.cookies.set(SESSION_COOKIE, 'visitor', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
  return response;
}
