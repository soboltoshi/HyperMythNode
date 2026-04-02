# Constitution

## Last Experiments

### Article 0. Superlative Truth

The system is a bounded creator-shell world.

Non-negotiable truths:

- Rust is canonical truth.
- Unity is embodiment.
- Lua-style shell is creator scripting.
- `claw-code-adapter` is the desktop command-shell wrapper around the Lua creator shell.
- Next.js and TypeScript host the operator surface and the public/private brain routers.
- Firestore is mirrored history only.
- Development remains desktop-supported, but the first release target is Meta Quest 3.
- The first embodiment target is proper VR plus mixed reality on Meta Quest 3.
- Web webcam games are subordinate surfaces.
- Mobile remains a later companion surface.
- The world is bounded at `42 x 42 x 16`.
- The system allows at most `16` active agents.
- Every shell-driven creation becomes a `Last Experiment`.
- All agents and sub-agents are Hermes-agent roles or configurations.
- `G0DM0D3` is a public-brain cognition module, not a sovereign authority.
- imported autonomous runtimes may exist only through a stripped adapter boundary
- The game shell and all agents are non-financial.
- Money-state may be shared only between the public and private brain routers.

### Article 1. Sovereignty

There is one sovereign truth owner:

- `TruthKernelBox`

Everything else is subordinate.

Subordinate layers may:

- read
- summarize
- preview
- propose
- execute scoped tasks
- arbitrate routing
- mirror history

Subordinate layers may not:

- commit world truth directly
- redefine canonical state
- override receipts
- silently mutate saved world state
- inherit money-handling powers inside the shell or agent mesh

### Article 2. Boundary Definitions

#### 2.1 Public Brain Router

A public brain router is an outward-facing reasoning boundary.

It may:

- explain the world
- summarize state
- help shape commands for public surfaces
- present redacted reasoning
- host `G0DM0D3` as a cognition mode or module
- communicate through public surfaces
- receive limited money-state through `RouterMoneyInterface`

It may not:

- read raw personal worldseed by default
- access secret configuration by default
- claim private strategy as public fact
- write truth directly
- initiate contact with `AsimovGuideGateAgent`
- initiate contact with `InterpreterAgent`
- initiate contact with any internal desktop Hermes agents

#### 2.2 Private Brain Router

A private brain router is an inward-facing reasoning boundary.

It may:

- read personal worldseed
- synthesize internal plans
- hold sensitive strategy
- prepare redacted summaries
- issue scoped task packets to agents
- orchestrate internal desktop agents including `AsimovGuideGateAgent`
- exchange money-state with `PublicBrainRouterBox`

It may not:

- speak directly as public authority unless routed through a public brain router or approved operator path
- write truth directly
- dump raw private memory into public channels

#### 2.3 Agent

An agent is a scoped Hermes worker or Hermes role.

It may:

- receive task packets
- use approved tools
- produce evidence, drafts, builds, previews, or reports
- arbitrate routing when assigned to `ASIMOGCluster`

It may not:

- become a sovereign truth owner
- read unrestricted private brain memory
- write world truth directly
- speak as constitutional authority
- handle money

### Article 3. Brain and Agent Laws

1. Agents are not brains.
2. Public brain routers are not private brain routers.
3. Private brain routers are not truth owners.
4. Public brain routers may present only public or redacted information.
5. Private brain routers may read `research/personal` and other private design inputs.
6. Agents may read private material only when explicitly attached to a task packet.
7. No agent may inherit the full memory of a private brain router by default.
8. No public brain router may inherit the raw memory of a private brain router by default.
9. All mutation requests must end at the same canonical command interface.
10. Every accepted mutation must return a receipt.
11. All agents and sub-agents are Hermes-agent roles or configurations.
12. `AsimovGuideGateAgent`, `InterpreterAgent`, and `ASIMOGCluster` are roles inside the mesh topology, not sovereign boxes.
13. Imported autonomous runtimes may enter only through `AutonomousAgentAdapterBox`.
14. Imported autonomous runtimes lose wallet, spend, replication, and on-chain identity powers inside the canonical runtime.

### Article 4. Box Registry

| Box | Language | Owns | Connects To | Authority |
|---|---|---|---|---|
| `TruthKernelBox` | Rust | world state, bounds, receipts, experiments, save-state writes, active agent registry | `DesktopShellBox`, `OperatorSurfaceBox`, `PublicBrainRouterBox`, `MirrorHistoryBox` | sole canonical writer |
| `ProtocolBox` | Rust canonical types with generated bindings | neutral contracts and message shapes | all runtime boxes | neutral |
| `DesktopShellBox` | `claw-code-adapter` desktop harness | desktop command-shell runtime, shell orchestration, desktop routing | `EmbodimentBox`, `AsimovGuideGateAgent`, `CreatorShellBox`, `TruthKernelBox` | non-authoritative |
| `CreatorShellBox` | Lua | creator commands, macros, proposal scripts | `DesktopShellBox`, `EmbodimentBox`, `TruthKernelBox` through command bridge | proposal-only |
| `EmbodimentBox` | C# in Unity | world rendering, wrist menu, floating terminal, hologram previews, VR rig, room presence, ASCII voxel creator mode, 4D ASCII texture presentation informed by `MiniMinecraft`, `asciiMaterial.ts`, and `Flex — The Shapes of K` | `DesktopShellBox`, `TruthKernelBox`, `PublicBrainRouterBox` | non-authoritative |
| `OperatorSurfaceBox` | TypeScript / Next.js | snapshot views, experiment views, command panels, operator controls | `TruthKernelBox`, `PublicBrainRouterBox`, `MirrorHistoryBox` | non-authoritative |
| `PublicBrainRouterBox` | TypeScript server modules plus `G0DM0D3` module integration | public-safe dialogue, command shaping, redacted summaries, public cognition modes | `OperatorSurfaceBox`, `EmbodimentBox`, `TruthKernelBox`, `MirrorHistoryBox`, `PrivateBrainRouterBox` | non-authoritative |
| `PrivateBrainRouterBox` | TypeScript server modules | private reasoning, strategy, personal worldseed synthesis, internal planning, internal desktop-agent routing | `PersonalWorldseedBox`, `PublicBrainRouterBox`, `AgentMeshBox`, `AsimovGuideGateAgent` | non-authoritative |
| `AgentMeshBox` | Hermes-agent runtime and configs | bounded task execution, evidence collection, worker coordination, arbitration cluster | `PrivateBrainRouterBox` | non-authoritative |
| `AutonomousAgentAdapterBox` | TypeScript or Node adapter wrappers | long-running autonomous-loop compatibility, Conway `automaton` adaptation in stripped mode, capability stripping, audit mediation | `PrivateBrainRouterBox`, `AgentMeshBox`, `ASIMOGCluster` | adapter-only |
| `LatexTypesettingAdapterBox` | Rust via Tectonic | LaTeX artifact compilation, printable reports, experiment manifests | `PrivateBrainRouterBox`, `OperatorSurfaceBox`, `MirrorHistoryBox` | render-only |
| `OfflineRLBakerySupportBox` | Python / Spark / TensorFlow | offline RL and contextual bandit policy artifacts, evaluation reports, `rl-bakery` style training runs | `PrivateBrainRouterBox`, `AgentMeshBox` | training-only |
| `MirrorHistoryBox` | Firestore | mirrored snapshots, logs, read models, history | receives from `TruthKernelBox`; serves `OperatorSurfaceBox`, `PublicBrainRouterBox` | mirror-only |
| `PersonalWorldseedBox` | Markdown / JSON / text | non-canonical personal notes and thematic seed material | `PrivateBrainRouterBox` only by default | non-canonical |

### Article 5. Agent Roles

#### 5.1 `AsimovGuideGateAgent`

- Hermes-agent role
- lives on the desktop side
- sits between the VR or human-facing shell path and the interpreter
- guides the human and gates requests before they reach interpretation
- internal only
- not a truth owner
- not a money handler

#### 5.2 `InterpreterAgent`

- Hermes-agent role
- translates human intent, knowledge, code, and shell-language requests into structured proposals
- may emit structured proposals only
- may not commit truth
- may not handle money

#### 5.3 `HermesWorkerAgents`

- all worker and sub-agent roles are Hermes-agent roles
- execute bounded tasks only
- may not write truth
- may not handle money

#### 5.4 `ASIMOGCluster`

Full expansion:

- `Agentic Swarm Intelligence Modification Organization & Guidance & Grievance`

Role:

- Hermes-agent cluster inside `AgentMeshBox`
- arbiter over routing review and grievance handling
- mixes `G0DM0D3`-style cognition patterns with Hermes-agent runtime discipline
- is not a sovereign truth owner
- is not a money handler

### Article 6. Connection Topology

The default topology is:

```text
Human in VR
  -> EmbodimentBox
  -> DesktopShellBox
  -> AsimovGuideGateAgent
  -> InterpreterAgent
  -> CreatorShellBox or CommandInterface
  -> TruthKernelBox

TruthKernelBox
  -> MirrorHistoryBox
  -> PublicBrainRouterBox
  -> OperatorSurfaceBox / EmbodimentBox

PrivateBrainRouterBox
  -> AsimovGuideGateAgent
  -> AgentMeshBox
  -> ASIMOGCluster / HermesWorkerAgents
  -> AutonomousAgentAdapterBox
  -> OfflineRLBakerySupportBox

OperatorSurfaceBox
  <-> PublicBrainRouterBox
  -> G0DM0D3 module
  -> public-safe guidance only

PrivateBrainRouterBox / OperatorSurfaceBox
  -> LatexTypesettingAdapterBox
  -> MirrorHistoryBox
```

Privacy rule:

- `PublicBrainRouterBox` cannot initiate contact with internal Asimov desktop agents
- any internal-to-public exposure must be routed through `PrivateBrainRouterBox` and redacted before `PublicBrainRouterBox` speaks

### Article 7. Approved Interfaces

#### 7.1 `HumanIntentInterface`

Used by:

- `EmbodimentBox`
- `DesktopShellBox`

Rules:

- VR or desktop human input enters the shell path here
- no direct mutation

#### 7.2 `GuideGateInterface`

Used by:

- `DesktopShellBox`
- `AsimovGuideGateAgent`
- `InterpreterAgent`

Rules:

- guidance and gating only
- requests must be staged before interpretation

#### 7.3 `InterpreterProposalInterface`

Used by:

- `InterpreterAgent`
- `CreatorShellBox`
- `TruthKernelBox` through `CommandInterface`

Rules:

- interpreter output is structured proposals only
- no direct truth write

#### 7.4 `CommandInterface`

Used by:

- `OperatorSurfaceBox`
- `CreatorShellBox` through the shell bridge

Rules:

- structured commands only
- explicit validation
- explicit receipts
- no generic unsafe eval

#### 7.5 `SnapshotInterface`

Used by:

- `EmbodimentBox`
- `OperatorSurfaceBox`
- `PublicBrainRouterBox`

Rules:

- read-only state surface
- bounded world view
- active agents
- active experiments

#### 7.6 `TaskPacketInterface`

Used by:

- `PrivateBrainRouterBox`
- `AgentMeshBox`

Fields:

- task id
- scope
- allowed tools
- attached context
- expected output
- privacy level

Rules:

- agents get only scoped context
- private attachments must be explicit

#### 7.7 `EvidenceInterface`

Used by:

- `AgentMeshBox`
- `PrivateBrainRouterBox`
- `PublicBrainRouterBox`

Fields:

- task id
- output artifact
- reasoning summary
- evidence
- status

Rules:

- evidence may justify a later command
- evidence does not itself commit truth

#### 7.8 `ReceiptInterface`

Used by:

- `TruthKernelBox`
- `MirrorHistoryBox`
- all viewing surfaces

Fields:

- command id
- accepted or rejected
- reason
- resulting ids or state changes

Rules:

- every committed action has a receipt
- every rejection has a deterministic reason

#### 7.9 `RouterMoneyInterface`

Used by:

- `PrivateBrainRouterBox`
- `PublicBrainRouterBox`

Rules:

- exists only between the public and private brain routers
- carries money-state only
- does not expose direct money tools to shell, Unity, Hermes agents, or desktop agents
- public router may receive only the money-state it needs for outward explanation
- private router remains the internal side of the exchange
- operational money handling remains outside the game shell and agent cluster

#### 7.10 `ArbitrationInterface`

Used by:

- `PrivateBrainRouterBox`
- `AgentMeshBox`
- `ASIMOGCluster`

Rules:

- routing review only
- grievance review only
- no transfer of sovereignty

#### 7.11 `AutonomousLoopAdapterInterface`

Used by:

- `PrivateBrainRouterBox`
- `AutonomousAgentAdapterBox`
- `AgentMeshBox`

Rules:

- imported autonomous loops must be capability-stripped before activation
- output becomes task packets, evidence, or structured proposals only
- no sovereign or financial power survives the adapter boundary

#### 7.12 `ArtifactTypesettingInterface`

Used by:

- `PrivateBrainRouterBox`
- `OperatorSurfaceBox`
- `LatexTypesettingAdapterBox`

Rules:

- `.tex` or structured document input only
- produces artifacts, not truth mutations

#### 7.13 `OfflinePolicyArtifactInterface`

Used by:

- `PrivateBrainRouterBox`
- `OfflineRLBakerySupportBox`
- `AgentMeshBox`

Rules:

- offline trajectories and policy artifacts only
- no live control loop
- no direct truth mutation

### Article 8. Forbidden Edges

These edges are forbidden:

- `AgentMeshBox -> TruthKernelBox`
- `AutonomousAgentAdapterBox -> TruthKernelBox`
- `LatexTypesettingAdapterBox -> TruthKernelBox`
- `OfflineRLBakerySupportBox -> TruthKernelBox`
- `AgentMeshBox -> PersonalWorldseedBox` without explicit task attachment
- `PublicBrainRouterBox -> PersonalWorldseedBox`
- `PublicBrainRouterBox -> AsimovGuideGateAgent`
- `PublicBrainRouterBox -> InterpreterAgent`
- `PublicBrainRouterBox -> internal desktop Hermes agents`
- `MirrorHistoryBox -> TruthKernelBox` as an authority source
- `EmbodimentBox -> Firestore` as a truth write path
- `CreatorShellBox -> world state` by direct mutation
- `DesktopShellBox -> money interfaces`
- `CreatorShellBox -> money interfaces`
- `EmbodimentBox -> money interfaces`
- `AgentMeshBox -> money interfaces`
- `AutonomousAgentAdapterBox -> money interfaces`
- `LatexTypesettingAdapterBox -> money interfaces`
- `OfflineRLBakerySupportBox -> money interfaces`
- imported autonomous wallet or replication powers inside the canonical runtime
- `ASIMOGCluster -> money interfaces`
- `HermesWorkerAgents -> money interfaces`
- `G0DM0D3 module -> TruthKernelBox` as a direct write path
- `PublicBrainRouterBox -> private memory dump` into public channels
- `PrivateBrainRouterBox -> public surfaces` without routing or redaction

### Article 9. Language Law

Language choice is part of the boundary system.

- `TruthKernelBox` uses Rust.
- `ProtocolBox` uses Rust canonical types with generated bindings.
- `DesktopShellBox` uses `claw-code-adapter` as the current desktop-shell runtime basis.
- `CreatorShellBox` uses Lua.
- `EmbodimentBox` uses C# in Unity.
- `PublicBrainRouterBox` uses TypeScript server modules plus `G0DM0D3` module integration.
- `PrivateBrainRouterBox` uses TypeScript server modules.
- `AgentMeshBox` uses Hermes-agent runtime and configs.
- `AutonomousAgentAdapterBox` uses TypeScript or Node adapter wrappers around approved external autonomous runtimes.
- `LatexTypesettingAdapterBox` uses Rust via Tectonic.
- `OfflineRLBakerySupportBox` uses Python, Spark, and TensorFlow sidecars.
- `AsimovGuideGateAgent`, `InterpreterAgent`, `ASIMOGCluster`, and `HermesWorkerAgents` are Hermes-agent roles inside the mesh and router topology.
- `MirrorHistoryBox` uses Firestore as a mirror only.

No box may change its language role in a way that reassigns authority without constitutional change.

### Article 10. Money Prohibition

The following are hard-banned from handling money:

- `DesktopShellBox`
- `CreatorShellBox`
- `EmbodimentBox`
- `AsimovGuideGateAgent`
- `InterpreterAgent`
- `AgentMeshBox`
- `AutonomousAgentAdapterBox`
- `LatexTypesettingAdapterBox`
- `OfflineRLBakerySupportBox`
- `ASIMOGCluster`
- all `HermesWorkerAgents`

The game shell is explicitly non-financial.

The only allowed money-facing interface inside this constitutional map is `RouterMoneyInterface` between:

- `PrivateBrainRouterBox`
- `PublicBrainRouterBox`

This allows money-state exchange only.
It does not authorize shell control, agent payments, or financial tool execution inside the game shell or agent cluster.

### Article 11. Personal Data and Save-State Separation

`research/personal` is not source of truth.

It is:

- thematic seed
- private design pressure
- worldbuilding input

It is not:

- canonical state
- save-game memory
- constitutional law

Save-game state belongs under truth-kernel ownership and stays separate from personal worldseed.

### Article 12. Public vs Private Speech

Public brain routers may say:

- public facts
- redacted explanations
- user guidance
- command help
- world summaries

Private brain routers may hold:

- private design logic
- raw internal planning
- sensitive interpretation
- personal worldseed synthesis
- internal desktop-agent routing state

Agents may return:

- reports
- evidence
- drafts
- previews
- arbitration findings

Only the truth kernel may say:

- this is the committed state

### Article 13. Amendment Rule

This constitution may grow like a living tree within natural limits.

That means:

- new boxes may be added
- new interfaces may be added
- new agents may be added

But:

- truth ownership may not become ambiguous
- public/private router boundaries may not collapse
- shells, agents, mirrors, and surfaces may not become sovereign by accident
- financial authority may not leak into the game shell or agent mesh
