local worldgen = {}

function worldgen.seeded_height(x, y, z, seed)
  local value = math.sin((x + seed) * 0.17) + math.cos((z - seed) * 0.13) + math.sin((y + z) * 0.07)
  return value
end

function worldgen.generate_block(x, y, z, seed)
  local h = worldgen.seeded_height(x, y, z, seed)
  if h > 1.2 then
    return "crystal"
  elseif h > 0.3 then
    return "stone"
  elseif h > -0.4 then
    return "dust"
  end
  return "void"
end

return worldgen
