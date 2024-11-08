_G.Server = {
    IsOnStaging = false
}

local Store = require(game.ServerScriptService.Server.World.Stores["Classic Store"]).new()
Store:CalculateSeed()

local Items = Store.CurrentItems

return Items