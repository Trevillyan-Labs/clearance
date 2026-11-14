import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

const globalToken = globalThis as typeof globalThis & { clearanceSession?: string };
const token = globalToken.clearanceSession ??= randomUUID();

export function localRequest(req: NextRequest, mutating = false) {
  const host = req.headers.get('host');
  if (!['127.0.0.1:3090', 'localhost:3090'].includes(host ?? '')) throw new Error('Local operator access only');
  // Next may normalize req.url to localhost even when the browser used 127.0.0.1.
  // Only the exact allowlisted external Host determines this HTTP-only demo's origin.
  const expectedOrigin = `http://${host}`;
  const origin = req.headers.get('origin');
  if (origin && origin !== expectedOrigin) throw new Error('Cross-origin access denied');
  if (req.headers.get('sec-fetch-site') === 'cross-site') throw new Error('Cross-site access denied');
  if (mutating && (req.cookies.get('clearance-session')?.value !== token || !origin)) throw new Error('Operator session required');
}

export function sessionResponse(data: unknown) {
  const res = NextResponse.json(data);
  res.cookies.set('clearance-session', token, { httpOnly: true, sameSite: 'strict', path: '/' });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export function failure(error: unknown) {
  return NextResponse.json({ error: error instanceof Error ? error.message : 'Operation failed' }, { status: 400 });
}
