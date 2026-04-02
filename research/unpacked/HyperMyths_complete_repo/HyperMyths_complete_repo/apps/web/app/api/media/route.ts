import { NextRequest, NextResponse } from 'next/server';
import { listMediaJobs, queueMediaJob } from '@hypermyths/core';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await listMediaJobs());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const job = await queueMediaJob({
    targetType: body.targetType ?? 'world',
    targetId: body.targetId,
    kind: body.kind ?? 'report'
  });

  return NextResponse.json(job, { status: 201 });
}
