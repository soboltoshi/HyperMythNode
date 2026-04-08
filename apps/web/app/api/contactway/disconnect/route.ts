import { NextRequest, NextResponse } from "next/server";
import { disconnectContactway, isAuthorized } from "../../../../lib/agent-bridge";

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const result = await disconnectContactway();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "contactway disconnect failed",
      },
      { status: 502 }
    );
  }
}