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
  INVENTORY = "inventory",
}

export enum UpgradeSubtype {
  // game
  MAX_CARDS_IN_DECK = "max_cards_in_deck",
  HAND_SIZE = "hand_size",
  MAX_ARMOR = "max_armor",
  MAX_HP = "max_hp",
  MAX_DECKS = "max_decks",
  REDRAWS_INITIAL = "redraws_initial",
  REDRAWS_DRAWN = "redraws_drawn",
  CARDS_DRAWN = "cards_drawn",
  MAX_IMMUNE_TURNS = "max_immune_turns",
  MAX_EMPTY_PASSES = "max_empty_passes",
  FULL_HAND_REDRAW = "full_hand_redraw",

  // settings
  AVATAR = "avatar",
  THEME = "theme",
  FIELD = "field",

  // resources
  MONEY = "money",
  SCRAPS = "scraps",
  KEGS = "kegs",
  SILK = "silk",
  RARE_GEMS = "rare_gems",
  WOOD = "wood",
  INGOTS = "ingots",
  RAW = "raw",
  FLOWERS = "flowers",

  // inventory resources
  FIRST_AID_KITS = "first_aid_kits",
  SHIELDS = "shields",
  IMMUNE_MAGICS = "immune_magics",
  DRAW_CARDS = "draw_cards",
  MEGA_BOMBS = "mega_bombs",
  RANDOM_BOMBS = "random_bombs",
  CLEARS = "clears",
  PURIFIES = "purifies",
  RANDOM_EFFECTS = "random_effects",

  // inventory slots
  INVENTORY_SLOTS = "inventory_slots",

  // inventory resources values
  FIRST_AID_KIT_HEAL = "first_aid_kit_heal",
  SHIELD_ARMOR = "shield_armor",
  IMMUNE_MAGICS_TURNS = "immune_magics_turns",
  INVENTORY_CARDS_DRAWN = "inventory_cards_drawn",
  PURIFIES_TARGETS = "purifies_targets",
  RANDOM_EFFECTS_TURNS = "random_effects_turns",
  RANDOM_EFFECTS_VALUE = "random_effects_value",

  // arena upgrades
  ARENA_REDRAW_CARD = "arena_redraw_card",
  ARENA_DRAW_EXACT_CARD = "arena_draw_exact_card",
  ARENA_SECOND_INVENTORY_SLOT = "arena_second_inventory_slot",
  ARENA_REDRAW_INVENTORY = "arena_redraw_inventory",
  ARENA_RESTORE_SLOT = "arena_restore_slot",
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
