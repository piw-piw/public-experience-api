_G.Server = {
    IsOnStaging = false
}

local MaterialValues = require(game.ServerScriptService.Server.Economy.MaterialValues).new()

local TreesV2 = require(game.ServerScriptService.Server.Generation.TreesV2).new()
local Rocks = require(game.ServerScriptService.Server.Generation.Rocks).new()

Rocks:PreloadVariants()
Rocks:PreloadOres()
TreesV2:PreloadSpecies()

function MaterialValues:UpdateAllDisplays()
    return
end

function MaterialValues:GetClassFromType(Material: string, Type: string)
    local Class = nil

    if (Type == "Trees") then
        Class = TreesV2
        Class = Class and Class.TreeSpecies
        Class = Class and Class:GetSpeciesModule(Material)
    end
    
    if (Type == "Rocks") then
        Class = Rocks
        Class = Class and Class.RockVariants
        Class = Class and Class:GetVariantModule(Material)
    end

    if (Type == "Ores") then
        Class = Rocks
        Class = Class and Class.RockOres
        Class = Class and Class:GetOreModule(Material)
    end

    if (not Class) then
        return nil
    end
    
    return Class
end

MaterialValues:UpdateMaterialValues()

MaterialValues.LastRandom = Random.new(MaterialValues.MaterialValuesLastSeed)
MaterialValues.CurrentRandom = Random.new(MaterialValues.MaterialValuesUpdatedSeed)

return MaterialValues:CreateFormattedValues()