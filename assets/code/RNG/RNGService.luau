--!strict
--[[
	RNGService (Server)
	Server-authoritative unboxing. The server owns every roll via per-player,
	per-case deterministic RNGStreams, persists their index, and never sends the
	seed to the client — so odds can't be farmed or predicted.
]]

-- SERVICES
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")

-- FOLDERS
local Packages = ReplicatedStorage:WaitForChild("Packages")
local SharedRNG = ReplicatedStorage.Client.Game.Services.RNG

-- MODULES
local Janitor = require(Packages.Janitor)
local Networker = require(Packages.Networker)
local RNGStream = require(SharedRNG.Helpers.RNGStream)
local LootTable = require(SharedRNG.Helpers.LootTable)
local CaseConfig = require(SharedRNG.Cases.CaseConfig) :: { [string]: any }

local RNGService = {}
RNGService.__index = RNGService

function RNGService.new(Manager: any): RNGService
	local self = setmetatable({
		Manager = Manager,
		Network = nil :: any,
		Janitor = Janitor.new(),
		-- Case tables cache
		CaseTables = {} :: { [string]: LootTable.LootTable },
		-- RNG streams per player, keyed by UserId then case name
		PlayerStreams = {} :: { [number]: { [string]: RNGStream.RNGStream } },
		DataService = nil :: any,
	}, RNGService)

	-- Networker expects a whitelist of client-accessible methods in the constructor
	self.Network = Networker.server.new("RNGService", self, {
		self.RequestUnbox,
		self.GetRNGData,
	})

	for CaseName, Data in pairs(CaseConfig) do
		self.CaseTables[CaseName] = LootTable.new(Data)
	end

	return self
end

-- Called when the server starts.
function RNGService.Initialize(self: RNGService)
	self.DataService = self.Manager:GetController("DataService")

	self.Janitor:Add(Players.PlayerRemoving:Connect(function(Player: Player)
		self.PlayerStreams[Player.UserId] = nil
	end))
end

function RNGService.RequestUnbox(self: RNGService, Player: Player, CaseName: string)
	if type(CaseName) ~= "string" then
		return false, "Invalid Request"
	end

	local CaseData = CaseConfig[CaseName]
	if not self.CaseTables[CaseName] or not CaseData then
		return false, "Invalid Case"
	end

	-- Enforce economy checks
	local CurrentCoins = self.DataService:Get(Player, "Coins") or 0
	local CaseCost = CaseData.Cost or 0

	if CurrentCoins < CaseCost then
		return false, "Not enough coins!"
	end

	-- Deduct the cost immediately (optimistic lock before roll)
	self.DataService:Increment(Player, "Coins", -CaseCost)

	-- Securely roll the next authoritative item on the server
	local Success, ItemData, NewIndex = self:RollItemSecurely(Player, CaseName)
	if Success then
		print("Granted", ItemData.Item, "to", Player.Name, "via Unbox! Balance:", CurrentCoins - CaseCost)

		-- Append securely to the server-sided inventory profile
		local Inventory = self.DataService:Get(Player, "Inventory")
		if Inventory then
			table.insert(Inventory, {
				Id = HttpService:GenerateGUID(false), -- Unique tracking ID
				Name = ItemData.Item,
				Rarity = ItemData.Rarity,
				Case = CaseName, -- Necessary to fetch item icons globally!
			})
		end
	else
		-- Refund if the roll catastrophically failed internally
		self.DataService:Increment(Player, "Coins", CaseCost)
	end

	return Success, ItemData, NewIndex
end

function RNGService.GetRNGData(self: RNGService, Player: Player)
	local RNGData = self.DataService:Get(Player, "RNGData")
	if not RNGData then
		return nil -- Profile not loaded yet
	end

	-- Initialize player streams dictionary
	if not self.PlayerStreams[Player.UserId] then
		self.PlayerStreams[Player.UserId] = {}
	end

	for CaseName, _ in pairs(CaseConfig) do
		-- Generate an unguessable seed (index 0) if they don't have one for this case
		if not RNGData[CaseName] then
			RNGData[CaseName] = {
				Seed = Random.new():NextInteger(-1e9, 1e9),
				Index = 0,
			}
		end

		-- Sync the server-side stream to the saved profile index state
		if not self.PlayerStreams[Player.UserId][CaseName] then
			local CaseData = RNGData[CaseName]
			local Stream = RNGStream.new(CaseData.Seed)
			Stream:SyncToIndex(CaseData.Index)
			self.PlayerStreams[Player.UserId][CaseName] = Stream
		end
	end

	-- Create a client-safe table that DOES NOT contain the seeds.
	local ClientSafeData: { [string]: { Index: number } } = {}
	for CaseName, CaseData in pairs(RNGData) do
		ClientSafeData[CaseName] = {
			Index = CaseData.Index,
		}
	end

	return ClientSafeData
end

function RNGService.GetPlayerCaseStream(self: RNGService, Player: Player, CaseName: string): RNGStream.RNGStream?
	local Streams = self.PlayerStreams[Player.UserId]

	-- Lazy-load streams if the player's profile wasn't ready during initial client boot.
	if not Streams then
		self:GetRNGData(Player)
		Streams = self.PlayerStreams[Player.UserId]

		if not Streams then
			warn("Failed to load RNG data streams for player: " .. Player.Name .. ". DataProfile may still be loading.")
			return nil
		end
	end

	return Streams[CaseName]
end

-- Strictly rolls the player's next authoritative stream index.
function RNGService.RollItemSecurely(self: RNGService, Player: Player, CaseName: string)
	local Table = self.CaseTables[CaseName]
	if not Table then
		return false, "Invalid Case"
	end

	local Stream = self:GetPlayerCaseStream(Player, CaseName)
	if not Stream then
		return false, "No stream found for this case"
	end

	-- The server strictly drives the stream forward; the client can't predict it,
	-- which eliminates ghost-instance UI desyncs.
	local ItemData = Table:Roll(Stream)

	local RNGData = self.DataService:Get(Player, "RNGData")
	if RNGData and RNGData[CaseName] then
		RNGData[CaseName].Index = Stream.Index
	end

	-- Result is authoritative. Return the new Index so the client can stay in sync.
	return true, ItemData, Stream.Index
end

function RNGService.Destroy(self: RNGService)
	self.PlayerStreams = {}
end

export type RNGService = typeof(setmetatable(
	{} :: {
		Manager: any,
		Network: any,
		Janitor: typeof(Janitor.new()),
		CaseTables: { [string]: LootTable.LootTable },
		PlayerStreams: { [number]: { [string]: RNGStream.RNGStream } },
		DataService: any,
	},
	RNGService
))

return RNGService
