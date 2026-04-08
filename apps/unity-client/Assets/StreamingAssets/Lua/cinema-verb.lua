-- cinema verb proposal helper
-- Usage:
-- cinema <token_address> [style_preset] [duration]
-- Example:
-- cinema 6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN hyperflow_assembly 1d

function cinema(token_address, style_preset, duration)
  style_preset = style_preset or "hyperflow_assembly"
  duration = duration or "1d"

  if token_address == nil or token_address == "" then
    print("cinema requires token_address")
    return
  end

  -- Proposal-only: creator shell does not dispatch jobs directly.
  if kernel ~= nil and kernel.propose ~= nil then
    kernel.propose("CreateCinemaExperiment", {
      token_address = token_address,
      chain = "auto",
      package_type = duration,
      style_preset = style_preset,
      payment_route = "sol_direct"
    })
    return
  end

  print("kernel.propose unavailable; cinema proposal not dispatched")
end
