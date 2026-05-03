import { add_armor } from "@/logic/player_move/abilities/ability_armor"
import type { Card } from "@/types"

export function add_armor_passive(card: Card, timeout = 1000): void {
  const armor_value = card.data?.passive?.value
  if (!armor_value) return
  add_armor(armor_value, timeout)
}
