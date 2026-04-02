"use client";

import { useEffect, useMemo, useState } from "react";

type StatusPayload = {
  companion?: Record<string, unknown> | { error?: string };
  kernel?: Record<string, unknown> | { error?: string };
  hermes?: Record<string, unknown> | { error?: string };
};

type InstructionResult = {
  ok: boolean;
  error?: string;
  route?: unknown;
  hermesTask?: unknown;
  kernelReceipt?: unknown;
};

const STORAGE_KEY = "last-experiments.operator.token";

export default function OperatorPage() {
  const [token, setToken] = useState("");
  const [instruction, setInstruction] = useState("");
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [result, setResult] = useState<InstructionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState("idle");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setToken(saved);
    }
    void refreshStatus(saved || "");
  }, []);

  const connected = useMemo(() => {
    const companion = status?.companion as { error?: string } | undefined;
    return Boolean(status && !(companion?.error));
  }, [status]);

  async function refreshStatus(currentToken = token) {
    try {
      setStatusText("refreshing");
      const response = await fetch("/api/agent/status", {
        headers: currentToken ? { authorization: `Bearer ${currentToken}` } : undefined,
      });
      const payload = (await response.json()) as StatusPayload & { ok?: boolean; error?: string };
      setStatus(payload);
      setStatusText(response.ok ? "connected" : payload.error || "status blocked");
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "status unavailable");
    }
  }

  async function sendInstruction() {
    if (!instruction.trim()) {
      setResult({ ok: false, error: "Instruction is required." });
      return;
    }

    setBusy(true);
    setResult(null);

    try {
      const response = await fetch("/api/agent/instruction", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          prompt: instruction,
          source: "web-operator",
        }),
      });
      const payload = (await response.json()) as InstructionResult & { ok?: boolean };
      setResult(payload);
      setStatusText(response.ok ? "instruction sent" : payload.error || "instruction failed");
      if (response.ok) {
        setInstruction("");
        await refreshStatus(token);
      }
    } catch (error) {
      setResult({
        ok: false,
        error: error instanceof Error ? error.message : "request failed",
      });
      setStatusText("instruction failed");
    } finally {
      setBusy(false);
    }
  }

  function saveToken(nextToken: string) {
    setToken(nextToken);
    window.localStorage.setItem(STORAGE_KEY, nextToken);
  }

  return (
    <main className="shell operatorShell">
      <section className="operatorHero">
        <div className="stack">
          <p className="eyebrow">Operator Console</p>
          <h1>Web-authenticated instructions for the private brain.</h1>
          <p className="lede">
            This surface sends operator instructions through the same desktop
            companion that handles Quest voice, then into Hermes. It is cloud
            deployable and can sit behind Firebase App Hosting, Cloud Run, or a
            plain HTTPS reverse proxy.
          </p>
          <div className="inlineRow">
            <span className={`statusDot ${connected ? "statusDotOnline" : "statusDotOffline"}`} />
            <span className="statusPill">{statusText}</span>
            <button className="actionGhost" onClick={() => void refreshStatus()} type="button">
              Refresh Status
            </button>
          </div>
        </div>

        <aside className="panel operatorAuth">
          <p className="panelKicker">Login</p>
          <p className="noteText">
            Store the operator token locally for the browser session. In cloud
            deployments, set <code>WEB_OPERATOR_TOKEN</code> on the server.
          </p>
          <label className="formLabel">
            Operator Token
            <input
              className="formInput"
              value={token}
              onChange={(event) => saveToken(event.target.value)}
              placeholder="shared operator token"
              spellCheck={false}
              type="password"
            />
          </label>
        </aside>
      </section>

      <section className="operatorGrid">
        <article className="panel operatorComposer">
          <p className="panelKicker">Instruction</p>
          <textarea
            className="formTextarea operatorTextarea"
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="Build a stone tower, start a Solana token workflow, open the floating terminal, or coordinate a Hermes task."
            rows={8}
          />
          <div className="inlineRow">
            <button className="action" onClick={() => void sendInstruction()} type="button">
              {busy ? "Sending..." : "Send Instruction"}
            </button>
            <span className="noteText">Companion endpoint: `/api/agent/instruction`</span>
          </div>
          {result ? (
            <div className="operatorResult">
              <p className={`noteText ${result.ok ? "" : "errorText"}`}>
                {result.ok ? "Instruction accepted." : result.error || "Instruction rejected."}
              </p>
              {result.route ? <pre>{JSON.stringify(result.route, null, 2)}</pre> : null}
              {result.hermesTask ? <pre>{JSON.stringify(result.hermesTask, null, 2)}</pre> : null}
              {result.kernelReceipt ? <pre>{JSON.stringify(result.kernelReceipt, null, 2)}</pre> : null}
            </div>
          ) : null}
        </article>

        <aside className="panel operatorStatus">
          <p className="panelKicker">Bridge Status</p>
          <div className="operatorStatusCard">
            <span>Companion</span>
            <strong>{status?.companion && !(status.companion as { error?: string }).error ? "online" : "offline"}</strong>
          </div>
          <div className="operatorStatusCard">
            <span>Kernel</span>
            <strong>{status?.kernel && !(status.kernel as { error?: string }).error ? "online" : "offline"}</strong>
          </div>
          <div className="operatorStatusCard">
            <span>Hermes</span>
            <strong>{status?.hermes && !(status.hermes as { error?: string }).error ? "online" : "offline"}</strong>
          </div>
          <pre className="operatorStatusJson">{JSON.stringify(status, null, 2)}</pre>
        </aside>
      </section>
    </main>
  );
}
