_G.Server = {
	IsOnStaging = false
}

local RockRNG = require(game.ServerScriptService.Server.Generation.Rocks.Variants._RockClass.RNG)

local RNG = {}

function formatKey(input: string)
	return input
		:gsub("(%u)", "_%1")
		:gsub("%s+", "_")
		:gsub("^_", "")
		:gsub("__+", "_")
		:lower()
end

for Key, Rocks in pairs(RockRNG) do
	local RockKey = formatKey(Key)
	
	if (not RNG[RockKey]) then
		RNG[RockKey] = {}	
	end
	
	for Key, Region in pairs(Rocks) do
		local RegionKey = formatKey(Key)

		if (not RNG[RockKey][RegionKey]) then
			RNG[RockKey][RegionKey] = {}
		end
		
		for Key, Data in pairs(Region) do
			if (Key == false) then
				RNG[RockKey][RegionKey][Key] = nil
				RNG[RockKey][RegionKey]["_none"] = Data
				continue
			end

			local DataKey = formatKey(Key)
			RNG[RockKey][RegionKey][DataKey] = Data
		end
	end
end

return RNG