--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Packages = ReplicatedStorage:WaitForChild("Packages")
local React = require(Packages:WaitForChild("react"))

local SharedRNG = ReplicatedStorage.Client.Game.Services.RNG
local CaseConfig = require(SharedRNG.Cases.CaseConfig) :: { [string]: any }

export type Props = {
	LayoutOrder: number?,
	ItemName: string?,
	Width: number?,
}

local function CaseItem(props: Props)
	local LayoutOrder = props.LayoutOrder or 0
	local ItemName = props.ItemName or "Common"
	local Color = CaseConfig.BasicCase.Colors[ItemName] or Color3.fromRGB(150, 150, 150)
	local Width = props.Width or 120
	
	return React.createElement("Frame", {
		LayoutOrder = LayoutOrder,
		Size = UDim2.fromOffset(Width, 120),
		BackgroundColor3 = Color,
	}, {
		UICorner = React.createElement("UICorner", { CornerRadius = UDim.new(0, 6) }),
		UIStroke = React.createElement("UIStroke", {
			Color = Color3.new(1, 1, 1),
			Transparency = 0.8,
			Thickness = 1,
		}),
		Label = React.createElement("TextLabel", {
			Size = UDim2.fromScale(1, 1),
			BackgroundTransparency = 1,
			Text = ItemName,
			TextColor3 = Color3.new(1, 1, 1),
			Font = Enum.Font.GothamBlack,
			TextSize = 18,
		}),
		Shadow = React.createElement("UIGradient", {
			Rotation = 90,
			Color = ColorSequence.new({
				ColorSequenceKeypoint.new(0, Color3.new(1, 1, 1)),
				ColorSequenceKeypoint.new(1, Color3.new(0.5, 0.5, 0.5)),
			})
		})
	})
end

return CaseItem
