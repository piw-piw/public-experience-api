_G.Server = {
    IsOnStaging = false
}

local Translations = require(game:GetService("ReplicatedFirst"):FindFirstChild("Client"):FindFirstChild("GUI"):FindFirstChild("Translations")).new()
Translations:PreloadLanguages()

local Store = require(game.ServerScriptService.Server.World.Stores["Classic Store"]).new() 
Store:CalculateSeed()

local Items = Store.CurrentItems

local ClassicStoreItems = {}
for _, item in pairs(Items) do
	local ItemInfo = game.ServerScriptService.Server.Content.Object:FindFirstChild(item, true)

	if (ItemInfo and ItemInfo:FindFirstChild("Store")) then
		local ItemDetails = require(ItemInfo.Store).new()
        local TranslatedName = Translations:GetTranslation(item)
        local CurrencyType = ItemDetails.CustomCurrency or "Cash"

        table.insert(ClassicStoreItems, {
            identifier = item,
            name = TranslatedName,
            currency = CurrencyType,
            price = ItemDetails.Price,
            type = ItemDetails.ConvertType:lower()
        })
	end
end

return ClassicStoreItems