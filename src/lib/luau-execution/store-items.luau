_G.Server = {
	IsOnStaging = false
}

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
		local ItemInfo = game.ServerScriptService.Server.Content.Object:FindFirstChild(item, true)
		
		if (ItemInfo and ItemInfo:FindFirstChild("Store")) then
			local ItemDetails = require(ItemInfo.Store).new()
			local TranslatedName = Translations:GetTranslation(item)
			local CurrencyType = ItemDetails.CustomCurrency or "Cash"
			
			table.insert(StoreItems[StoreName], {
				identifier = item,
				name = TranslatedName,
				currency = CurrencyType,
				price = ItemDetails.Price,
				type = ItemDetails.ConvertType:lower()
			})
		end
	end
end

return StoreItems