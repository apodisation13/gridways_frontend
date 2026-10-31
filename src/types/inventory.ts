import { UpgradeSubtype } from "@/types/upgrades"

export enum InventoryItem {
  FIRST_AID_KITS = "first_aid_kits",
  SHIELDS = "shields",
  IMMUNE_MAGICS = "immune_magics",
  DRAW_CARDS = "draw_cards",
  MEGA_BOMBS = "mega_bombs",
  RANDOM_BOMBS = "random_bombs",
  CLEARS = "clears",
  PURIFIES = "purifies",
  RANDOM_EFFECTS = "random_effects",
}

export interface UserInventory {
  slots: InventoryItem[]
}

export interface InventoryEffectValues {
  [UpgradeSubtype.FIRST_AID_KIT_HEAL]: number
  [UpgradeSubtype.SHIELD_ARMOR]: number
  [UpgradeSubtype.IMMUNE_MAGICS_TURNS]: number
  [UpgradeSubtype.INVENTORY_CARDS_DRAWN]: number
  [UpgradeSubtype.PURIFIES_TARGETS]: number
  [UpgradeSubtype.RANDOM_EFFECTS_TURNS]: number
  [UpgradeSubtype.RANDOM_EFFECTS_VALUE]: number
}
