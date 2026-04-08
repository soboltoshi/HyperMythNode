-- Game adapter helper verbs for the Unity creator shell.
-- These functions are proposal/intent surfaces only; execution happens in the Unity bridge.

-- life42 [steps] [density] [seed]
-- Example:
-- life42 7 0.22 424242
function life42(steps, density, seed)
  steps = steps or 7
  density = density or 0.22

  local command = "life42 " .. tostring(steps) .. " " .. tostring(density)
  if seed ~= nil then
    command = command .. " " .. tostring(seed)
  end

  print(command)
end

-- threecard <token_address> [style_preset] [steps] [density]
-- Example:
-- threecard 6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN hyperflow_assembly 7 0.22
function threecard(token_address, style_preset, steps, density)
  style_preset = style_preset or "hyperflow_assembly"
  steps = steps or 7
  density = density or 0.22

  if token_address == nil or token_address == "" then
    print("threecard requires token_address")
    return
  end

  local command =
    "threecard " .. tostring(token_address) ..
    " " .. tostring(style_preset) ..
    " " .. tostring(steps) ..
    " " .. tostring(density)

  print(command)
end
