--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Packages = ReplicatedStorage:WaitForChild("Packages")
local React = require(Packages:WaitForChild("react"))

export type Props = {
	IsRolling: boolean?,
	OnClick: (() -> ())?,
}

local function UnboxButton(props: Props)
	local IsRolling = props.IsRolling or false
	local OnClick = props.OnClick
	
	local TargetColor = IsRolling and Color3.fromRGB(100, 100, 100) or Color3.fromRGB(0, 180, 80)
	local TargetText = IsRolling and "Wait..." or "OPEN CASE ($100)"
	
	return React.createElement("TextButton", {
		Size = UDim2.fromOffset(200, 50),
		Position = UDim2.new(0.5, 0, 0.8, 0),
		AnchorPoint = Vector2.new(0.5, 0.5),
		Text = TargetText,
		BackgroundColor3 = TargetColor,
		TextColor3 = Color3.new(1, 1, 1),
		TextSize = 20,
		Font = Enum.Font.GothamBold,
		AutoButtonColor = not IsRolling,
		
		[React.Event.Activated] = function()
			if not IsRolling and OnClick then
				OnClick()
			end
		end,
	}, {
		UICorner = React.createElement("UICorner", { CornerRadius = UDim.new(0, 8) }),
		UIStroke = React.createElement("UIStroke", {
			Color = Color3.new(0, 0, 0),
			Transparency = 0.5,
			Thickness = 2,
		})
	})
end

return UnboxButton
