local agents = {}

function agents.make_scout(id, x, y, z)
  return {
    id = id,
    name = "JarViz VR",
    role = "scout",
    position = { x = x, y = y, z = z },
    state = "idle"
  }
end

function agents.make_shell_agent()
  return {
    id = "jarviz-shell-1",
    name = "JarViz",
    role = "shell_agent",
    state = "ready"
  }
end

function agents.next_action(agent, world_signal)
  if world_signal == "anomaly" then
    return "investigate"
  end
  return "patrol"
end

return agents
