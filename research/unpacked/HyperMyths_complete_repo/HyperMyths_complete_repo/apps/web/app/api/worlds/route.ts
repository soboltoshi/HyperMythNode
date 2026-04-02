import { NextRequest, NextResponse } from 'next/server';
import { createWorld, listWorlds } from '@hypermyths/core';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await listWorlds());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const world = await createWorld({
    slug: body.slug,
    title: body.title,
    type: body.type ?? 'community',
    status: body.status ?? 'draft',
    summary: body.summary ?? ''
  });

  return NextResponse.json(world, { status: 201 });
}
