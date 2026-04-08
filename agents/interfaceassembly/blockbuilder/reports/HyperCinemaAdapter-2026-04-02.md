# BlockBuilder Report: HyperCinemaAdapter

Date: 2026-04-02

## Scope

- Add a dedicated HyperCinema adapter surface for external multichain token video jobs.
- Route dispatch through Hermes `HyperCinemaDelegateRole` under private router ownership.
- Record cinema experiment intent in kernel before asynchronous video job polling.

## Dependencies

- `PrivateBrainRouterBox` (external dispatch ownership)
- `TruthKernelBox` (experiment record ownership)
- `SolanaAgentKitAdapter` via `RouterMoneyInterface` (payment settlement ownership)
- `EmbodimentBox` (render and playback only)

## Output surface

- Completed `video_url` + optional `report_url` returned to router/operator surfaces.
- Video URL can be rendered in Embodiment cinema screen as presentation state.

## Adapter does not own

- canonical experiment truth
- router money state
- wallet custody or key handling
- agent registry authority
