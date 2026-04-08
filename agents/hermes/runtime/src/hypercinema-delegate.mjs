const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;
const DEFAULT_POLL_INTERVAL_MS = 5 * 1000;
const DEFAULT_BASE_URL = "http://127.0.0.1:8787";

class HttpError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

class PaymentRequiredError extends Error {
  constructor(body) {
    super("HyperCinema payment required");
    this.name = "PaymentRequiredError";
    this.body = body;
  }
}

function baseUrl() {
  return (process.env.HYPERCINEMA_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function apiHeaders(extra = {}) {
  const headers = {
    accept: "application/json",
    ...extra
  };

  const apiKey = process.env.HYPERCINEMA_API_KEY;
  if (apiKey) {
    headers.authorization = `Bearer ${apiKey}`;
  }

  return headers;
}

async function readBody(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text;
}

async function requestJson(route, init = {}) {
  const url = `${baseUrl()}${route}`;
  const response = await fetch(url, {
    ...init,
    headers: apiHeaders(init.headers || {})
  });

  const body = await readBody(response);
  if (!response.ok) {
    throw new HttpError(`HyperCinema request failed (${response.status})`, response.status, body);
  }

  return body;
}

function normalizeStatus(rawStatus) {
  const status = String(rawStatus || "").toLowerCase();
  if (status === "pending") {
    return "pending";
  }
  if (status === "processing" || status === "running" || status === "queued") {
    return "processing";
  }
  if (status === "complete" || status === "done") {
    return "complete";
  }
  if (status === "failed" || status === "error") {
    return "failed";
  }
  return "pending";
}

function extractJobId(payload) {
  return payload?.jobId || payload?.job_id || payload?.id || "";
}

function extractReportUrl(job) {
  return (
    job?.report_url ||
    job?.reportUrl ||
    job?.output?.report_url ||
    job?.output?.reportUrl ||
    null
  );
}

function extractVideoUrlFromJob(job) {
  return (
    job?.video_url ||
    job?.videoUrl ||
    job?.output?.video_url ||
    job?.output?.videoUrl ||
    job?.output?.preview_url ||
    job?.output?.previewUrl ||
    null
  );
}

function emitEvent(type, payload, onEvent) {
  const event = {
    type,
    ...payload
  };

  if (typeof onEvent === "function") {
    onEvent(event);
    return;
  }

  process.stdout.write(`[hypercinema] ${type} ${JSON.stringify(payload)}\n`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createCinemaJob(payload, onEvent) {
  try {
    return await requestJson("/api/jobs", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    if (error instanceof HttpError && error.status === 402) {
      emitEvent(
        "cinema.payment_required",
        {
          route: payload.payment_route || "sol_direct",
          details: error.body || null
        },
        onEvent
      );
      throw new PaymentRequiredError(error.body);
    }

    throw error;
  }
}

export async function fetchServiceManifest() {
  const manifest = await requestJson("/api/service", { method: "GET" });
  return {
    chains: manifest?.chains || [],
    packages: manifest?.packages || manifest?.packageTypes || [],
    stylePresets: manifest?.stylePresets || manifest?.style_presets || [],
    endpoints: manifest?.endpoints || {},
    raw: manifest
  };
}

export async function fetchCinemaJobStatus(jobId) {
  if (!String(jobId || "").trim()) {
    throw new Error("jobId is required");
  }

  const job = await requestJson(`/api/jobs/${encodeURIComponent(jobId)}`, { method: "GET" });
  return {
    jobId: extractJobId(job) || String(jobId),
    status: normalizeStatus(job?.status),
    videoUrl: extractVideoUrlFromJob(job),
    reportUrl: extractReportUrl(job),
    raw: job
  };
}

export async function fetchCinemaVideoUrl(jobId) {
  const url = `${baseUrl()}/api/video/${encodeURIComponent(jobId)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: apiHeaders(),
    redirect: "follow"
  });

  if (!response.ok) {
    const body = await readBody(response);
    throw new HttpError(`HyperCinema video lookup failed (${response.status})`, response.status, body);
  }

  if (response.redirected && response.url) {
    return response.url;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = await response.json();
    return (
      payload?.video_url ||
      payload?.videoUrl ||
      payload?.url ||
      payload?.cdn_url ||
      payload?.cdnUrl ||
      null
    );
  }

  const text = (await response.text()).trim();
  if (/^https?:\/\//i.test(text)) {
    return text;
  }

  return null;
}

async function pollUntilTerminal(jobId, onEvent) {
  const start = Date.now();

  while (Date.now() - start <= DEFAULT_TIMEOUT_MS) {
    const state = await fetchCinemaJobStatus(jobId);
    if (state.status === "pending" || state.status === "processing") {
      emitEvent("cinema.poll_tick", { jobId, status: state.status }, onEvent);
      await sleep(DEFAULT_POLL_INTERVAL_MS);
      continue;
    }

    return state;
  }

  throw new Error("HyperCinema polling timed out after 10 minutes");
}

export async function dispatchCinemaJob({
  tokenAddress,
  chain = "auto",
  packageType = "1d",
  stylePreset = process.env.HYPERCINEMA_DEFAULT_STYLE || "hyperflow_assembly",
  requestedPrompt = "",
  paymentRoute = process.env.HYPERCINEMA_PAYMENT_ROUTE || "sol_direct",
  onEvent = null
}) {
  await fetchServiceManifest();

  const requestBody = {
    tokenAddress: String(tokenAddress || "").trim(),
    chain: chain || "auto",
    packageType: packageType === "2d" ? "2d" : "1d",
    stylePreset: String(stylePreset || "hyperflow_assembly"),
    requestedPrompt: String(requestedPrompt || "").trim() || undefined,
    payment_route: paymentRoute === "x402_usdc" ? "x402_usdc" : "sol_direct"
  };

  if (!requestBody.tokenAddress) {
    throw new Error("tokenAddress is required");
  }

  const created = await createCinemaJob(requestBody, onEvent);
  const jobId = extractJobId(created);
  if (!jobId) {
    throw new Error("HyperCinema create job response did not include job id");
  }

  const firstStatus = normalizeStatus(created?.status);
  const terminal =
    firstStatus === "complete" || firstStatus === "failed"
      ? {
          jobId,
          status: firstStatus,
          reportUrl: extractReportUrl(created),
          raw: created
        }
      : await pollUntilTerminal(jobId, onEvent);

  if (terminal.status === "failed") {
    emitEvent("cinema.job_failed", { jobId, reason: terminal.raw?.error || "unknown" }, onEvent);
    throw new Error(`HyperCinema job '${jobId}' failed`);
  }

  const videoUrl = await fetchCinemaVideoUrl(jobId);
  return {
    jobId,
    videoUrl: videoUrl || undefined,
    reportUrl: terminal.reportUrl || undefined
  };
}

export { PaymentRequiredError };
