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
