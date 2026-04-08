import { NextRequest, NextResponse } from "next/server";
import { forwardContactwayIntent, isAuthorized } from "../../../../lib/agent-bridge";

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const result = await forwardContactwayIntent({
      source_surface: String(body.source_surface || body.source || "web-operator"),
      channel: String(body.channel || "pulse"),
      pattern: String(body.pattern || "operator_ping"),
      intensity: Number.isFinite(body.intensity) ? Number(body.intensity) : 0.65,
      duration_ms: Number.isFinite(body.duration_ms) ? Number(body.duration_ms) : 220,
      context: body.context ? String(body.context) : undefined,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "contactway intent failed",
      },
      { status: 502 }
    );
  }
}