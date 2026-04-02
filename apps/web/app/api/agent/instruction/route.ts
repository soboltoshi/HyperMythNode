import { NextRequest, NextResponse } from "next/server";
import { forwardInstruction, getAgentBridgeConfig, isAuthorized } from "../../../../lib/agent-bridge";

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const prompt = String(body.prompt || body.instruction || "").trim();

    if (!prompt) {
      return NextResponse.json({ ok: false, error: "prompt is required" }, { status: 400 });
    }

    const result = await forwardInstruction({
      prompt,
      source: String(body.source || "web-operator"),
      confidence: Number.isFinite(body.confidence) ? Number(body.confidence) : 1,
      target: "companion",
    });

    return NextResponse.json({
      ok: true,
      companion: getAgentBridgeConfig().companionBaseUrl,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "instruction bridge failed",
      },
      { status: 502 }
    );
  }
}
