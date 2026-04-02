---
clause: ModelSovereigntyBox
version: 1
signature: ModelSovereigntyBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# ModelSovereigntyBox

**IS:** The sovereign block that owns local-first provider selection, user-supplied API-key rules, model endpoint permissions, and per-surface model policy.

**OWNS:**
- provider_registry
- allowed_model_providers
- local_key_mode_rules
- shared_key_mode_rules
- per_surface_model_permissions
- cockpit_provider_policy
- desktop_provider_policy
- browser_provider_policy
- video_provider_policy
- model_audit_log

**MAY:**
- Allow desktop users to supply their own OpenRouter keys
- Allow browser users to supply their own approved provider keys
- Allow cockpit operators to configure their own approved provider keys
- Allow user/provider choice for video generation models
- Define allowed provider lists by surface
- Define fallback rules and local-first behavior

**MAY NOT:**
- Force a single centralized provider as the only valid route
- Leak private keys into shared public state
- Allow unapproved providers outside policy
- Rewrite strategic or treasury truth

**CONNECTS TO:**
- DesktopWorldBox
- MediaSurfaceBox
- TianezhaSuperBrainBox
- PrivateSuperBrainBox
- ArchivistBox
- ArbiterBox
