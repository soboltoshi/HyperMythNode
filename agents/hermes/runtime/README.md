# Hermes Runtime

Runnable ASIMOG/Hermes orchestration runtime for local development.

## Endpoints

- `GET /health`
- `GET /roles`
- `GET /tasks`
- `POST /tasks`
- `POST /tasks/:id/status`
- `POST /tasks/:id/grievance`
- `GET /status`
- `POST /cami/intent`
- `POST /hypercinema/dispatch`
- `GET /hypercinema/poll/:jobId`

Voice and VR instructions can be posted here indirectly through the kernel or companion routing layer. The runtime stores those requests as normal tasks, then ASIMOG-style grievance handling can move them into review when needed.

Solana-capable agents can also reach the shared `agents/solana-agent-kit` bridge, which exposes the installed Solana Agent Kit actions through HTTP and MCP for any agent that needs blockchain actions.

## Run

```powershell
cd C:\hypermythsX
npm --prefix agents/hermes/runtime run start
```

Environment:

- `HERMES_RUNTIME_PORT` (default: `8799`)
- `HERMES_RUNTIME_STATE` (default: `build/hermes/runtime-state.json`)
