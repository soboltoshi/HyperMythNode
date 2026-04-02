local shell_macros = {}

function shell_macros.agent_name(is_vr)
  if is_vr then
    return "JarViz VR"
  end
  return "JarViz"
end

function shell_macros.spawn_scouts(count, location)
  return {
    agent = "JarViz",
    action = "spawn_agents",
    count = count,
    role = "scout",
    location = location,
    security_profile = "jarwiz_security",
  }
end

function shell_macros.request_scan(target)
  return {
    agent = "JarViz",
    action = "request_world_scan",
    target = target,
    security_profile = "jarwiz_security",
  }
end

return shell_macros
