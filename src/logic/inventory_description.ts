import { InventoryItem } from "@/types/inventory"
import {
  get_value_from_upgrades,
  type UpgradesConfig,
  UpgradeSubtype,
  UpgradeType,
  type UserUpgrades,
} from "@/types/upgrades"

const valueUpgrades: Partial<Record<InventoryItem, UpgradeSubtype>> = {
  [InventoryItem.FIRST_AID_KITS]: UpgradeSubtype.FIRST_AID_KIT_HEAL,
  [InventoryItem.SHIELDS]: UpgradeSubtype.SHIELD_ARMOR,
  [InventoryItem.IMMUNE_MAGICS]: UpgradeSubtype.IMMUNE_MAGICS_TURNS,
  [InventoryItem.DRAW_CARDS]: UpgradeSubtype.INVENTORY_CARDS_DRAWN,
  [InventoryItem.PURIFIES]: UpgradeSubtype.PURIFIES_TARGETS,
  [InventoryItem.RANDOM_EFFECTS]: UpgradeSubtype.RANDOM_EFFECTS_TURNS,
}

export function describeInventoryItem(
  item: string,
  description: string,
  upgrades: UpgradesConfig,
  userUpgrades: UserUpgrades
): string {
  return description.replace(
    /\{(value|turns\/times_count)\}/g,
    (placeholder, key: string) => {
      const subtype =
        key === "value"
          ? valueUpgrades[item as InventoryItem]
          : item === InventoryItem.RANDOM_EFFECTS
            ? UpgradeSubtype.RANDOM_EFFECTS_VALUE
            : undefined
      if (!subtype) return placeholder
      const value = get_value_from_upgrades(
        upgrades,
        userUpgrades,
        UpgradeType.INVENTORY,
        subtype
      )
      return `{{ ${value} }}`
    }
  )
}
