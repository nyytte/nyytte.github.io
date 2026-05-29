--!strict
export type ItemData = {
	Name: string,
	Rarity: string,
	Weight: number,
	Value: number,
}

export type CaseData = {
	Cost: number,
	ZIndex: number,
	CaseImage: string,
	Items: { ItemData },
	Colors: { [string]: Color3 },
	Images: { [string]: string },
}

local BasicCase: CaseData = {
	Cost = 0,
	ZIndex = 1,
	CaseImage = "rbxassetid://91031777727630",
	-- 100% Total precisely spread across specific items
	Items = {
		{ Name = "Cucaracha", Rarity = "Common", Weight = 15.0, Value = 10 },
		{ Name = "gnar", Rarity = "Common", Weight = 15.0, Value = 10 },
		{ Name = "twitch", Rarity = "Rare", Weight = 20.0, Value = 30 },
		{ Name = "Cat", Rarity = "Rare", Weight = 20.0, Value = 30 },
		{ Name = "porofessor", Rarity = "Epic", Weight = 25.0, Value = 250 },
		{ Name = "Fizz", Rarity = "Legendary", Weight = 5.0, Value = 1500 },
	},

	-- Visual glow color for the item boxes based on their rarity
	Colors = {
		Common = Color3.fromRGB(150, 150, 150),
		Rare = Color3.fromRGB(50, 150, 255),
		Epic = Color3.fromRGB(200, 50, 255),
		Legendary = Color3.fromRGB(255, 180, 50),
	},

	-- UI Decals/Images mapped to specific item names (not rarities)
	Images = {
		["Cucaracha"] = "rbxassetid://18226413257",
		["gnar"] = "rbxassetid://138858488344902",
		["twitch"] = "rbxassetid://77252426926297",
		["Cat"] = "rbxassetid://16124603477",
		["porofessor"] = "rbxassetid://132585021010658",
		["Fizz"] = "rbxassetid://106754245816051",
	},
}

return BasicCase
