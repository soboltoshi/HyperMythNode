import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HermesRuntime } from "./runtime.mjs";

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
