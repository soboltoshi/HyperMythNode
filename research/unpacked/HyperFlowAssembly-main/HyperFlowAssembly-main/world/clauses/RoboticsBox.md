---
clause: RoboticsBox
version: 1
signature: RoboticsBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# RoboticsBox

**IS:** The sovereign block that owns bounded physical outputs, actuator policy, and machine-output safety gates.

**OWNS:**
- actuator_policy
- allowed_trigger_registry
- physical_output_log
- device_risk_rules
- emergency_kill_policy

**MAY:**
- Accept approved triggers from SessionKernelBox or owning blocks
- Route device actions through RoboticsDeviceAdapter
- Enforce safety gates and kill policies

**MAY NOT:**
- Bypass SessionKernelBox safety gates
- Accept arbitrary public triggers
- Rewrite protocol truth

**CONNECTS TO:**
- SessionKernelBox
- ArchivistBox
- ArbiterBox
