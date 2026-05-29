--!strict
--[[
	RNGController (Client)
	Mirrors the server's loot math for instant visual feedback, but defers every
	authoritative roll to the server. A global debounce kills duplicate/ghost
	fires, and a Charm-backed PlayerState keeps the React UI in sync.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Packages = ReplicatedStorage:WaitForChild("Packages")

local ClientRNG = script.Parent
local ActionInputSystem = ReplicatedStorage:WaitForChild("Assets").ActionInputSystem

-- Modules
local Networker = require(Packages.Networker)
local Signal = require(Packages.Signal)
local Janitor = require(Packages.Janitor)

local CaseConfig = require(ClientRNG.Cases.CaseConfig) :: { [string]: any }
local LootTable = require(ClientRNG.Helpers.LootTable)
local RNGConstants = require(ClientRNG.Constants.RNGConstants)

local UIState = ReplicatedStorage:WaitForChild("Client").UI.State
local PlayerState = require(UIState.PlayerState) :: any

export type RollResult = {
	Item: string,
	Rarity: string,
}

local RNGController = {}
RNGController.__index = RNGController

function RNGController.new(Character: any, Manager: any): RNGController
	local self = setmetatable({
		Character = Character,
		Manager = Manager,
		Janitor = Janitor.new(),
		Network = nil :: any,
		IsRolling = false,
		Ready = false, -- Blocks rolls until the server confirms data is loaded
		CaseTables = {} :: { [string]: LootTable.LootTable },
		OnRoll = Signal.new(),
	}, RNGController)

	self.Network = Networker.client.new("RNGService", self)

	for CaseName, Data in pairs(CaseConfig) do
		self.CaseTables[CaseName] = LootTable.new(Data)
	end

	return self
end

function RNGController.Initialize(self: RNGController)
	-- Confirm readiness before allowing any rolls
	task.spawn(function()
		while true do
			local Data = self.Network:fetch("GetRNGData")
			if Data then
				self.Ready = true
				print("RNGController: Ready to roll!")
				break
			else
				warn("RNGController: Server RNG data not available yet. Retrying...")
				task.wait(1)
			end
		end
	end)

	self.Janitor:Add(ActionInputSystem.Boxes.Roll.Pressed:Connect(function()
		self:OpenCase("BasicCase")
	end))
end

function RNGController.OpenCase(self: RNGController, CaseName: string): boolean
	if self.IsRolling or not self.Ready then
		return false
	end

	-- Run the request off the input thread so it never freezes the UI or keybind.
	task.spawn(function()
		local Result = self:PredictAndRoll(CaseName)
		if Result then
			self.OnRoll:Fire(CaseName, Result)
		end
	end)

	return true
end

local LastRollTime = 0

function RNGController.PredictAndRoll(self: RNGController, CaseName: string): RollResult?
	-- Block rolls if data hasn't loaded from the server yet
	if not self.Ready then
		return nil
	end

	if self.IsRolling then
		return nil
	end

	-- Hard global physics debounce to eradicate ghost/twin duplicate fires
	if os.clock() - LastRollTime < RNGConstants.GetTotalRollLockTime() then
		return nil
	end
	LastRollTime = os.clock()

	if not self.CaseTables[CaseName] then
		return nil
	end

	self.IsRolling = true

	-- We completely defer to the server's internal stream tracking.
	local Success, VerifiedItem = self.Network:fetch("RequestUnbox", CaseName)

	if Success and VerifiedItem then
		print("Server rolled item:", VerifiedItem.Item)

		-- Update the authoritative local Charm state so the React UI updates globally.
		local CaseCost = self.CaseTables[CaseName].CaseData.Cost or 0
		PlayerState.SetCoins(math.max(0, PlayerState.Coins() - CaseCost))

		PlayerState.AddInventoryItem({
			Id = game:GetService("HttpService"):GenerateGUID(false),
			Name = VerifiedItem.Item,
			Rarity = VerifiedItem.Rarity,
			Case = CaseName,
		})

		return VerifiedItem
	else
		warn("Server rejected the unbox request!")
		self.IsRolling = false
		return nil
	end
end

function RNGController.FinishRoll(self: RNGController)
	self.IsRolling = false
	LastRollTime = 0
end

function RNGController.GetDummyItems(self: RNGController, CaseName: string, Amount: number): { RollResult }
	local CaseTable = self.CaseTables[CaseName]
	if not CaseTable then
		return {}
	end

	local Items: { RollResult } = {}
	local VisualRNG = Random.new() -- Ephemeral stream just for the visual blur items

	for _ = 1, Amount do
		-- Same math as the server, fed with a localized Random instance
		local RandomItem = CaseTable:Roll(VisualRNG)

		table.insert(Items, {
			Item = RandomItem.Item,
			Rarity = RandomItem.Rarity,
		})
	end

	return Items
end

function RNGController.Destroy(self: RNGController)
	self.Janitor:Destroy()
	self.OnRoll:Destroy()
end

export type RNGController = typeof(setmetatable(
	{} :: {
		Character: any,
		Manager: any,
		Janitor: typeof(Janitor.new()),
		Network: any,
		IsRolling: boolean,
		Ready: boolean,
		CaseTables: { [string]: LootTable.LootTable },
		OnRoll: any,
	},
	RNGController
))

return RNGController
