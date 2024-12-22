local HTTPService = game:GetService("HttpService")

local Changelog = require(game.ReplicatedFirst.Changelog)
local Versions = {}
local CachedVersions = {'CACHED_VERSIONS'}

for Version, Details in pairs(Changelog.versions) do
	if (CachedVersions[Version]) then
		continue
	end

	Versions[Version] = {
		_id = Details.Id,
		date = Details.Date,
		changed = Details.Changed or {},
		added = Details.Added or {},
		fixed = Details.Fixed or {},
	}
end

return HTTPService:JSONEncode(Versions)