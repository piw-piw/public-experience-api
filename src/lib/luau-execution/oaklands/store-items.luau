_G.Server = {
	IsOnStaging = false
}

for _,v in pairs(game.Workspace.Worlds:GetChildren()) do
    if (v.Name == "Shared" or v.Name == "Finlay") then
        for _,Inst in pairs(v:GetChildren()) do
            Inst.Parent = game.Workspace.World
        end
    end
end

local Translations = require(game:GetService("ReplicatedFirst"):FindFirstChild("Client"):FindFirstChild("GUI"):FindFirstChild("Translations")).new()
Translations:PreloadLanguages()

local Stores = game.Workspace.World.Regions.Stores:GetChildren()
local StoreItems = {}

function RemoveDupes(items)
	local Items = {}
	local ItemCheck = {}

	for _, item in (items) do
		local ItemName = item.Name

		if (item:GetAttribute("StagingOnly")) then continue end
		if (ItemCheck[ItemName]) then continue end

		ItemCheck[ItemName] = true
		table.insert(Items, ItemName)
	end

	return Items
end

function FormatName(input)
	return input
		:gsub("[\"']", "")
		:gsub("(%u)", "-%1")
		:gsub("%s+", "-")
		:gsub("^-", "")
		:gsub("-+", "-")
		:lower()
end

for _, store in pairs(Stores) do
	local Items = store:FindFirstChild("Items")

	if (not Items) then continue end
	if (store.Name == "Classic Store") then continue end

	local StoreName = FormatName(store.Name)
	local ItemsList = RemoveDupes(Items:GetChildren())

	if (#ItemsList == 0) then continue end

	if (not StoreItems[StoreName]) then
		StoreItems[StoreName] = {}
	end

	for _, item in ItemsList do	
		table.insert(StoreItems[StoreName], item)
	end
end

print (StoreItems)

return StoreItems