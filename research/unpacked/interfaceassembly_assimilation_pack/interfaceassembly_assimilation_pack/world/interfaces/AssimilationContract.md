# Shared Interface: AssimilationContract

## Purpose

This contract defines the neutral payload shape for translating a foreign system into Interface Assembly language.

## Intake

```json
{
  "source_type": "github_repo|local_folder|service_api|model_stack",
  "source_ref": "string",
  "target_world": "string",
  "desired_role": "optional string",
  "target_mesh": "optional string",
  "deployment_mode": "optional string",
  "notes": "optional string"
}
```

## Required output sections

```json
{
  "assimilation_report": {
    "summary": "string",
    "classification": "CoreBlock|Adapter|SharedInterface|ToolSurface|MeshNode|Sidecar|ReferenceOnly",
    "reasoning": ["string"]
  },
  "box_map": {
    "top_level_units": [
      {
        "name": "string",
        "role": "string",
        "kind": "box|service|store|ui|worker|adapter"
      }
    ]
  },
  "runtime_contract": {
    "languages": ["string"],
    "frameworks": ["string"],
    "services": ["string"],
    "storage": ["string"],
    "ports": ["string"],
    "deployment_modes": ["string"]
  },
  "environment_contract": {
    "required_env": ["string"],
    "optional_env": ["string"]
  },
  "mesh_role": {
    "role": "string",
    "job_types": ["string"],
    "return_types": ["string"]
  },
  "risk_register": {
    "license": "string",
    "runtime_weight": "low|medium|high",
    "coupling_risk": "low|medium|high",
    "notes": ["string"]
  },
  "interface_url_set": ["string"],
  "adoption_recommendation": "wrap_as_adapter|embed_ui_only|reuse_backend_only|rewrite_primitives|leave_outside_world"
}
```

## Notes

- Output may be partial if the source is incomplete.
- Unknowns must be explicitly marked as unknown.
- Classification is proposed by the assimilation flow and ratified by WorldBuilder.
