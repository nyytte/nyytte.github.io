--!strict

local Server = require(script.ControllerManagerServer)
local Client = require(script.ControllerManagerClient)

export type Server = Server.ServerControllerManager
export type Client = Client.ControllerManager
export type Controller = Client.Controller
export type Options = Client.Options

return {
	Server = Server,
	Client = Client,
}
