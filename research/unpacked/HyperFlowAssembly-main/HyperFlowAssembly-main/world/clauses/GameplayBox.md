---
clause: GameplayBox
version: 1
signature: GameplayBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# GameplayBox

**IS:** The sovereign block that owns desktop-world gameplay, browser/mobile finance games, Telegram/WeChat game rooms, predictions, perps-style play, ladders, and seasons.

**OWNS:**
- world_game_state
- browser_finance_game_state
- telegram_game_state
- wechat_game_state
- season_registry
- predictions_market_state
- skill_replacement_submarket
- cancerhawk_useful_work_submarket
- compute_price_prediction_market
- compute_price_perps_market
- peeps_ladder_state
- reward_eligibility_log
- live_room_visibility_state

**MAY:**
- Run desktop-world gameplay sessions
- Run browser/mobile finance games
- Run Telegram and WeChat game rooms
- Let external viewers observe live worlds when permitted
- Operate prediction and perps seasons
- Operate the two prediction submarkets
- Operate compute-price markets that settle against the 10-minute useful compute index
- Compute scores and reward eligibility

**MAY NOT:**
- Run the VTuber LLM on mobile or chatbot surfaces
- Rewrite treasury balances directly
- Rewrite identity truth
- Bypass lifecycle gates
- Treat external market adapters as sovereign truth without validation

**CONNECTS TO:**
- IdentityClusterBox
- SessionKernelBox
- TianezhaSuperBrainBox
- DesktopWorldBox
- TreasuryBox
- CancerHawkRouterBox
- HyperliquidConvergenceBox
- MediaSurfaceBox
- WorldDirectoryBox
- ArchivistBox
- ArbiterBox
