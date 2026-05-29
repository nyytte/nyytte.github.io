--!strict
--[[
	LootTable
	Wraps a case's item list into a weighted cumulative-probability roller.
	Accepts any deterministic source exposing NextNumber(min, max) — both the
	custom RNGStream and a plain Roblox Random satisfy this.
]]

export type ItemData = {
	Name: string,
	Rarity: string,
	Weight: number,
	Value: number?,
}

export type CaseData = {
	Items: { ItemData },
	[any]: any,
}

export type RollResult = {
	Item: string,
	Rarity: string,
}

-- Anything that can produce a weighted float roll (RNGStream or Random).
type RandomSource = {
	NextNumber: (self: any, min: number, max: number) -> number,
}

local LootTable = {}
LootTable.__index = LootTable

-- Constructor: takes the full Case Data dictionary.
function LootTable.new(CaseData: CaseData): LootTable
	local self = setmetatable({
		CaseData = CaseData,
		Items = {} :: { ItemData },
		TotalWeight = 0,
	}, LootTable)

	for _, ItemData in ipairs(CaseData.Items or {}) do
		table.insert(self.Items, ItemData)
		self.TotalWeight += (ItemData.Weight or 0)
	end

	-- Sort highest to lowest weight to speed up the cumulative loop.
	table.sort(self.Items, function(a: ItemData, b: ItemData): boolean
		return (a.Weight or 0) > (b.Weight or 0)
	end)

	return self
end

-- Submits a roll using the supplied random source.
function LootTable.Roll(self: LootTable, Source: RandomSource): RollResult
	-- Single precision roll step
	local Roll = Source:NextNumber(0, self.TotalWeight)

	local SelectedItem: ItemData = self.Items[1] -- Fallback
	local CurrentWeight = 0
	for _, Entry in ipairs(self.Items) do
		CurrentWeight += Entry.Weight
		if Roll <= CurrentWeight then
			SelectedItem = Entry
			break
		end
	end

	return {
		Item = SelectedItem.Name,
		Rarity = SelectedItem.Rarity,
	}
end

export type LootTable = typeof(setmetatable(
	{} :: {
		CaseData: CaseData,
		Items: { ItemData },
		TotalWeight: number,
	},
	LootTable
))

return LootTable
