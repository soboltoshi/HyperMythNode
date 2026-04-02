import { NextResponse } from "next/server";
import { fetchAgentStatus, getAgentBridgeConfig } from "../../../../lib/agent-bridge";

export async function GET() {
  try {
    const status = await fetchAgentStatus();
    return NextResponse.json({
      ok: true,
      bridge: getAgentBridgeConfig(),
      ...status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "status bridge failed",
      },
      { status: 502 }
    );
  }
}
