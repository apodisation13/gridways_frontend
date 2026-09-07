import { run_passive } from "@/logic/ai_move/passive_abilities/passives_dispatcher"
import {
  allowActionTimer,
  timeoutAnimationFlag,
} from "@/logic/game_logic/timers"
import type { Enemy, GameObj } from "@/types"

export function deck_passives(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  if (!allowActionTimer(enemy)) return
  timeoutAnimationFlag(
    gameObj.enemies[0],
    "trigger_deck_passive",
    null,
    timeout * 0.5
  )
  run_passive(enemy, gameObj, timeout)
}
