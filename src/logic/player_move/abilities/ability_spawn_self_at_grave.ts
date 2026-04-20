import { copyObj } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import type { Card, Leader, GameObj } from "@/types"

export function spawn_self_at_grave(
  card: Card | Leader,
  gameObj: GameObj,
  timeout = 1000
): void {
  gameObj.grave.push(copyObj(card) as Card)
  timeoutAnimationFlag(
    gameObj.grave[0],
    "trigger_grave_passive",
    null,
    timeout * 0.5
  )
}
