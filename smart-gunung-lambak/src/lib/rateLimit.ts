import { NextRequest, NextResponse } from 'next/server';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(request: NextRequest, options?: { limit?: number; windowMs?: number }) {
  if (buckets.size > 5_000) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= Date.now()) buckets.delete(key);
    }
  }

  const limit = options?.limit ?? 120;
  const windowMs = options?.windowMs ?? 60_000;
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local';
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please retry shortly.', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  current.count += 1;
  return null;
}
