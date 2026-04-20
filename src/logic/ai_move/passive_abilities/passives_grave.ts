import {
  allowActionTimer,
  timeoutAnimationFlag,
} from "@/logic/game_logic/timers"
import { heal_random } from "@/logic/ai_move/passive_abilities/passives_in_field/heal"
import type { Enemy, GameObj } from "@/types"

export function grave_passives(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  if (!allowActionTimer(enemy)) return

  const { enemy_leader, field, enemies_grave } = gameObj

  const pea = enemy.passive_ability?.name

  if (pea === "heal-random") {
    heal_random(enemy, field, enemy_leader, timeout)
    timeoutAnimationFlag(
      enemies_grave[0],
      "trigger_grave_passive",
      null,
      timeout * 0.5
    )
  }
}
