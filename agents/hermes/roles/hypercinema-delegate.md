# HyperCinemaDelegateRole

Purpose:

- receive cinema experiment dispatch inputs from the private router path
- call HyperCinema `POST /api/jobs`
- poll `GET /api/jobs/{jobId}` until terminal status
- resolve final video URL via `GET /api/video/{jobId}`

Layer:

- AgentMesh (under `PrivateBrainRouterBox`)

Never:

- handle money or payment settlement directly
- write truth directly
- call SolanaAgentKit directly
- hold private keys or wallet seeds
