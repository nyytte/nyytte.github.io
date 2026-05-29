--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Packages = ReplicatedStorage:WaitForChild("Packages")

local React = require(Packages:WaitForChild("react"))

local SharedRNG = ReplicatedStorage:WaitForChild("Client").Game.Services.RNG
local CaseConfig = require(SharedRNG.Cases.CaseConfig) :: { [string]: any }

local UI = ReplicatedStorage:WaitForChild("Client").UI
local UseGlobalTime = require(UI.Components.Hooks.UseGlobalTime)
local RarityTheme = require(UI.Constants.RarityTheme) :: { Colors: { [string]: Color3 } }

export type WonItem = {
	Item: string,
	Rarity: string,
}

export type Props = {
	WonItem: WonItem?,
	ActiveCaseName: string?,
	ResultScale: any, -- React/Ripple bindings
	Time: any,
	ShineOffset: any,
}

local function UnboxingResultDisplay(Props: Props)
	local WonItem = Props.WonItem
	local ActiveCaseName = Props.ActiveCaseName

	local ResultScale = Props.ResultScale
	local Time = Props.Time
	local ShineOffset = Props.ShineOffset

	if not WonItem or not ActiveCaseName then
		return nil
	end

	local CaseColors = CaseConfig[ActiveCaseName] and CaseConfig[ActiveCaseName].Colors or {}
	local BgColor = CaseColors[WonItem.Rarity] or Color3.fromRGB(60, 60, 60)
	local GlowColor = RarityTheme.Colors[WonItem.Rarity] or Color3.fromRGB(120, 120, 120)
	local IsLegendary = WonItem.Rarity == "Legendary"
	local IsEpic = WonItem.Rarity == "Epic"

	local GlobalTime = UseGlobalTime()

	local CaseImages = CaseConfig[ActiveCaseName] and CaseConfig[ActiveCaseName].Images
	local WonImage = CaseImages and CaseImages[WonItem.Item]

	-- Floating bob effect for the item icon using our GlobalTime binding
	local HoverOffset = GlobalTime:map(function(Val)
		return UDim2.new(0.5, 0, 0.5, math.sin(Val * 4) * 6)
	end)

	return React.createElement("Frame", {
		Size = UDim2.fromOffset(160, 160), -- Increased size for better quality
		Position = UDim2.new(0.5, 0, 0.45, 0), -- Dead center over the reel
		AnchorPoint = Vector2.new(0.5, 0.5),
		BackgroundTransparency = 1,
		ZIndex = 50,
	}, {
		Scale = React.createElement("UIScale", {
			Scale = ResultScale,
		}),

		-- Outer Spinny Aura (Sweeps forward)
		AuraOuter = React.createElement("Frame", {
			Size = Time:map(function(Val)
				local Pulse = 1 + math.sin(Val * 2) * 0.05
				return UDim2.fromScale(2.5 * Pulse, 2.5 * Pulse)
			end),
			Position = UDim2.fromScale(0.5, 0.5),
			AnchorPoint = Vector2.new(0.5, 0.5),
			BackgroundColor3 = GlowColor,
			BackgroundTransparency = IsLegendary and 0.4 or (IsEpic and 0.6 or 0.8),
			Rotation = Time:map(function(Val)
				return (Val * 35) % 360
			end),
			ZIndex = 1,
		}, {
			Corner = React.createElement("UICorner", { CornerRadius = UDim.new(1, 0) }),
			Gradient = React.createElement("UIGradient", {
				Transparency = NumberSequence.new({
					NumberSequenceKeypoint.new(0, 0.1),
					NumberSequenceKeypoint.new(0.5, 0.8),
					NumberSequenceKeypoint.new(1, 1),
				}),
				Rotation = -45,
			}),
		}),

		-- Inner Spinny Aura (Sweeps backward, creating a complex starburst)
		AuraInner = React.createElement("Frame", {
			Size = Time:map(function(Val)
				local Pulse = 1 + math.cos(Val * 3) * 0.05
				return UDim2.fromScale(1.8 * Pulse, 1.8 * Pulse)
			end),
			Position = UDim2.fromScale(0.5, 0.5),
			AnchorPoint = Vector2.new(0.5, 0.5),
			BackgroundColor3 = GlowColor, -- Changed from pure white to match rarity
			BackgroundTransparency = IsLegendary and 0.2 or (IsEpic and 0.4 or 0.6), -- slightly less transparent than outer
			Rotation = Time:map(function(Val)
				return -(Val * 55) % 360
			end),
			ZIndex = 2,
		}, {
			Corner = React.createElement("UICorner", { CornerRadius = UDim.new(1, 0) }),
			Gradient = React.createElement("UIGradient", {
				Transparency = NumberSequence.new({
					NumberSequenceKeypoint.new(0, 0.1),
					NumberSequenceKeypoint.new(0.5, 0.8),
					NumberSequenceKeypoint.new(1, 1),
				}),
				Rotation = 90,
			}),
		}),

		-- Premium Glossy Card Aura (Like the items in case)
		CardAura = (IsLegendary or IsEpic) and React.createElement("Frame", {
			Size = UDim2.new(1, 24, 1, 24),
			Position = UDim2.fromScale(0.5, 0.5),
			AnchorPoint = Vector2.new(0.5, 0.5),
			BackgroundColor3 = GlowColor,
			BackgroundTransparency = IsLegendary and 0.5 or 0.7,
			ZIndex = 2,
		}, {
			Corner = React.createElement("UICorner", { CornerRadius = UDim.new(0, 20) }),
			Gradient = React.createElement("UIGradient", {
				Rotation = 90,
				Transparency = NumberSequence.new({
					NumberSequenceKeypoint.new(0, 1),
					NumberSequenceKeypoint.new(0.5, IsLegendary and 0.2 or 0.5),
					NumberSequenceKeypoint.new(1, 1),
				}),
			}),
		}),

		-- Premium Glossy Card
		Card = React.createElement("Frame", {
			Size = UDim2.fromScale(1, 1),
			Position = UDim2.fromScale(0.5, 0.5),
			AnchorPoint = Vector2.new(0.5, 0.5),
			BackgroundColor3 = BgColor, -- Use exact rarity color
			ZIndex = 3,
		}, {
			Corner = React.createElement("UICorner", { CornerRadius = UDim.new(0, 16) }),
			Stroke = React.createElement("UIStroke", {
				Color = GlowColor,
				Thickness = IsLegendary and 6 or (IsEpic and 4 or 3),
				Transparency = IsLegendary and 0.1 or 0.3,
			}),

			-- Dynamic Item Shine Gradient matching the case items
			CardGradient = IsLegendary and React.createElement("UIGradient", {
				Rotation = 45,
				Color = ColorSequence.new({
					ColorSequenceKeypoint.new(0, Color3.new(1, 1, 1)),
					ColorSequenceKeypoint.new(0.4, Color3.new(1, 1, 1)),
					ColorSequenceKeypoint.new(0.5, GlowColor),
					ColorSequenceKeypoint.new(0.6, Color3.new(1, 1, 1)),
					ColorSequenceKeypoint.new(1, Color3.new(1, 1, 1)),
				}),
				Transparency = NumberSequence.new({
					NumberSequenceKeypoint.new(0, 0.8),
					NumberSequenceKeypoint.new(0.35, 0.4),
					NumberSequenceKeypoint.new(0.5, 0.0),
					NumberSequenceKeypoint.new(0.65, 0.4),
					NumberSequenceKeypoint.new(1, 0.8),
				}),
				Offset = ShineOffset:map(function(Val)
					return Vector2.new(Val, 0)
				end),
			}) or React.createElement("UIGradient", {
				Rotation = 90,
				Transparency = NumberSequence.new({
					NumberSequenceKeypoint.new(0, 0.1),
					NumberSequenceKeypoint.new(0.5, 0.4),
					NumberSequenceKeypoint.new(1, 0.8),
				}),
			}),

			-- Glossy top highlight
			Gloss = React.createElement("Frame", {
				Size = UDim2.new(1, 0, 0.45, 0),
				Position = UDim2.fromScale(0, 0),
				BackgroundColor3 = Color3.new(1, 1, 1),
				BackgroundTransparency = 0.8,
				BorderSizePixel = 0,
				ZIndex = 4,
			}, {
				Corner = React.createElement("UICorner", { CornerRadius = UDim.new(0, 16) }),
				Gradient = React.createElement("UIGradient", {
					Rotation = 90,
					Transparency = NumberSequence.new({
						NumberSequenceKeypoint.new(0, 0.5),
						NumberSequenceKeypoint.new(1, 1),
					}),
				}),
			}),

			-- Floating Item that bursts out of the card boundaries
			Icon = WonImage and React.createElement("ImageLabel", {
				Size = UDim2.fromScale(0.75, 0.75), -- Slightly bigger
				Position = HoverOffset, -- Driven by Math.sin(time)
				AnchorPoint = Vector2.new(0.5, 0.5),
				BackgroundTransparency = 1,
				Image = WonImage,
				ScaleType = Enum.ScaleType.Fit,
				ZIndex = 6,
			}) or React.createElement("TextLabel", {
				Size = UDim2.fromScale(0.9, 0.9), -- Slightly bigger
				Position = HoverOffset,
				AnchorPoint = Vector2.new(0.5, 0.5),
				BackgroundTransparency = 1,
				Text = WonItem.Item,
				TextColor3 = Color3.new(1, 1, 1),
				Font = Enum.Font.GothamBlack,
				TextSize = 18,
				TextWrapped = true,
				ZIndex = 6,
			}),
		}),

		-- Stylized Rarity Ribbon/Text Placeholder positioned beneath the card
		RarityTextContainer = React.createElement("Frame", {
			Size = UDim2.new(1.5, 0, 0, 30),
			Position = UDim2.new(0.5, 0, 1.0, 10),
			AnchorPoint = Vector2.new(0.5, 0),
			BackgroundTransparency = 1,
			ZIndex = 5,
		}, {
			-- Dynamic pulsing scale based on rarity level and time
			Pulse = (IsLegendary or IsEpic) and React.createElement("UIScale", {
				Scale = Time:map(function(Val)
					local BumpSpeed = IsLegendary and 8 or 4
					local BumpAmp = IsLegendary and 0.1 or 0.05
					return 1 + (math.sin(Val * BumpSpeed) * BumpAmp)
				end),
			}) or nil,

			-- Deep dark Drop Shadow (renders first/behind)
			Shadow = React.createElement("TextLabel", {
				Size = UDim2.fromScale(1, 1),
				Position = UDim2.new(0, 0, 0, 3),
				BackgroundTransparency = 1,
				Text = string.upper(WonItem.Rarity),
				TextColor3 = Color3.new(0, 0, 0),
				TextTransparency = 0,
				Font = Enum.Font.GothamBlack,
				TextSize = 24,
				ZIndex = 1,
			}),

			-- Main Colored Text (renders second/in front)
			MainLabel = React.createElement("TextLabel", {
				Size = UDim2.fromScale(1, 1),
				Position = UDim2.fromScale(0, 0),
				BackgroundTransparency = 1,
				Text = string.upper(WonItem.Rarity),
				TextColor3 = Color3.new(1, 1, 1),
				Font = Enum.Font.GothamBlack,
				TextSize = 24,
				ZIndex = 2,
			}, {
				Gradient = React.createElement("UIGradient", {
					Color = ColorSequence.new({
						ColorSequenceKeypoint.new(0, GlowColor),
						ColorSequenceKeypoint.new(0.3, GlowColor),
						ColorSequenceKeypoint.new(0.5, Color3.new(1, 1, 1)), -- Wide smooth white sheen
						ColorSequenceKeypoint.new(0.7, GlowColor),
						ColorSequenceKeypoint.new(1, GlowColor),
					}),
					Rotation = 25,
					Offset = Time:map(function(Val)
						-- Slow, lazy pan that stays mostly on the text so you can easily see it
						return Vector2.new(math.sin(Val * 2) * 0.7, 0)
					end),
				}),
				Border = React.createElement("UIStroke", {
					Color = Color3.new(0, 0, 0),
					Thickness = 2,
				}),
			}),
		}),

		-- Item Details Name
		ItemText = React.createElement("TextLabel", {
			Size = UDim2.new(2, 0, 0, 20),
			Position = UDim2.new(0.5, 0, 1.0, 35),
			AnchorPoint = Vector2.new(0.5, 0),
			BackgroundTransparency = 1,
			Text = WonItem.Item,
			TextColor3 = Color3.new(0.9, 0.9, 0.9), -- Slight off-white
			Font = Enum.Font.GothamBold,
			TextSize = 16,
			TextStrokeTransparency = 0.5,
			Rotation = Time:map(function(Val)
				-- Playful wobble effect for the item name
				return math.sin(Val * 4) * 4
			end),
			ZIndex = 5,
		}),
	})
end

return UnboxingResultDisplay
