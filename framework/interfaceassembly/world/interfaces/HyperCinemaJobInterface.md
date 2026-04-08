# HyperCinemaJobInterface

## Purpose

Defines the shared cinema job contract between private router orchestration, Hermes delegation, kernel experiment records, and embodiment display.

## Owned By

InterfaceRegistryBox

## Consumed By

- PrivateBrainRouterBox
- HermesRuntimeBox (`HyperCinemaDelegateRole`)
- TruthKernelBox
- EmbodimentBox

## Input Contract

From `PrivateBrainRouterBox` to `HyperCinemaDelegateRole`:

- `token_address`: string
- `chain`: string (default: `"auto"`)
- `package_type`: `"1d" | "2d"`
- `style_preset`: string
- `creative_prompt?`: string
- `payment_route`: `"x402_usdc" | "sol_direct"`

## Output Contract

From `HyperCinemaDelegateRole` to `TruthKernelBox` + `EmbodimentBox`:

- `job_id`: string
- `status`: `"pending" | "processing" | "complete" | "failed"`
- `video_url?`: string
- `report_url?`: string
- `experiment_id`: string

## Invariants

- no payment keys or wallet seeds travel through this interface
- Solana settlement is resolved by `SolanaAgentKitAdapter`, not Hermes workers
- `video_url` is display output only and does not mutate truth on its own
