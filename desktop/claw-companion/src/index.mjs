import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getVoiceTranscriberStatus, transcribeWavBuffer } from "./voice-transcriber.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const clawCodeParityRoot = path.join(repoRoot, "agents", "vendor", "claw-code-parity");

const companionBaseUrl =
  process.env.COMPANION_BASE_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8798";
const kernelBaseUrl =
  process.env.KERNEL_BASE_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8787";
const hermesBaseUrl =
  process.env.HERMES_BASE_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8799";
const voiceBackendMode = (process.env.VOICE_TRANSCRIBE_MODE || "local-whisper").toLowerCase();
const voiceTranscribeCommand = process.env.VOICE_TRANSCRIBE_COMMAND || "";
let voiceTranscribeArgs = [];
if (process.env.VOICE_TRANSCRIBE_ARGS) {
  try {
    const parsed = JSON.parse(process.env.VOICE_TRANSCRIBE_ARGS);
    if (Array.isArray(parsed)) {
      voiceTranscribeArgs = parsed.map((value) => String(value));
    }
  } catch {
    voiceTranscribeArgs = [];
  }
}

const mode = process.argv[2] || "status";
const promptArgs = process.argv.slice(3);

async function fetchJson(baseUrl, route, init) {
  const response = await fetch(`${baseUrl}${route}`, init);
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message = typeof body === "string" ? body : body?.error || response.statusText;
    throw new Error(`${response.status} ${message}`);
  }

  return body;
}

function routeWithClawCode(prompt) {
  if (!fs.existsSync(clawCodeParityRoot)) {
    return {
      route: "claw-code parity repo missing",
      command: null,
      tool: null,
    };
  }

  const result = spawnSync(
    "python",
    ["-m", "src.main", "route", prompt, "--limit", "5"],
    {
      cwd: clawCodeParityRoot,
      encoding: "utf8",
      windowsHide: true,
    }
  );

  if (result.error) {
    return {
      route: `route unavailable: ${result.error.message}`,
      command: null,
      tool: null,
    };
  }

  const output = (result.stdout || "").trim();
  const lines = output.split(/\r?\n/).filter(Boolean);
  const firstCommand = lines.find((line) => line.startsWith("command\t"));
  const firstTool = lines.find((line) => line.startsWith("tool\t"));

  return {
    route: output || "no mirrored match",
    command: firstCommand ? firstCommand.split("\t")[1] : null,
    tool: firstTool ? firstTool.split("\t")[1] : null,
  };
}

async function createHermesTask({ prompt, source, confidence, route }) {
  const instruction =
    `VR shell instruction from ${source}:\n${prompt}\n\n` +
    `Routing summary:\n${route || "none"}`;

  return fetchJson(hermesBaseUrl, "/tasks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      role: "interpreter",
      instruction,
      metadata: {
        source,
        confidence,
        route,
        desktop_companion: "claw-code-parity",
      },
    }),
  });
}

async function handleInstruction(prompt, source = "cli", confidence = 1, options = {}) {
  const { enqueueHermes = false } = options;
  const transcript = String(prompt || "").trim();
  if (!transcript) {
    throw new Error("prompt is required");
  }

  const route = routeWithClawCode(transcript);
  let hermesTask = null;
  let hermesTaskError = null;
  if (enqueueHermes) {
    try {
      hermesTask = await createHermesTask({
        prompt: transcript,
        source,
        confidence,
        route: route.route,
      });
    } catch (error) {
      hermesTaskError = error.message;
    }
  }

  return {
    ok: true,
    prompt: transcript,
    source,
    confidence,
    route,
    hermesTask,
    hermesTaskError,
  };
}

async function transcribeVoicePayload(buffer, contentType) {
  if (voiceBackendMode === "noop") {
    return {
      transcript: "voice backend disabled",
      confidence: 0,
    };
  }

  if (voiceBackendMode === "transcript") {
    const raw = buffer.toString("utf8").trim();
    if (!raw) {
      throw new Error("voice payload did not include transcript text");
    }
    return {
      transcript: raw,
      confidence: 1,
    };
  }

  if (voiceBackendMode === "local-whisper") {
    return transcribeWavBuffer(buffer);
  }

  if (!voiceTranscribeCommand) {
    throw new Error(
      "VOICE_TRANSCRIBE_COMMAND is not configured. Set VOICE_TRANSCRIBE_MODE=local-whisper for offline audio transcription, VOICE_TRANSCRIBE_MODE=transcript for text uploads, or provide a local transcription command."
    );
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "claw-voice-"));
  const voicePath = path.join(tempDir, contentType.includes("wav") ? "input.wav" : "input.audio");
  fs.writeFileSync(voicePath, buffer);

  const commandParts = voiceTranscribeCommand.split(/\s+/).filter(Boolean);
  const executable = commandParts.shift();
  const result = spawnSync(executable, [...commandParts, ...voiceTranscribeArgs, voicePath], {
    cwd: repoRoot,
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.error) {
    throw new Error(`transcription command failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "transcription failed").trim());
  }

  const transcript = (result.stdout || "").trim();
  if (!transcript) {
    throw new Error("transcription command returned no text");
  }

  return {
    transcript,
    confidence: 0.9,
    backend: voiceTranscribeCommand,
  };
}

async function handleVoiceRequest(request, response) {
  const contentType = request.headers["content-type"] || "application/octet-stream";
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  let transcriptPayload;
  if (contentType.includes("application/json")) {
    const payload = JSON.parse(buffer.toString("utf8") || "{}");
    transcriptPayload = {
      transcript: String(payload.transcript || payload.text || "").trim(),
      confidence: Number.isFinite(payload.confidence) ? payload.confidence : 1,
    };
    if (!transcriptPayload.transcript) {
      throw new Error("JSON voice payload requires transcript or text");
    }
  } else {
    transcriptPayload = await transcribeVoicePayload(buffer, contentType);
  }

  const routed = await handleInstruction(
    transcriptPayload.transcript,
    "quest3-voice",
    transcriptPayload.confidence ?? 1,
    { enqueueHermes: false }
  );

  response.statusCode = 200;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(
    JSON.stringify({
      ok: true,
      transcript: transcriptPayload.transcript,
      confidence: transcriptPayload.confidence ?? 1,
      route: routed.route,
      kernelReceipt: routed.kernelReceipt,
      hermesTask: routed.hermesTask,
    })
  );
}

async function printStatus() {
  const [hermesStatus, kernelHealth] = await Promise.all([
    fetchJson(hermesBaseUrl, "/status").catch((error) => ({ error: error.message })),
    fetchJson(kernelBaseUrl, "/health").catch((error) => ({ error: error.message })),
  ]);

  console.log("[ClawCompanionBox] desktop private brain");
  console.log(`companion: ${companionBaseUrl}`);
  console.log(`kernel: ${kernelBaseUrl}`);
  console.log(`hermes: ${hermesBaseUrl}`);
  const voiceBackend =
    voiceBackendMode === "local-whisper"
      ? `${voiceBackendMode} | ${getVoiceTranscriberStatus().model}`
      : `${voiceBackendMode}${voiceTranscribeCommand ? ` | ${voiceTranscribeCommand}` : ""}`;
  console.log(`voice backend: ${voiceBackend}`);

  if (kernelHealth.error) {
    console.log(`kernel: offline (${kernelHealth.error})`);
  } else {
    console.log(`kernel: ok | focus ${kernelHealth.release_focus}`);
  }

  if (hermesStatus.error) {
    console.log(`hermes: offline (${hermesStatus.error})`);
  } else {
    console.log(
      `hermes: tasks ${hermesStatus.totalTasks} | grievances ${hermesStatus.grievances} | ` +
      `queued ${hermesStatus.counts.queued} running ${hermesStatus.counts.running} ` +
      `review ${hermesStatus.counts.review} done ${hermesStatus.counts.done} failed ${hermesStatus.counts.failed}`
    );
  }
}

async function serve() {
  const server = http.createServer(async (request, response) => {
    try {
      if (request.method === "GET" && request.url === "/health") {
        response.statusCode = 200;
        response.setHeader("content-type", "application/json; charset=utf-8");
        response.end(
          JSON.stringify({
            ok: true,
            service: "claw-companion",
            kernel: kernelBaseUrl,
            hermes: hermesBaseUrl,
            parityRepo: clawCodeParityRoot,
          })
        );
        return;
      }

      if (request.method === "GET" && request.url === "/status") {
        const status = await fetchJson(hermesBaseUrl, "/status");
        response.statusCode = 200;
        response.setHeader("content-type", "application/json; charset=utf-8");
        response.end(JSON.stringify(status));
        return;
      }

      if (request.method === "POST" && request.url === "/instruction") {
        const chunks = [];
        for await (const chunk of request) {
          chunks.push(chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        const result = await handleInstruction(
          body.prompt || body.instruction || "",
          body.source || "api",
          body.confidence ?? 1,
          { enqueueHermes: true }
        );
        response.statusCode = 200;
        response.setHeader("content-type", "application/json; charset=utf-8");
        response.end(JSON.stringify(result));
        return;
      }

      if (request.method === "POST" && request.url === "/voice") {
        await handleVoiceRequest(request, response);
        return;
      }

      response.statusCode = 404;
      response.setHeader("content-type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ ok: false, error: "not found" }));
    } catch (error) {
      response.statusCode = 400;
      response.setHeader("content-type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ ok: false, error: error.message }));
    }
  });

  server.listen(8798, "127.0.0.1", () => {
    console.log("[ClawCompanionBox] listening on http://127.0.0.1:8798");
    console.log(`[ClawCompanionBox] claw-code parity root: ${clawCodeParityRoot}`);
  });
}

async function main() {
  if (mode === "status") {
    await printStatus();
    return;
  }

  if (mode === "serve") {
    await serve();
    return;
  }

  if (mode === "brain") {
    const prompt = promptArgs.join(" ").trim();
    const result = await handleInstruction(prompt, "cli", 1, { enqueueHermes: true });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (mode === "route") {
    const prompt = promptArgs.join(" ").trim();
    const route = routeWithClawCode(prompt);
    console.log(route.route);
    return;
  }

  console.error(`Unknown mode '${mode}'. Use: status | serve | brain | route`);
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[ClawCompanionBox] fatal: ${error.message}`);
  process.exitCode = 1;
});
