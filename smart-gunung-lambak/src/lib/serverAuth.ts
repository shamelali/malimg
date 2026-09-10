import { NextRequest, NextResponse } from 'next/server';

export type ServerRole =
  | 'super_admin'
  | 'park_manager'
  | 'ranger'
  | 'operator'
  | 'finance'
  | 'auditor'
  | 'visitor';

export type Capability = 'booking' | 'checkpoint' | 'sos' | 'hike' | 'ranger' | 'reports' | 'admin';

const roles: ServerRole[] = ['super_admin', 'park_manager', 'ranger', 'operator', 'finance', 'auditor', 'visitor'];

const capabilityRoles: Record<Capability, ServerRole[]> = {
  booking: roles,
  checkpoint: roles,
  sos: roles,
  hike: roles,
  ranger: ['super_admin', 'park_manager', 'ranger', 'operator'],
  reports: ['super_admin', 'park_manager', 'finance', 'auditor'],
  admin: ['super_admin', 'park_manager']
};

export function isServerRole(value: string | undefined | null): value is ServerRole {
  return Boolean(value && roles.includes(value as ServerRole));
}

export function getRole(request: NextRequest): ServerRole {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey && process.env.DEMO_API_KEY && apiKey === process.env.DEMO_API_KEY) {
    return 'super_admin';
  }

  const cookieRole = request.cookies.get('lambak_role')?.value;
  return isServerRole(cookieRole) ? cookieRole : 'visitor';
}

export function can(role: ServerRole, capability: Capability) {
  return capabilityRoles[capability].includes(role);
}

export function requireCapability(request: NextRequest, capability: Capability) {
  const role = getRole(request);
  if (can(role, capability)) return null;

  return NextResponse.json(
    {
      error: 'Forbidden',
      capability,
      role,
      requiredRoles: capabilityRoles[capability]
    },
    { status: 403 }
  );
}

export const SESSION_COOKIE = 'lambak_role';
