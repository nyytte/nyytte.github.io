--!strict
-- Auto-discovers every case module under List/ and validates its drop weights.
local CaseConfig: { [string]: any } = {}

local ListFolder = script.Parent:WaitForChild("List")

for _, Module in ipairs(ListFolder:GetChildren()) do
	if Module:IsA("ModuleScript") then
		local CaseData = require(Module) :: any

		-- Loop through item weights to validate that they sum up to 100% exactly
		local TotalWeight = 0
		for _, ItemData in ipairs(CaseData.Items or {}) do
			TotalWeight += (ItemData.Weight or 0)
		end
		
		-- Use a tiny margin of error for floating point precision just in case
		if math.abs(TotalWeight - 100) > 0.01 then
			error(string.format("[RNG System] Failed to load Case '%s' because its weights sum up to %.2f%% instead of 100%%", Module.Name, TotalWeight))
		end
		
		CaseConfig[Module.Name] = CaseData
	end
end

return CaseConfig
