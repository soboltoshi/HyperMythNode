import { NextResponse } from 'next/server';
import { getAppConfig } from '@hypermyths/config';
import { getDashboardSnapshot } from '@hypermyths/core';

export const runtime = 'nodejs';

export async function GET() {
  const config = getAppConfig();
  const dashboard = await getDashboardSnapshot();

  return NextResponse.json({
    ok: true,
    app: config.appName,
    counts: dashboard.counts
  });
}
