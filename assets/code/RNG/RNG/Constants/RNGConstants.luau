--!strict
local RNGConstants = {
	-- Dimension Constants
	Layout = {
		ItemWidth = 105,
		ItemHeight = 105,
		ItemSpacing = 14,
		ContainerWidth = 640,
		ContainerHeight = 130,
	},

	-- Reel Generation Configuration
	Reel = {
		WinningIndex = 40,
		TotalItems = 45,
	},

	-- Animation Timings (In Seconds)
	Animation = {
		RollDuration = 4.0, -- How long the spinning reel takes to friction stop
		ResultDuration = 2.5, -- How long to display the winning result text at the end
		PopOutDelay = 0.4, -- Delay after PopOut triggered before deleting UI
	},
}

-- Calculate full locking duration so the player cannot spin while an animation is in progress
function RNGConstants.GetTotalRollLockTime(): number
	return RNGConstants.Animation.RollDuration
		+ RNGConstants.Animation.ResultDuration
		+ RNGConstants.Animation.PopOutDelay
end

return RNGConstants
