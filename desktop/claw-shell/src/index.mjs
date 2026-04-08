const shellIdentity = {
  name: "DesktopShellBox",
  runtimeBasis: "claw-code-adapter",
  role: "desktop command-shell wrapper",
};

const kernelBaseUrl =
  process.env.KERNEL_BASE_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8787";
const appBaseUrl =
  process.env.APP_BASE_URL?.replace(/\/+$/, "") || "http://127.0.0.1:3000";
const hermesBaseUrl =
  process.env.HERMES_BASE_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8799";
const companionBaseUrl =
  process.env.COMPANION_BASE_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8798";

const mode = process.argv[2] || "status";

async function fetchJson(baseUrl, path) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} (${url})`);
  }
  return response.json();
}

async function fetchOptional(baseUrl, path) {
  try {
    const value = await fetchJson(baseUrl, path);
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function printStatus() {
  const [healthResult, manifestResult, jobsResult, hermesResult, contactwayResult] = await Promise.all([
    fetchOptional(kernelBaseUrl, "/health"),
    fetchOptional(kernelBaseUrl, "/api/service"),
    fetchOptional(kernelBaseUrl, "/api/jobs"),
    fetchOptional(hermesBaseUrl, "/status"),
    fetchOptional(companionBaseUrl, "/contactway/status"),
  ]);
  const companionResult = await fetchOptional(companionBaseUrl, "/health");

  const health = healthResult.ok ? healthResult.value : null;
  const manifest = manifestResult.ok ? manifestResult.value : null;
  const jobs = jobsResult.ok ? jobsResult.value : null;
  const hermesStatus = hermesResult.ok ? hermesResult.value : null;
  const contactwayStatus = contactwayResult.ok ? contactwayResult.value : null;
  const latestJob = jobs?.jobs?.[0] ?? null;

  console.log(`[${shellIdentity.name}] ${shellIdentity.role}`);
  console.log(`runtime: ${shellIdentity.runtimeBasis}`);
  console.log(`kernel: ${kernelBaseUrl}`);
  console.log(`web: ${appBaseUrl}`);
  console.log(`hermes: ${hermesBaseUrl}`);
  console.log(`companion: ${companionBaseUrl}`);

  if (health) {
    console.log(`health: ${health.ok ? "ok" : "degraded"} | ${health.release_focus}`);
  } else {
    console.log(`health: kernel offline (${healthResult.error})`);
  }

  if (manifest) {
    console.log(`adapter: ${manifest.adapter}`);
    console.log(`studios: ${manifest.studios.length} | styles: ${manifest.style_presets.length}`);
  } else {
    console.log(`adapter: unavailable (${manifestResult.error})`);
  }

  if (latestJob) {
    console.log(
      `latest job: ${latestJob.job_id} | ${latestJob.status} | ${latestJob.project_title}`
    );
  } else {
    console.log("latest job: none");
  }

  if (hermesStatus) {
    console.log(
      `hermes tasks: ${hermesStatus.totalTasks} ` +
      `(queued ${hermesStatus.counts.queued}, running ${hermesStatus.counts.running}, ` +
      `review ${hermesStatus.counts.review}, done ${hermesStatus.counts.done}, failed ${hermesStatus.counts.failed})`
    );
    console.log(`hermes grievances: ${hermesStatus.grievances}`);
  } else {
    console.log(`hermes tasks: runtime offline (${hermesResult.error})`);
  }

  if (companionResult.ok) {
    console.log(`companion: ok | ${companionResult.value.service}`);
  } else {
    console.log(`companion: offline (${companionResult.error})`);
  }

  if (contactwayStatus) {
    console.log(
      `contactway: ${contactwayStatus.enabled ? "enabled" : "disabled"} | ` +
      `${contactwayStatus.connected ? "connected" : "disconnected"} | ` +
      `${contactwayStatus.mode}`
    );
  } else {
    console.log(`contactway: unavailable (${contactwayResult.error})`);
  }
}

async function watch() {
  console.log(`[${shellIdentity.name}] watch mode`);
  while (true) {
    try {
      await printStatus();
    } catch (error) {
      console.error(`[${shellIdentity.name}] status check failed: ${error.message}`);
    }
    console.log("---");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

async function main() {
  if (mode === "status") {
    await printStatus();
    return;
  }

  if (mode === "watch") {
    await watch();
    return;
  }

  if (mode === "open-hypercinema") {
    const target = `${appBaseUrl}/hypercinema`;
    console.log(target);
    return;
  }

  if (mode === "brain") {
    const target = `${companionBaseUrl}/brain`;
    console.log(target);
    return;
  }

  console.error(`Unknown mode '${mode}'. Use: status | watch | brain | open-hypercinema`);
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[${shellIdentity.name}] fatal: ${error.message}`);
  process.exitCode = 1;
});
