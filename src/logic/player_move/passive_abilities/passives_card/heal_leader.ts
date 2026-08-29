import { change_health } from "@/logic/game_logic/change_health"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import type { Card } from "@/types"

export function heal_leader(card: Card, timeout = 1000): void {
  change_health({ data: { heal: card.data.passive.value } })
  timeoutAnimationFlag(card, "healing", null, timeout * 0.5)
}
