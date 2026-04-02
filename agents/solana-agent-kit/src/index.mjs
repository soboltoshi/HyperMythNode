import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { KeypairWallet, SolanaAgentKit } from "solana-agent-kit";
import { startMcpServer } from "@solana-agent-kit/adapter-mcp";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import NFTPlugin from "@solana-agent-kit/plugin-nft";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");

const mode = (process.argv[2] || "status").toLowerCase();
const bindHost = process.env.SOLANA_AGENT_BIND_HOST || "127.0.0.1";
const bindPort = Number.parseInt(process.env.SOLANA_AGENT_PORT || "8801", 10);
const rpcUrl = process.env.RPC_URL || process.env.SOLANA_RPC_URL || "";
const privateKey = process.env.SOLANA_PRIVATE_KEY || "";
const openAiKey = process.env.OPENAI_API_KEY || "";
const defaultPlugins = ["token", "nft"];

let cachedAgent;

function requireConfiguration() {
  if (!rpcUrl) {
    throw new Error("RPC_URL or SOLANA_RPC_URL is required");
  }

  if (!privateKey) {
    throw new Error("SOLANA_PRIVATE_KEY is required");
  }
}

function getConfigurationState() {
  return {
    configured: Boolean(rpcUrl && privateKey),
    missing: [
      !rpcUrl ? "RPC_URL or SOLANA_RPC_URL" : null,
      !privateKey ? "SOLANA_PRIVATE_KEY" : null,
    ].filter(Boolean),
  };
}

function buildAgent() {
  if (cachedAgent) {
    return cachedAgent;
  }

  requireConfiguration();

  const keypair = Keypair.fromSecretKey(parsePrivateKey(privateKey));
  const wallet = new KeypairWallet(keypair, rpcUrl);
  const agent = new SolanaAgentKit(wallet, rpcUrl, {
    OPENAI_API_KEY: openAiKey,
  })
    .use(TokenPlugin)
    .use(NFTPlugin);

  cachedAgent = {
    agent,
    walletAddress: keypair.publicKey.toBase58(),
  };
  return cachedAgent;
}

function capabilityManifest() {
  const config = getConfigurationState();
  if (!config.configured) {
    return {
      ok: true,
      service: "solana-agent-kit-bridge",
      configured: false,
      missing: config.missing,
      plugins: defaultPlugins,
      rpcUrl: rpcUrl || null,
      walletAddress: null,
      actionCount: 0,
      actions: [],
      interfaces: {
        http: `http://${bindHost}:${bindPort}`,
        mcp: "stdio",
      },
      repoRoot,
    };
  }

  const { agent, walletAddress } = buildAgent();
  return {
    ok: true,
    service: "solana-agent-kit-bridge",
    configured: true,
    plugins: defaultPlugins,
    walletAddress,
    rpcUrl,
    actionCount: agent.actions.length,
    actions: agent.actions.map((action) => ({
      name: action.name,
      similes: action.similes,
      description: action.description,
    })),
    interfaces: {
      http: `http://${bindHost}:${bindPort}`,
      mcp: "stdio",
    },
    repoRoot,
  };
}

function parsePrivateKey(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    throw new Error("SOLANA_PRIVATE_KEY is required");
  }

  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      throw new Error("JSON private key must be an array of bytes");
    }

    return Uint8Array.from(parsed.map((item) => Number(item)));
  }

  const hexLike = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (/^[0-9a-fA-F]+$/.test(hexLike) && hexLike.length % 2 === 0) {
    return Uint8Array.from(Buffer.from(hexLike, "hex"));
  }

  return bs58.decode(trimmed);
}

async function callAction(actionName, input) {
  const { agent } = buildAgent();
  const action = agent.actions.find((candidate) => candidate.name === actionName);
  if (!action) {
    throw new Error(`unknown action '${actionName}'`);
  }

  return action.handler(agent, input || {});
}

async function serve() {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://${request.headers.host || bindHost}`);

      if (request.method === "GET" && url.pathname === "/health") {
        response.statusCode = 200;
        response.setHeader("content-type", "application/json; charset=utf-8");
        response.end(JSON.stringify(capabilityManifest()));
        return;
      }

      if (request.method === "GET" && url.pathname === "/status") {
        response.statusCode = 200;
        response.setHeader("content-type", "application/json; charset=utf-8");
        response.end(JSON.stringify(capabilityManifest()));
        return;
      }

      if (request.method === "GET" && url.pathname === "/manifest") {
        response.statusCode = 200;
        response.setHeader("content-type", "application/json; charset=utf-8");
        response.end(JSON.stringify(capabilityManifest()));
        return;
      }

      if (request.method === "POST" && url.pathname === "/call") {
        const chunks = [];
        for await (const chunk of request) {
          chunks.push(chunk);
        }
        const payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        const result = await callAction(
          String(payload.action || payload.name || "").trim(),
          payload.input || payload.args || {}
        );
        response.statusCode = 200;
        response.setHeader("content-type", "application/json; charset=utf-8");
        response.end(JSON.stringify({ ok: true, result }));
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

  server.listen(bindPort, bindHost, () => {
    console.log(`[solana-agent-kit] listening on http://${bindHost}:${bindPort}`);
    console.log(`[solana-agent-kit] wallet ${capabilityManifest().walletAddress}`);
  });
}

async function runMcp() {
  const { agent } = buildAgent();
  const actions = Object.fromEntries(agent.actions.map((action) => [action.name, action]));
  await startMcpServer(actions, agent, {
    name: "solana-agent-kit",
    version: "0.1.0",
  });
}

async function main() {
  if (mode === "status") {
    console.log(JSON.stringify(capabilityManifest(), null, 2));
    return;
  }

  if (mode === "serve") {
    await serve();
    return;
  }

  if (mode === "mcp") {
    await runMcp();
    return;
  }

  console.error(`Unknown mode '${mode}'. Use: status | serve | mcp`);
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[solana-agent-kit] fatal: ${error.message}`);
  process.exitCode = 1;
});
