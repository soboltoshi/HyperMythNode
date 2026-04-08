type AgentBridgeConfig = {
  companionBaseUrl: string;
  kernelBaseUrl: string;
  hermesBaseUrl: string;
  operatorToken: string;
};

type MaybeJson = Record<string, unknown>;

export type ContactwayConnectPayload = {
  enabled?: boolean;
  mode?: string;
  bridge_url?: string;
};

export type ContactwayIntentPayload = {
  source_surface: string;
  channel: string;
  pattern: string;
  intensity: number;
  duration_ms: number;
  context?: string;
};

function normalizeUrl(value: string | undefined, fallback: string) {
  return (value || fallback).replace(/\/+$/, "");
}

export function getAgentBridgeConfig(): AgentBridgeConfig {
  return {
    companionBaseUrl: normalizeUrl(
      process.env.COMPANION_BASE_URL || process.env.NEXT_PUBLIC_COMPANION_URL,
      "http://127.0.0.1:8798"
    ),
    kernelBaseUrl: normalizeUrl(
      process.env.KERNEL_BASE_URL || process.env.NEXT_PUBLIC_KERNEL_URL,
      "http://127.0.0.1:8787"
    ),
    hermesBaseUrl: normalizeUrl(
      process.env.HERMES_BASE_URL || process.env.NEXT_PUBLIC_HERMES_URL,
      "http://127.0.0.1:8799"
    ),
    operatorToken: process.env.WEB_OPERATOR_TOKEN || "",
  };
}

async function fetchJson(baseUrl: string, route: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${route}`, init);
  const text = await response.text();
  const body = text ? safeParseJson(text) : null;

  if (!response.ok) {
    const message = typeof body === "string" ? body : (body as MaybeJson | null)?.error || response.statusText;
    throw new Error(`${response.status} ${message}`);
  }

  return body;
}

function safeParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function fetchAgentStatus() {
  const config = getAgentBridgeConfig();

  const [companion, kernel, hermes] = await Promise.all([
    fetchJson(config.companionBaseUrl, "/status").catch((error: Error) => ({ error: error.message })),
    fetchJson(config.kernelBaseUrl, "/health").catch((error: Error) => ({ error: error.message })),
    fetchJson(config.hermesBaseUrl, "/status").catch((error: Error) => ({ error: error.message })),
  ]);

  return {
    companion,
    kernel,
    hermes,
  };
}

export async function forwardInstruction(payload: MaybeJson) {
  const config = getAgentBridgeConfig();
  return fetchJson(config.companionBaseUrl, "/instruction", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchContactwayStatus() {
  const config = getAgentBridgeConfig();
  return fetchJson(config.kernelBaseUrl, "/api/contactway/status");
}

export async function connectContactway(payload: ContactwayConnectPayload) {
  const config = getAgentBridgeConfig();
  return fetchJson(config.kernelBaseUrl, "/api/contactway/connect", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload || {}),
  });
}

export async function disconnectContactway() {
  const config = getAgentBridgeConfig();
  return fetchJson(config.kernelBaseUrl, "/api/contactway/disconnect", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: "{}",
  });
}

export async function forwardContactwayIntent(payload: ContactwayIntentPayload) {
  const config = getAgentBridgeConfig();
  return fetchJson(config.kernelBaseUrl, "/api/contactway/intent", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function isAuthorized(request: Request) {
  const config = getAgentBridgeConfig();
  if (!config.operatorToken) {
    return true;
  }

  const authorization = request.headers.get("authorization") || "";
  return authorization === `Bearer ${config.operatorToken}`;
}
