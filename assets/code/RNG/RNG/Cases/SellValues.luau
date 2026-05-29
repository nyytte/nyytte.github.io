--!strict
--[[
	SellValues
	Builds a flat lookup table of item sell values from CaseConfig.
	Used by both client (coin preview) and server (transaction validation).

	Returns: { [ItemName] = CoinValue }
	Example: { Fizz = 1500, porofessor = 250, twitch = 30 }
]]

local CaseConfig = require(script.Parent.CaseConfig) :: { [string]: any }

local SellValues: { [string]: number } = {}

for _, CaseData in pairs(CaseConfig) do
	for _, ItemData in ipairs(CaseData.Items or {}) do
		if ItemData.Name and ItemData.Value then
			-- If an item appears in multiple cases, use the highest value
			if not SellValues[ItemData.Name] or ItemData.Value > SellValues[ItemData.Name] then
				SellValues[ItemData.Name] = ItemData.Value
			end
		end
	end
end

return SellValues
