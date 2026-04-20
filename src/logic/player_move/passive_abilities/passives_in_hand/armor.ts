import { add_armor } from "@/logic/player_move/abilities/ability_armor"
import type { Card } from "@/types"

export function add_armor_passive(card: Card, timeout = 1000): void {
  add_armor(card.data.passive.value, timeout)
}
