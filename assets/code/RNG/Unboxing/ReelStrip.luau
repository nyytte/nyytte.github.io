--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Packages = ReplicatedStorage:WaitForChild("Packages")
local React = require(Packages:WaitForChild("react"))

local CaseItem = require(script.Parent.CaseItem)

type ReelEntry = {
	Id: string | number,
	Item: string,
}

export type Props = {
	ItemSpacing: number?,
	ItemWidth: number?,
	Items: { ReelEntry }?,
	XOffsetBinding: any, -- Ripple/React binding
	ContainerWidth: number?,
}

local function ReelStrip(props: Props)
	local ItemSpacing = props.ItemSpacing or 10
	local ItemWidth = props.ItemWidth or 120
	local ReelItems = props.Items or {}
	local XOffsetBinding = props.XOffsetBinding -- This is the Ripple binding
	local ContainerWidth = props.ContainerWidth or 700
	
	-- We offset halfway so the active item exactly centers the container
	local ViewCenterOffset = (ContainerWidth / 2) - (ItemWidth / 2)
	
	-- Populate the visual React elements
	local children: { [string]: any } = {
		UIListLayout = React.createElement("UIListLayout", {
			FillDirection = Enum.FillDirection.Horizontal,
			SortOrder = Enum.SortOrder.LayoutOrder,
			Padding = UDim.new(0, ItemSpacing),
			HorizontalAlignment = Enum.HorizontalAlignment.Left,
			VerticalAlignment = Enum.VerticalAlignment.Center,
		})
	}
	
	for i, entryConfig in ipairs(ReelItems) do
		children["Item_" .. entryConfig.Id] = React.createElement(CaseItem, {
			LayoutOrder = i,
			ItemName = entryConfig.Item,
			Width = ItemWidth,
		})
	end
	
	return React.createElement("Frame", {
		Size = UDim2.new(0, 0, 1, 0),
		-- Connect our Ripple XOffset directly to position via a map
		Position = XOffsetBinding:map(function(val)
			return UDim2.new(0, ViewCenterOffset - val, 0, 0)
		end),
		BackgroundTransparency = 1,
	}, children)
end

return ReelStrip
