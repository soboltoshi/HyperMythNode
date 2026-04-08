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

type ContactwayIntentSummary = {
  source_surface: string;
  channel: string;
  pattern: string;
  intensity: number;
  duration_ms: number;
  context?: string;
  created_at: string;
};

type ContactwayStatusPayload = {
  adapter: string;
  mode: string;
  bridge_url: string;
  enabled: boolean;
  connected: boolean;
  updated_at: string;
  last_error?: string | null;
  last_intent?: ContactwayIntentSummary | null;
  integration_notes?: string[];
};

type CinemaExperiment = {
  experiment_id: string;
  token_address: string;
  status: string;
  video_url?: string;
};

const STORAGE_KEY = "last-experiments.operator.token";
const DEFAULT_KERNEL_URL = "http://127.0.0.1:8787";
const DEFAULT_HERMES_URL = "http://127.0.0.1:8799";
const KERNEL_URL = (process.env.NEXT_PUBLIC_KERNEL_URL || DEFAULT_KERNEL_URL).replace(/\/+$/, "");
const HERMES_URL = (process.env.NEXT_PUBLIC_HERMES_URL || DEFAULT_HERMES_URL).replace(/\/+$/, "");

export default function OperatorPage() {
  const [token, setToken] = useState("");
  const [instruction, setInstruction] = useState("");
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [result, setResult] = useState<InstructionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState("idle");
  const [cinemaExperiments, setCinemaExperiments] = useState<CinemaExperiment[]>([]);
  const [cinemaToken, setCinemaToken] = useState("");
  const [cinemaStyle, setCinemaStyle] = useState("hyperflow_assembly");
  const [cinemaPackage, setCinemaPackage] = useState<"1d" | "2d">("1d");
  const [cinemaBusy, setCinemaBusy] = useState(false);
  const [cinemaMessage, setCinemaMessage] = useState("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [contactwayStatus, setContactwayStatus] = useState<ContactwayStatusPayload | null>(null);
  const [contactwayBusy, setContactwayBusy] = useState(false);
  const [contactwayMessage, setContactwayMessage] = useState("idle");
  const [contactwayMode, setContactwayMode] = useState("buttplug_ws");
  const [contactwayBridgeUrl, setContactwayBridgeUrl] = useState("ws://127.0.0.1:12345");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setToken(saved);
    }
    void refreshStatus(saved || "");
    void refreshCinemaExperiments();
    void refreshContactwayStatus();
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

  async function refreshContactwayStatus() {
    try {
      const response = await fetch("/api/contactway/status");
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        status?: ContactwayStatusPayload;
      };

      if (!response.ok || !payload.status) {
        throw new Error(payload.error || `contactway status ${response.status}`);
      }

      setContactwayStatus(payload.status);
      setContactwayMode(payload.status.mode || "buttplug_ws");
      setContactwayBridgeUrl(payload.status.bridge_url || "ws://127.0.0.1:12345");
      setContactwayMessage(payload.status.connected ? "connected" : "ready");
    } catch (error) {
      setContactwayMessage(error instanceof Error ? error.message : "contactway unavailable");
    }
  }

  async function connectContactway() {
    setContactwayBusy(true);
    try {
      const response = await fetch("/api/contactway/connect", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          enabled: true,
          mode: contactwayMode,
          bridge_url: contactwayBridgeUrl,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        result?: ContactwayStatusPayload;
      };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error || `connect failed (${response.status})`);
      }

      setContactwayStatus(payload.result);
      setContactwayMessage("contactway connected");
    } catch (error) {
      setContactwayMessage(error instanceof Error ? error.message : "connect failed");
    } finally {
      setContactwayBusy(false);
    }
  }

  async function disconnectContactway() {
    setContactwayBusy(true);
    try {
      const response = await fetch("/api/contactway/disconnect", {
        method: "POST",
        headers: {
          authorization: token ? `Bearer ${token}` : "",
        },
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        result?: ContactwayStatusPayload;
      };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error || `disconnect failed (${response.status})`);
      }

      setContactwayStatus(payload.result);
      setContactwayMessage("contactway disconnected");
    } catch (error) {
      setContactwayMessage(error instanceof Error ? error.message : "disconnect failed");
    } finally {
      setContactwayBusy(false);
    }
  }

  async function sendContactwayPulse() {
    setContactwayBusy(true);
    try {
      const response = await fetch("/api/contactway/intent", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          source_surface: "web-operator",
          channel: "pulse",
          pattern: "operator_ping",
          intensity: 0.65,
          duration_ms: 220,
          context: "operator test pulse",
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        result?: { accepted?: boolean; note?: string };
      };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error || `intent failed (${response.status})`);
      }

      setContactwayMessage(payload.result.note || "intent sent");
      await refreshContactwayStatus();
    } catch (error) {
      setContactwayMessage(error instanceof Error ? error.message : "intent failed");
    } finally {
      setContactwayBusy(false);
    }
  }

  async function refreshCinemaExperiments() {
    try {
      const response = await fetch(`${KERNEL_URL}/snapshot`);
      if (!response.ok) {
        throw new Error(`snapshot ${response.status}`);
      }

      const snapshot = (await response.json()) as {
        experiments?: Array<Record<string, unknown>>;
      };

      const experiments = Array.isArray(snapshot.experiments) ? snapshot.experiments : [];
      const cinemaOnly = experiments
        .map((item) => ({
          experiment_id: String(item.experiment_id || item.experimentId || ""),
          token_address: String(item.token_address || item.tokenAddress || ""),
          status: String(item.status || "pending"),
          video_url: String(item.video_url || item.videoUrl || ""),
          experiment_type: String(item.experiment_type || item.experimentType || ""),
        }))
        .filter((item) => item.experiment_id.length > 0)
        .filter(
          (item) =>
            item.experiment_type === "CinemaExperiment" ||
            item.experiment_type === "CreateCinemaExperiment" ||
            item.video_url.length > 0
        )
        .map((item) => ({
          experiment_id: item.experiment_id,
          token_address: item.token_address,
          status: item.status,
          video_url: item.video_url || undefined,
        }));

      setCinemaExperiments(cinemaOnly.reverse());
      setCinemaMessage("snapshot synced");
    } catch (error) {
      setCinemaMessage(error instanceof Error ? error.message : "snapshot unavailable");
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

  async function dispatchCinemaExperiment() {
    const tokenAddress = cinemaToken.trim();
    if (!tokenAddress) {
      setCinemaMessage("token address is required");
      return;
    }

    setCinemaBusy(true);
    try {
      const response = await fetch(`${HERMES_URL}/hypercinema/dispatch`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          token_address: tokenAddress,
          chain: "auto",
          package_type: cinemaPackage,
          style_preset: cinemaStyle,
          payment_route: "sol_direct",
        }),
      });

      const payload = (await response.json()) as {
        jobId?: string;
        status?: string;
        videoUrl?: string | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || `dispatch failed (${response.status})`);
      }

      setCinemaMessage(`dispatched ${payload.jobId || "job"} (${payload.status || "pending"})`);
      if (payload.videoUrl) {
        setPreviewUrl(payload.videoUrl);
      }
      setCinemaToken("");
      await refreshCinemaExperiments();
    } catch (error) {
      setCinemaMessage(error instanceof Error ? error.message : "dispatch failed");
    } finally {
      setCinemaBusy(false);
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

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="inlineRow" style={{ justifyContent: "space-between" }}>
          <p className="panelKicker">Contactway (Desktop + VR Bridge)</p>
          <button className="actionGhost" onClick={() => void refreshContactwayStatus()} type="button">
            Refresh Contactway
          </button>
        </div>

        <p className="noteText" style={{ marginBottom: 12 }}>
          Native kernel contactway adapter over Intiface/Buttplug interfaces. This keeps desktop, web,
          and Quest VR on one bounded control path.
        </p>

        <div className="inlineRow" style={{ flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <select
            className="formInput"
            value={contactwayMode}
            onChange={(event) => setContactwayMode(event.target.value)}
            style={{ width: 200 }}
          >
            <option value="buttplug_ws">buttplug_ws</option>
            <option value="intiface_engine">intiface_engine</option>
            <option value="intiface_central">intiface_central</option>
            <option value="custom">custom</option>
          </select>
          <input
            className="formInput"
            style={{ minWidth: 320, flex: 1 }}
            value={contactwayBridgeUrl}
            onChange={(event) => setContactwayBridgeUrl(event.target.value)}
            placeholder="ws://127.0.0.1:12345"
            spellCheck={false}
          />
          <button className="action" onClick={() => void connectContactway()} type="button">
            {contactwayBusy ? "Connecting..." : "Connect"}
          </button>
          <button className="actionGhost" onClick={() => void disconnectContactway()} type="button">
            Disconnect
          </button>
          <button className="actionGhost" onClick={() => void sendContactwayPulse()} type="button">
            Send Test Pulse
          </button>
        </div>

        <div className="stack" style={{ gap: 8 }}>
          <div className="operatorStatusCard">
            <span>Adapter</span>
            <strong>{contactwayStatus?.adapter || "ContactwayAdapter-v1-native"}</strong>
          </div>
          <div className="operatorStatusCard">
            <span>Status</span>
            <strong>
              {contactwayStatus?.enabled ? "enabled" : "disabled"} / {contactwayStatus?.connected ? "connected" : "disconnected"}
            </strong>
          </div>
          <div className="operatorStatusCard">
            <span>Route</span>
            <strong>
              {contactwayStatus?.mode || contactwayMode}
              {" -> "}
              {contactwayStatus?.bridge_url || contactwayBridgeUrl}
            </strong>
          </div>
          <p className="noteText">{contactwayMessage}</p>
          {contactwayStatus?.last_intent ? (
            <pre className="operatorStatusJson">{JSON.stringify(contactwayStatus.last_intent, null, 2)}</pre>
          ) : null}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="inlineRow" style={{ justifyContent: "space-between" }}>
          <p className="panelKicker">Cinema Experiments</p>
          <button className="actionGhost" onClick={() => void refreshCinemaExperiments()} type="button">
            Refresh Cinema
          </button>
        </div>

        <div className="inlineRow" style={{ flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <input
            className="formInput"
            style={{ minWidth: 280, flex: 1 }}
            value={cinemaToken}
            onChange={(event) => setCinemaToken(event.target.value)}
            placeholder="token address"
            spellCheck={false}
          />
          <select
            className="formInput"
            value={cinemaStyle}
            onChange={(event) => setCinemaStyle(event.target.value)}
            style={{ width: 180 }}
          >
            <option value="hyperflow_assembly">hyperflow_assembly</option>
            <option value="trading_card">trading_card</option>
          </select>
          <select
            className="formInput"
            value={cinemaPackage}
            onChange={(event) => setCinemaPackage(event.target.value === "2d" ? "2d" : "1d")}
            style={{ width: 90 }}
          >
            <option value="1d">1d</option>
            <option value="2d">2d</option>
          </select>
          <button className="action" onClick={() => void dispatchCinemaExperiment()} type="button">
            {cinemaBusy ? "Dispatching..." : "Dispatch New"}
          </button>
        </div>

        <p className="noteText" style={{ marginBottom: 12 }}>
          {cinemaMessage}
        </p>

        {cinemaExperiments.length === 0 ? (
          <p className="noteText">No CinemaExperiment records currently visible in kernel snapshot.</p>
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            {cinemaExperiments.map((experiment) => (
              <div key={experiment.experiment_id} className="operatorStatusCard">
                <span>
                  {experiment.experiment_id} | {experiment.token_address || "unknown token"} | {experiment.status}
                </span>
                <div className="inlineRow">
                  {experiment.video_url ? (
                    <button
                      className="actionGhost"
                      type="button"
                      onClick={() => setPreviewUrl(experiment.video_url || null)}
                    >
                      Preview
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {previewUrl ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7, 10, 16, 0.8)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "min(960px, 96vw)",
              background: "#081018",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div className="inlineRow" style={{ justifyContent: "space-between", marginBottom: 10 }}>
              <strong>Cinema Preview</strong>
              <button className="actionGhost" type="button" onClick={() => setPreviewUrl(null)}>
                Close
              </button>
            </div>
            <video controls autoPlay style={{ width: "100%", borderRadius: 10 }} src={previewUrl} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
