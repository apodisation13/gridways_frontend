type UpgradeLevel = {
  value: number | boolean
  next: Record<string, number> | null
}

export type UpgradeItem = {
  ordering: number
  title: string
  upgrades: Record<number, UpgradeLevel>
}

export type UpgradeCategory = {
  ordering: number
  title: string
  upgrades: Record<string, UpgradeItem>
}

export type UpgradesConfig = Record<string, UpgradeCategory>
export type UserUpgrades = Record<string, Record<string, number | boolean>>

export type ModalState = {
  category: string
  key: string
  item: UpgradeItem
}

export enum UpgradeType {
  RESOURCES = "resources",
  SETTINGS = "settings",
  GAME = "game",
}

export enum UpgradeSubtype {
  MAX_CARDS_IN_DECK = "max_cards_in_deck",
  HAND_SIZE = "hand_size",
  MAX_ARMOR = "max_armor",
  MAX_HP = "max_hp",
  MAX_DECKS = "max_decks",

  AVATAR = "avatar",
  THEME = "theme",

  MONEY = "money",
  SCRAPS = "scraps",
  KEGS = "kegs",
  SILK = "silk",
  RARE_GEMS = "rare_gems",
  WOOD = "wood",
  INGOTS = "ingots",
  RAW = "raw",
}
