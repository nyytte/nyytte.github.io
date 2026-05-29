--!strict
--[[
	SERVER CONTROLLER MANAGER

	Robust service/controller loader for the Server.
	Matches the architecture of the Client ControllerManager for consistency.

	PHASE 1 - CONSTRUCTION (.new):
		- Modules are required and constructors called.

	PHASE 2 - INITIALIZATION (:Initialize):
		- Called automatically after ALL controllers are constructed.
		- Safe to use Manager:GetController() here.

	PHASE 3 - START (:Start / :Load):
		- Called automatically after Initialization.
		- For starting time-dependent logic or network listeners.
]]

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
}

-- A controller/service instance produced by a module's .new()/.New() constructor.
-- Kept open ([any]: any) since each project defines its own controller shape.
export type Controller = {
	Manager: ServerControllerManager?,
	RetryInterval: number?,
	Initialize: ((self: Controller) -> ())?,
	Start: ((self: Controller) -> ())?,
	Load: ((self: Controller) -> ())?,
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

local ServerControllerManager = {}
ServerControllerManager.__index = ServerControllerManager

--[[
	Constructor for the ServerControllerManager.
]]
function ServerControllerManager.new(
	ControllerFolders: { ControllerSource },
	Options: Options?
): ServerControllerManager
	local Config: Options = Options or {}

	local self = setmetatable({
		ControllerFolders = ControllerFolders or {},
		Controllers = {} :: { [string]: Controller },
		MaxRetries = Config.MaxRetries or 5,
		RetryInterval = Config.RetryInterval or (60 / 5), -- Default: 12 seconds
		DevMode = RunService:IsStudio(),
		-- Global Janitor for the manager
		Janitor = Janitor.new(),
	}, ServerControllerManager)

	return self
end

--[[
	Retrieves a loaded controller/service instance.
]]
function ServerControllerManager.GetController(self: ServerControllerManager, Name: string): Controller?
	return self.Controllers[Name]
end

--[[
	Main entry point: Loads all server controllers/services.
]]
function ServerControllerManager.Load(self: ServerControllerManager)
	local TotalStart = os.clock()

	print("[ServerControllerManager] Starting load...")

	-- Step 1: Load Modules (returns a Promise)
	return self:_LoadModules()
		:andThen(function(LoadResults: LoadResults)
			local TotalModules = LoadResults.TotalModules
			local TotalLoaded = LoadResults.TotalLoaded
			local FailedModules = LoadResults.FailedModules
			local FolderReport = LoadResults.FolderReport

			-- Step 2: Initialize Controllers
			if TotalLoaded > 0 then
				self:_InitializeControllers()
			end

			-- Step 3: Start Controllers
			if TotalLoaded > 0 then
				self:_StartControllers()
			end

			-- Step 4: Report Results
			self:_HandleLoadResults(TotalLoaded, TotalModules, FailedModules, os.clock() - TotalStart)

			return self.Controllers, FolderReport
		end)
		:catch(function(err)
			warn("[ServerControllerManager] Critical Load Error: " .. tostring(err))
			return {}, {}
		end)
end

--[[
	Cleanup the manager and all controllers.
]]
function ServerControllerManager.Destroy(self: ServerControllerManager)
	self.Janitor:Destroy()
	self.Controllers = {}
	setmetatable(self, nil)
	table.clear(self)
end

--------------------------------------------------------------------------------
-- INTERNAL HELPERS
--------------------------------------------------------------------------------

--[[
	Internal: Recursively loads all modules.
]]
function ServerControllerManager._LoadModules(self: ServerControllerManager)
	local Promises: { any } = {}
	local FolderReport: { [string]: { any } } = {}

	local function ProcessModule(Module: ModuleScript)
		return self:_TryLoadModule(Module)
	end

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
			-- We wait for these in bulk later, but structure the report by folder
			FolderReport[Item.Name] = FolderPromises
		elseif Item:IsA("ModuleScript") then
			local P = ProcessModule(Item)
			table.insert(Promises, P)
			FolderReport[Item.Name] = { P }
		end
	end

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
	Internal: Attempts to require and instantiate a single module.
]]
function ServerControllerManager._TryLoadModule(self: ServerControllerManager, ModuleScript: ModuleScript)
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

				local Interval = if Module.RetryInterval then Module.RetryInterval else DefaultRetryInterval

				local Instance = Constructor(self)
				if not Instance then
					error("Constructor returned nil")
				end

				Instance.Manager = self
				self.Controllers[Entry.Name] = Instance

				-- Auto-add 'Destroy' to Janitor if present
				if type(Instance.Destroy) == "function" then
					self.Janitor:Add(Instance, "Destroy")
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
					resolve(Entry) -- Resolve failure so Promise.all proceeds
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
	Internal: Calls :Initialize() on all loaded controllers.
]]
function ServerControllerManager._InitializeControllers(self: ServerControllerManager)
	for Name, Controller in pairs(self.Controllers) do
		if type(Controller.Initialize) == "function" then
			task.spawn(function()
				local Success, Error = pcall(function()
					Controller:Initialize()
				end)

				if not Success then
					warn(string.format("[ServerControllerManager] Error initializing %s: %s", Name, tostring(Error)))
				end
			end)
		end
	end
end

--[[
	Internal: Calls :Start() or :Load() on all controllers (Phase 3).
	Supports both naming conventions for compatibility.
]]
function ServerControllerManager._StartControllers(self: ServerControllerManager)
	for Name, Controller in pairs(self.Controllers) do
		-- Support both Start and Load, preferring Start
		local StartMethod = Controller.Start or Controller.Load
		if type(StartMethod) == "function" then
			task.spawn(function()
				local Success, Error = pcall(function()
					StartMethod(Controller)
				end)

				if not Success then
					warn(string.format("[ServerControllerManager] Error starting %s: %s", Name, tostring(Error)))
				end
			end)
		end
	end
end

--[[
	Internal: Reports results to console.
]]
function ServerControllerManager._HandleLoadResults(
	self: ServerControllerManager,
	TotalLoaded: number,
	TotalModules: number,
	FailedModules: { LoadEntry },
	TotalTime: number
)
	if #FailedModules > 0 then
		warn(string.format("[ServerControllerManager] Loaded %d/%d (Failures detected)", TotalLoaded, TotalModules))
		for _, Fail in ipairs(FailedModules) do
			warn(string.format("   - %s: %s", Fail.Name, Fail.Error or "Unknown"))
		end
	else
		print(
			string.format(
				"[ServerControllerManager] Ready! Loaded %d/%d modules in %.4fs",
				TotalLoaded,
				TotalModules,
				TotalTime
			)
		)
	end
end

-- Instance type, declared after the methods so it captures the full API.
export type ServerControllerManager = typeof(setmetatable(
	{} :: {
		ControllerFolders: { ControllerSource },
		Controllers: { [string]: Controller },
		MaxRetries: number,
		RetryInterval: number,
		DevMode: boolean,
		Janitor: typeof(Janitor.new()),
	},
	ServerControllerManager
))

return ServerControllerManager
