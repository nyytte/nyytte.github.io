--!strict
--[[
	CHARACTER CONTROLLER MANAGER

	A robust two-phase loading system for modular character controllers.

	PHASE 1 - CONSTRUCTION (.new):
		- Modules are required and constructors called.
		- Controllers are stored in the manager but should NOT reference other controllers yet.

	PHASE 2 - INITIALIZATION (:Initialize):
		- Called automatically after ALL controllers are constructed.
		- Safe to use Manager:GetController() here.
]]

-- SERVICES
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

-- PACKAGES
local Packages = script.Parent.Parent
local Janitor = require(Packages.Janitor)
local Promise = require(Packages.Promise)

--------------------------------------------------------------------------------
-- TYPES
--------------------------------------------------------------------------------

-- A folder full of controller ModuleScripts, or a single controller ModuleScript.
type ControllerSource = Folder | ModuleScript

-- Optional configuration passed to the constructor.
export type Options = {
	MaxRetries: number?,
	RetryInterval: number?,
	KickOnFailure: boolean?,
}

-- A controller instance produced by a module's .new()/.New() constructor.
-- Kept open ([any]: any) since each project defines its own controller shape.
export type Controller = {
	Manager: ControllerManager?,
	RetryInterval: number?,
	Initialize: ((self: Controller) -> ())?,
	Destroy: ((self: Controller) -> ())?,
	[any]: any,
}

-- Per-module load record produced by the loader.
export type LoadEntry = {
	Name: string,
	Time: number,
	Loaded: boolean,
	Error: string?,
	Attempts: number,
}

-- Aggregate result of a full load pass.
export type LoadResults = {
	TotalModules: number,
	TotalLoaded: number,
	FailedModules: { LoadEntry },
	FolderReport: { [string]: { LoadEntry } },
}

-- Metatable
local ControllerManager = {}
ControllerManager.__index = ControllerManager

--[[
	Constructor for the ControllerManager.
	@param ControllerFolders: A list of Folders containing ModuleScripts or individual ModuleScripts to load.
	@param Options: Configuration table { MaxRetries, RetryInterval, KickOnFailure }.
]]
function ControllerManager.new(
	ControllerFolders: { ControllerSource },
	Options: Options?
): ControllerManager
	local Config: Options = Options or {}

	local self = setmetatable({
		ControllerFolders = ControllerFolders or {},
		-- Tracks characters currently being loaded to prevent double loading
		LoadingCharacters = {} :: { [Model]: boolean },

		MaxRetries = Config.MaxRetries or 5,
		RetryInterval = Config.RetryInterval or (60 / 5), -- Default: 12 seconds
		KickOnFailure = if Config.KickOnFailure ~= nil then Config.KickOnFailure else true,
		DevMode = RunService:IsStudio(),

		-- Storage. Weak keys ("k") let entries be collected once a Character is gone.
		ControllersByCharacter = setmetatable({}, { __mode = "k" }) :: any,
		Janitors = setmetatable({}, { __mode = "k" }) :: any,
	}, ControllerManager)

	return self
end

--[[
	Retrieves a loaded controller instance for a specific character.
	Use this inside :Initialize() methods to talk to other controllers.
]]
function ControllerManager.GetController(self: ControllerManager, Character: Model, Name: string): Controller?
	local Dict = self.ControllersByCharacter[Character]
	return if Dict then Dict[Name] else nil
end

--[[
	Main entry point: Loads all controllers for a given character.

	1. Creates a Janitor for cleanup.
	2. Recursively loads all ModuleScripts in the configured folders in PARALLEL.
	3. Runs the Initialization phase.

	Returns a PROMISE that resolves with the loaded controllers or rejects on critical failure.
]]
function ControllerManager.Load(self: ControllerManager, Character: Model)
	if self.LoadingCharacters[Character] then
		warn("Already loading controllers for " .. Character.Name)
		return Promise.reject("Already loading")
	end

	self.LoadingCharacters[Character] = true
	local TotalStart = os.clock()

	-- Step 1: Setup Lifecycle
	self:_SetupLifecycle(Character)

	-- Step 2: Load Modules (Parallel)
	return self:_LoadModules(Character)
		:andThen(function(LoadResults: LoadResults)
			local TotalModules = LoadResults.TotalModules
			local TotalLoaded = LoadResults.TotalLoaded
			local FailedModules = LoadResults.FailedModules
			local FolderReport = LoadResults.FolderReport

			-- Step 3: Initialize Controllers
			if TotalLoaded > 0 then
				self:_InitializeControllers(Character)
			end

			-- Step 4: Report Results
			self:_HandleLoadResults(Character, TotalLoaded, TotalModules, FailedModules, os.clock() - TotalStart)

			return self.ControllersByCharacter[Character] or {}, FolderReport
		end)
		:catch(function(err)
			warn("[ControllerManager] Critical Load Error: " .. tostring(err))
			return {}, {}
		end)
		:finally(function()
			self.LoadingCharacters[Character] = nil
		end)
end

--[[
	Cleans up all controllers and logic associated with a specific character.
	Called automatically on death/removal, but can be called manually.
]]
function ControllerManager.DestroyForCharacter(self: ControllerManager, Character: Model)
	local CharJanitor = self.Janitors[Character]
	if CharJanitor then
		CharJanitor:Destroy() -- destroys all controllers added to the Janitor
		self.Janitors[Character] = nil
	end
	self.ControllersByCharacter[Character] = nil
end

--[[
	Full cleanup of the Manager (e.g. when the game is shutting down).
]]
function ControllerManager.Destroy(self: ControllerManager)
	for _, CharJanitor in pairs(self.Janitors) do
		CharJanitor:Destroy()
	end
	self.Janitors = {}
	self.ControllersByCharacter = {}
	self.LoadingCharacters = {}

	setmetatable(self, nil)
	table.clear(self)
end

--------------------------------------------------------------------------------
-- INTERNAL HELPERS (Private)
--------------------------------------------------------------------------------

--[[
	Internal: Sets up the Janitor and lifecycle events (removal/death) for a character.
]]
function ControllerManager._SetupLifecycle(self: ControllerManager, Character: Model)
	-- Ensure any previous data for this character is wiped
	self:DestroyForCharacter(Character)

	-- Create lifecycle manager (Janitor) for this character
	local CharJanitor = Janitor.new()
	self.Janitors[Character] = CharJanitor

	-- Auto-cleanup when character is removed from the game hierarchy
	CharJanitor:Add(Character.AncestryChanged:Connect(function()
		if not Character.Parent then
			self:DestroyForCharacter(Character)
		end
	end))

	-- Auto-cleanup when Humanoid dies
	local Humanoid = Character:FindFirstChildOfClass("Humanoid") :: Humanoid?
	if Humanoid then
		CharJanitor:Add(Humanoid.Died:Connect(function()
			self:DestroyForCharacter(Character)
		end))
	end
end

--[[
	Internal: Recursively loads all modules defined in ControllerFolders using Promises.
	Returns a Promise that resolves with load stats.
]]
function ControllerManager._LoadModules(self: ControllerManager, Character: Model)
	local Promises: { any } = {}
	local FolderReport: { [string]: { any } } = {}

	-- Helper to process individual modules
	local function ProcessModule(Module: ModuleScript)
		return self:_TryLoadModule(Module, Character)
	end

	-- Search the folders for ModuleScripts
	for _, Item in ipairs(self.ControllerFolders) do
		if Item:IsA("Folder") then
			local FolderPromises: { any } = {}
			for _, Child in ipairs(Item:GetChildren()) do
				if Child:IsA("ModuleScript") then
					local P = ProcessModule(Child)
					table.insert(Promises, P)
					table.insert(FolderPromises, P)
				end
			end
			FolderReport[Item.Name] = FolderPromises
		elseif Item:IsA("ModuleScript") then
			local P = ProcessModule(Item)
			table.insert(Promises, P)
			FolderReport[Item.Name] = { P }
		end
	end

	-- Promise.all because _TryLoadModule resolves (never rejects) failure entries.
	return Promise.all(Promises):andThen(function(Entries: { LoadEntry })
		local TotalModules = #Entries
		local TotalLoaded = 0
		local FailedModules: { LoadEntry } = {}

		for _, Entry in ipairs(Entries) do
			if Entry.Loaded then
				TotalLoaded += 1
			else
				table.insert(FailedModules, Entry)
			end
		end

		-- Resolve FolderReport promises to actual entries
		local FinalFolderReport: { [string]: { LoadEntry } } = {}
		for FolderName, FolderPromises in pairs(FolderReport) do
			local FolderEntries: { LoadEntry } = {}
			for _, P in ipairs(FolderPromises) do
				if P:getStatus() == Promise.Status.Resolved then
					local Success, Value = P:await()
					if Success then
						table.insert(FolderEntries, Value)
					end
				end
			end
			FinalFolderReport[FolderName] = FolderEntries
		end

		local Results: LoadResults = {
			TotalModules = TotalModules,
			TotalLoaded = TotalLoaded,
			FailedModules = FailedModules,
			FolderReport = FinalFolderReport,
		}
		return Results
	end)
end

--[[
	Internal: Attempts to require and instantiate a single controller module.
	Handles retries if the module fails to load (e.g. waiting for dependencies).
]]
function ControllerManager._TryLoadModule(self: ControllerManager, ModuleScript: ModuleScript, Character: Model)
	return Promise.new(function(resolve)
		local Entry: LoadEntry = {
			Name = ModuleScript.Name,
			Time = 0,
			Loaded = false,
			Error = nil,
			Attempts = 0,
		}

		local StartTime = os.clock()
		local DefaultRetryInterval = self.RetryInterval

		local function AttemptLoad(RetryCount: number)
			Entry.Attempts = RetryCount

			local Success, Result = pcall(function()
				local Module = require(ModuleScript) :: any
				local Constructor = Module.New or Module.new

				if type(Constructor) ~= "function" then
					error("Missing .new() or .New() constructor")
				end

				-- Check for custom retry interval
				local Interval = if Module.RetryInterval then Module.RetryInterval else DefaultRetryInterval

				local Instance = Constructor(Character, self)
				if not Instance then
					error("Constructor returned nil")
				end

				Instance.Manager = self

				local CharacterControllers = self.ControllersByCharacter[Character]
				if not CharacterControllers then
					CharacterControllers = {}
					self.ControllersByCharacter[Character] = CharacterControllers
				end
				CharacterControllers[Entry.Name] = Instance

				if type(Instance.Destroy) == "function" then
					self.Janitors[Character]:Add(Instance, "Destroy")
				end

				return Interval
			end)

			if Success then
				Entry.Loaded = true
				if self.DevMode then
					print(string.format("[Module: %s] Loaded on attempt %d", Entry.Name, RetryCount))
				end
				Entry.Time = os.clock() - StartTime
				resolve(Entry)
			else
				Entry.Error = tostring(Result)
				warn(string.format("[Module: %s] Attempt %d failed: %s", Entry.Name, RetryCount, Entry.Error))

				if RetryCount < self.MaxRetries then
					Promise.delay(DefaultRetryInterval):andThen(function()
						AttemptLoad(RetryCount + 1)
					end)
				else
					Entry.Time = os.clock() - StartTime
					resolve(Entry)
				end
			end
		end

		if self.DevMode then
			print(string.format("[Module: %s] Starting load", Entry.Name))
		end

		AttemptLoad(1)
	end)
end

--[[
	Internal: Calls :Initialize() on all loaded controllers for a character (Phase 2).
]]
function ControllerManager._InitializeControllers(self: ControllerManager, Character: Model)
	local Controllers = self.ControllersByCharacter[Character]
	if not Controllers then
		return
	end

	if self.DevMode then
		print(string.format("[ControllerManager] Initializing for %s...", Character.Name))
	end

	for Name, Controller in pairs(Controllers) do
		if type(Controller.Initialize) == "function" then
			task.spawn(function()
				local Success, Error = pcall(function()
					Controller:Initialize()
				end)

				if not Success then
					warn(string.format("[ControllerManager] Error initializing %s: %s", Name, tostring(Error)))
				end
			end)
		end
	end
end

--[[
	Internal: Handles reporting and potential kicking based on load results.
]]
function ControllerManager._HandleLoadResults(
	self: ControllerManager,
	Character: Model,
	TotalLoaded: number,
	TotalModules: number,
	FailedModules: { LoadEntry },
	TotalTime: number
)
	if #FailedModules > 0 then
		warn(string.format("[ControllerManager] Loaded %d/%d (Failures detected)", TotalLoaded, TotalModules))

		-- Kick logic
		local Player = Players:GetPlayerFromCharacter(Character)
		if self.KickOnFailure and Player and not self.DevMode then
			local ErrorList: { string } = {}
			for _, Fail in ipairs(FailedModules) do
				table.insert(ErrorList, string.format("%s: %s", Fail.Name, Fail.Error or "Unknown"))
			end
			Player:Kick("Failed to load required game modules:\n" .. table.concat(ErrorList, "\n"))
		end
	else
		if self.DevMode then
			print(
				string.format(
					"[ControllerManager] Loaded %d/%d successfully in %.4fs",
					TotalLoaded,
					TotalModules,
					TotalTime
				)
			)
		end
	end
end

-- Instance type, declared after the methods so it captures the full API.
export type ControllerManager = typeof(setmetatable(
	{} :: {
		ControllerFolders: { ControllerSource },
		LoadingCharacters: { [Model]: boolean },
		MaxRetries: number,
		RetryInterval: number,
		KickOnFailure: boolean,
		DevMode: boolean,
		ControllersByCharacter: { [Model]: { [string]: Controller } },
		Janitors: { [Model]: typeof(Janitor.new()) },
	},
	ControllerManager
))

return ControllerManager
