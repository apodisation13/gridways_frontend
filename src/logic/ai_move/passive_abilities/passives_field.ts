import { run_passive } from "@/logic/ai_move/passive_abilities/passives_dispatcher"
import { allowActionTimer } from "@/logic/game_logic/timers"
import type { Enemy, GameObj } from "@/types"

export function field_passives(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  if (!allowActionTimer(enemy)) return
  run_passive(enemy, gameObj, timeout)
}
