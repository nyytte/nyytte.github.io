--!strict
local Hitbox = {}
Hitbox.__index = Hitbox

export type Hitbox = typeof(setmetatable({} :: {
	size: Vector3,
	onHit: (model: Model) -> (),
}, Hitbox))

function Hitbox.new(size: Vector3): Hitbox
	return setmetatable({
		size = size,
		onHit = function() end,
	}, Hitbox)
end

-- Cast the box and report every Model it overlaps.
function Hitbox:Cast(cframe: CFrame)
	local parts = workspace:GetPartBoundsInBox(cframe, self.size)
	for _, part in parts do
		local model = part:FindFirstAncestorOfClass("Model")
		if model then
			self.onHit(model)
		end
	end
end

return Hitbox
