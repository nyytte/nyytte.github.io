--!strict
--[[
	RNGStream
	A deterministic, seed-driven random stream. Tracking an Index lets the server
	replay or fast-forward a player's exact roll history, which makes seed farming
	and desync exploits detectable.
]]

local RNGStream = {}
RNGStream.__index = RNGStream

export type State = {
	Seed: number,
	Index: number,
}

-- Creates a new deterministic random stream based on a seed.
function RNGStream.new(Seed: number): RNGStream
	return setmetatable({
		Seed = Seed,
		Random = Random.new(Seed),
		Index = 0,
	}, RNGStream)
end

-- Generates a random integer and advances the stream.
function RNGStream.NextInteger(self: RNGStream, Min: number, Max: number): number
	self.Index += 1
	return self.Random:NextInteger(Min, Max)
end

-- Generates a random float and advances the stream.
function RNGStream.NextNumber(self: RNGStream, Min: number, Max: number): number
	self.Index += 1
	return self.Random:NextNumber(Min, Max)
end

-- Returns the exact state of the generator (used for exploit tracking).
function RNGStream.GetState(self: RNGStream): State
	return {
		Seed = self.Seed,
		Index = self.Index,
	}
end

-- Syncs the stream forward to a specific index, resetting first if it overshot.
function RNGStream.SyncToIndex(self: RNGStream, TargetIndex: number)
	if TargetIndex < self.Index then
		-- Cannot go backwards without resetting completely
		self.Random = Random.new(self.Seed)
		self.Index = 0
	end

	-- Fast forward
	while self.Index < TargetIndex do
		self.Random:NextNumber()
		self.Index += 1
	end
end

-- Clones the current state (useful to peek ahead without mutating the stream).
function RNGStream.Clone(self: RNGStream): RNGStream
	local Clone = RNGStream.new(self.Seed)
	Clone:SyncToIndex(self.Index)
	return Clone
end

export type RNGStream = typeof(setmetatable(
	{} :: {
		Seed: number,
		Random: Random,
		Index: number,
	},
	RNGStream
))

return RNGStream
