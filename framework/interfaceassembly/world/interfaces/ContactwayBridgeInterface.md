# ContactwayBridgeInterface

## Purpose

Defines a bounded contact/haptics control contract for desktop, web operator GUI, and Quest VR shell.

## Owned By

InterfaceRegistryBox

## Consumed By

- HermesRuntimeBox
- QuestXrEmbodimentBox
- desktop claw-companion bridge
- web operator surface

## Input Fields

- `source_surface` (string, expected: `quest3`, `web-operator`, `desktop-shell`)
- `channel` (string, expected: `pulse`, `pattern`, `stop`, `card-feedback`)
- `pattern` (string)
- `intensity` (float, `0.0..1.0`)
- `duration_ms` (u64, `0..20000`)
- `context` (string, optional)

## Output Fields

- `accepted` (bool)
- `note` (string)
- `applied.source_surface` (string)
- `applied.channel` (string)
- `applied.pattern` (string)
- `applied.intensity` (float)
- `applied.duration_ms` (u64)
- `applied.context` (string, optional)
- `applied.created_at` (string unix timestamp)

## Invariants

- no direct truth mutation ownership
- no wallet, payment, or settlement data
- no process injection requirement in default path
- all desktop/web/VR paths must pass through kernel validation first