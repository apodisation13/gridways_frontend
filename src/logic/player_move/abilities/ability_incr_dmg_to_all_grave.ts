import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import type { Card, GameObj } from "@/types"

export function incr_dmg_to_all_grave(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { grave } = gameObj
  if (!grave.length) return

  const dmg_delta = card.data?.value
  if (!dmg_delta) return

  grave.forEach(c => {
    c.data.damage += dmg_delta
  })
  timeoutAnimationFlag(grave[0], "trigger_grave_passive", null, timeout * 0.5)
}
