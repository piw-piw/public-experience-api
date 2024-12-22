local Translations = require(game:GetService("ReplicatedFirst"):FindFirstChild("Client"):FindFirstChild("GUI"):FindFirstChild("Translations")).new()
Translations:PreloadLanguages()

local Content = game.ServerScriptService.Server.Content
local Objects = Content.Object:GetChildren()

local ItemsInfo = {}

for _, Object in pairs(Objects) do
	local Items = Content.Object:FindFirstChild(Object.Name):GetChildren()
	
	if (Object.Name == "Behavior") then continue end
	if (string.sub(Object.Name, 1, 1) == "_") then continue end
	
	for _, Item in pairs(Items) do
		if (string.sub(Item.Name, 1, 1) == "_") then continue end
		
		local TranslatedName = Translations:GetTranslation(Item.Name)
		local Description = Translations:GetTranslation(`{Item.Name}_description`) or ""
		
		ItemsInfo[Item.Name] = {}
		
		local ItemInfo = ItemsInfo[Item.Name]
		
		ItemInfo.details = {
			identifier = Item.Name,
			name = TranslatedName,
			description = Description
		}
		
		if (Item:FindFirstChild("Store")) then
			local StoreForm = require(Item.Store).new()
			local TranslatedName = Translations:GetTranslation(Item)
			local CurrencyType = StoreForm.CustomCurrency or "Cash"

			ItemInfo.store = {
				currency = CurrencyType,
				price = StoreForm.Price,
				type = StoreForm.ConvertType:lower()
			}
		end
		
		if (Item:FindFirstChild("Box")) then
		end
		
		if (Item:FindFirstChild("Item")) then
			if (Item:FindFirstChild("Stats")) then
				local ItemStats = require(Item.Stats)
				
				ItemInfo.item = ItemStats
			end
		end
		
		if (Item:FindFirstChild("Gift")) then
			local GiftForm = require(Item.Gift).new()
			
			ItemInfo.gift = {
				unbox_epoch = GiftForm.UnboxTime
			}
		end
	end
end

return ItemsInfo