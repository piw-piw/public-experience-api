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

local Store = require(game.ServerScriptService.Server.World.Stores.Finlay["Classic Store"]).new()
Store:CalculateSeed()

local Items = Store.CurrentItems

return Items