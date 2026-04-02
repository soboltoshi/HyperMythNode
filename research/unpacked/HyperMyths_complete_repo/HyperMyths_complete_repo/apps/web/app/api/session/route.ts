import { NextRequest, NextResponse } from 'next/server';
import { bindSessionState, getSessionSnapshot } from '@hypermyths/core';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await getSessionSnapshot());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const state = await bindSessionState({
    focusType: body.focusType ?? 'world',
    focusLabel: body.focusLabel ?? 'genesis',
    ownerBlock: body.ownerBlock ?? 'session-kernel',
    leaseSeconds: Number(body.leaseSeconds ?? 300)
  });

  return NextResponse.json(state, { status: 201 });
}
