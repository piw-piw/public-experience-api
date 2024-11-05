local OffsetTime = math.floor(os.time() / 3600)
local TimeLeft = (3600 - (os.time() - OffsetTime * 3600))
local NextReset = math.floor(os.time() + TimeLeft)

local CurrentPosition = Random.new(OffsetTime):NextInteger(1, 4)
local NextPosition = Random.new(OffsetTime + 1):NextInteger(1, 4)

local ResponsePayload = {
    current_position = CurrentPosition,
    next_position = NextPosition,
    next_reset = NextReset
}

return ResponsePayload

-- Locations = {
--     1 = "Desert",
--     2 = "LowerMeadows",
--     3 = "Savannah",
--     4 = "RiverCave"
-- }