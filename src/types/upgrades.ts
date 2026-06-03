import { UserResources } from "@/types/database"

type UpgradeLevel = {
  value: number
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
export type UserUpgrades = Record<string, Record<string, number>>

export type ModalState = {
  category: UpgradeType
  key: UpgradeSubtype
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
  FIRST_AID_KIT_HEAL = "first_aid_kit_heal",
  SHIELD_ARMOR = "shield_armor",

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
  FLOWERS = "flowers",
  FIRST_AID_KITS = "first_aid_kits",
  SHIELDS = "shields",
}

export interface UpgradesResponse {
  upgrades: UserUpgrades
  resources: UserResources
}

export function get_value_from_upgrades(
  upgrades: UpgradesConfig,
  userUpgrades: UserUpgrades,
  upgradeType: UpgradeType,
  upgradeSubtype: UpgradeSubtype
) {
  const userLevel = userUpgrades[upgradeType]?.[upgradeSubtype] ?? 0
  return (
    upgrades[upgradeType]?.upgrades[upgradeSubtype]?.upgrades[userLevel]
      ?.value ?? 0
  )
}
