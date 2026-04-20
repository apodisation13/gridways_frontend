import { heal } from "@/logic/player_move/abilities/ability_heal"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import type { Card } from "@/types"

export function heal_leader(card: Card, timeout = 1000): void {
  heal({ data: { heal: card.data.passive.value } })
  timeoutAnimationFlag(card, "healing", null, timeout * 0.5)
}
