import { NextRequest, NextResponse } from "next/server";
import { connectContactway, isAuthorized } from "../../../../lib/agent-bridge";

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const result = await connectContactway({
      enabled: typeof body.enabled === "boolean" ? body.enabled : true,
      mode: body.mode ? String(body.mode) : undefined,
      bridge_url: body.bridge_url ? String(body.bridge_url) : undefined,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "contactway connect failed",
      },
      { status: 502 }
    );
  }
}