# HyperCinemaAdapter

## External service

HyperCinema (HashCinema multichain memecoin video generator).

## Transport

HTTP REST with service manifest at `GET /api/service`.

## Dispatch path

`PrivateBrainRouterBox` -> `HyperCinemaDelegateRole` (Hermes) -> `POST /api/jobs`.

## Payment path

`PrivateBrainRouterBox` -> `RouterMoneyInterface` -> `SolanaAgentKitAdapter`.

## Output path

`job video URL` -> `TruthKernelBox` experiment record -> `EmbodimentBox` display.

## Does not own

- world truth
- agent registry
- money state

## Capability stripping

- no webhook registration inside HyperMythNode
- no payment key generation inside HyperMythNode
- payment and settlement authority stays external via `SolanaAgentKitAdapter`
