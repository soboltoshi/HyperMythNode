import { NextResponse } from 'next/server';
import { getWorldBySlug } from '@hypermyths/core';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const world = await getWorldBySlug(slug);

  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  return NextResponse.json(world);
}
