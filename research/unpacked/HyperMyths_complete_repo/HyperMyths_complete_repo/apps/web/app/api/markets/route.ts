import { NextRequest, NextResponse } from 'next/server';
import { createPredictionMarket, listPredictionMarkets } from '@hypermyths/core';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await listPredictionMarkets());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const market = await createPredictionMarket({
    subject: body.subject,
    choices: Array.isArray(body.choices) ? body.choices : ['YES', 'NO'],
    worldId: body.worldId
  });

  return NextResponse.json(market, { status: 201 });
}
