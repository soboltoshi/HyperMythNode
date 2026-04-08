import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HermesRuntime } from "./runtime.mjs";
import { TaskExecutor } from "./executor.mjs";
import { handleCamiIntent } from "./cami-delegate.mjs";
import {
  dispatchCinemaJob,
  fetchCinemaJobStatus,
  fetchCinemaVideoUrl,
  PaymentRequiredError
} from "./hypercinema-delegate.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");

const port = Number.parseInt(process.env.HERMES_RUNTIME_PORT ?? "8799", 10);
const statePath = process.env.HERMES_RUNTIME_STATE
  ? path.resolve(process.env.HERMES_RUNTIME_STATE)
  : path.join(repoRoot, "build", "hermes", "runtime-state.json");
const rolesPath = path.join(repoRoot, "agents", "hermes", "roles");

const runtime = new HermesRuntime({ statePath, rolesPath });

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.end(JSON.stringify(payload));
}

function sendError(response, statusCode, message) {
  sendJson(response, statusCode, { ok: false, error: message });
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("request body too large"));
      }
    });
    request.on("end", () => {
      if (data.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error(`invalid JSON: ${error.message}`));
      }
    });
    request.on("error", reject);
  });
}

function normalizeCinemaDispatchInput(payload) {
  return {
    tokenAddress: String(payload.token_address || payload.tokenAddress || "").trim(),
    chain: String(payload.chain || "auto").trim() || "auto",
    packageType:
      String(payload.package_type || payload.packageType || "1d").toLowerCase() === "2d" ? "2d" : "1d",
    stylePreset:
      String(payload.style_preset || payload.stylePreset || process.env.HYPERCINEMA_DEFAULT_STYLE || "hyperflow_assembly").trim(),
    requestedPrompt: String(payload.creative_prompt || payload.requestedPrompt || "").trim(),
    paymentRoute:
      String(payload.payment_route || payload.paymentRoute || process.env.HYPERCINEMA_PAYMENT_ROUTE || "sol_direct")
        .toLowerCase() === "x402_usdc"
        ? "x402_usdc"
        : "sol_direct",
    experimentId: String(payload.experiment_id || payload.experimentId || "").trim()
  };
}

// ---------------------------------------------------------------------------
// Task executor — runs agents server-side, posts results to kernel
// ---------------------------------------------------------------------------
const kernelBaseUrl =
  process.env.KERNEL_BASE_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8787";
const executor = new TaskExecutor({
  runtime,
  pollIntervalMs: Number.parseInt(process.env.EXECUTOR_POLL_MS ?? "3000", 10),
  kernelBaseUrl,
});

// Handler: interpreter — classifies intent via CAMI and returns response
executor.registerHandler("interpreter", async (task) => {
  const transcript =
    task.metadata?.transcript || task.instruction?.split("\n")[0] || "";
  const cami = handleCamiIntent({ transcript });
  return {
    result_type: "cami_response",
    data: {
      reply_text: cami.reply_text,
      emotion: cami.emotion,
      kernel_proposal: cami.kernel_proposal,
      transcript,
    },
  };
});

// Handler: hypercinema-delegate — dispatches cinema job
executor.registerHandler("hypercinema-delegate", async (task) => {
  const meta = task.metadata || {};
  const tokenAddress = meta.token_address || "";
  if (!tokenAddress) {
    throw new Error("hypercinema-delegate requires metadata.token_address");
  }

  const events = [];
  const result = await dispatchCinemaJob({
    tokenAddress,
    chain: meta.chain || "auto",
    packageType: meta.package_type || "1d",
    stylePreset: meta.style_preset || "hyperflow_assembly",
    requestedPrompt: meta.creative_prompt || "",
    paymentRoute: meta.payment_route || "sol_direct",
    onEvent: (event) => events.push(event),
  });

  return {
    result_type: "cinema_dispatch",
    data: {
      jobId: result.jobId,
      videoUrl: result.videoUrl || null,
      reportUrl: result.reportUrl || null,
      token_address: tokenAddress,
      events,
    },
  };
});

executor.start();

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------
const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      response.statusCode = 204;
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type");
      response.end();
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host}`);
    const route = url.pathname;

    if (request.method === "GET" && route === "/health") {
      sendJson(response, 200, {
        ok: true,
        service: "hermes-asimog-runtime",
        roles: runtime.getRoles().length,
        tasks: runtime.getTasks().length,
        statePath
      });
      return;
    }

    if (request.method === "GET" && route === "/roles") {
      sendJson(response, 200, { roles: runtime.getRoles() });
      return;
    }

    if (request.method === "GET" && route === "/tasks") {
      sendJson(response, 200, { tasks: runtime.getTasks() });
      return;
    }

    if (request.method === "GET" && route === "/status") {
      sendJson(response, 200, runtime.getStatusSummary());
      return;
    }

    if (request.method === "POST" && route === "/cami/intent") {
      const body = await parseBody(request);
      const transcript = String(body.transcript || body.text || body.prompt || "").trim();
      const cami = handleCamiIntent({ transcript });
      sendJson(response, 200, cami);
      return;
    }

    if (request.method === "POST" && route === "/hypercinema/dispatch") {
      const body = await parseBody(request);
      const input = normalizeCinemaDispatchInput(body);
      if (!input.tokenAddress) {
        sendError(response, 422, "token_address is required");
        return;
      }

      const events = [];
      try {
        const result = await dispatchCinemaJob({
          tokenAddress: input.tokenAddress,
          chain: input.chain,
          packageType: input.packageType,
          stylePreset: input.stylePreset,
          requestedPrompt: input.requestedPrompt,
          paymentRoute: input.paymentRoute,
          onEvent: (event) => events.push(event)
        });

        sendJson(response, 200, {
          jobId: result.jobId,
          status: "complete",
          videoUrl: result.videoUrl || null,
          reportUrl: result.reportUrl || null,
          experimentId: input.experimentId || null,
          events
        });
      } catch (error) {
        if (error instanceof PaymentRequiredError) {
          sendJson(response, 402, {
            ok: false,
            status: "payment_required",
            event: "cinema.payment_required",
            details: error.body || null,
            events
          });
          return;
        }

        sendError(response, 502, error.message);
      }
      return;
    }

    const pollMatch = route.match(/^\/hypercinema\/poll\/([^/]+)$/);
    if (request.method === "GET" && pollMatch) {
      const jobId = pollMatch[1];
      try {
        const state = await fetchCinemaJobStatus(jobId);
        let videoUrl = state.videoUrl || null;
        if (state.status === "complete" && !videoUrl) {
          try {
            videoUrl = await fetchCinemaVideoUrl(jobId);
          } catch {
            videoUrl = null;
          }
        }

        sendJson(response, 200, {
          jobId: state.jobId,
          status: state.status,
          videoUrl,
          reportUrl: state.reportUrl || null
        });
      } catch (error) {
        sendError(response, 502, error.message);
      }
      return;
    }

    if (request.method === "POST" && route === "/tasks") {
      const body = await parseBody(request);
      const task = runtime.createTask(body);
      sendJson(response, 201, task);
      return;
    }

    const statusMatch = route.match(/^\/tasks\/([^/]+)\/status$/);
    if (request.method === "POST" && statusMatch) {
      const body = await parseBody(request);
      const task = runtime.setTaskStatus(statusMatch[1], body.status, body.note ?? "");
      sendJson(response, 200, task);
      return;
    }

    const grievanceMatch = route.match(/^\/tasks\/([^/]+)\/grievance$/);
    if (request.method === "POST" && grievanceMatch) {
      const body = await parseBody(request);
      const entry = runtime.raiseGrievance(grievanceMatch[1], body.grievance ?? "");
      sendJson(response, 200, entry);
      return;
    }

    sendError(response, 404, `route '${route}' not found`);
  } catch (error) {
    sendError(response, 400, error.message);
  }
});

server.listen(port, () => {
  process.stdout.write(
    `[hermes-runtime] listening on http://127.0.0.1:${port}\n` +
    `[hermes-runtime] roles: ${runtime.getRoles().length}, state: ${statePath}\n`
  );
});
