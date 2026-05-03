import { heal_random } from "@/logic/ai_move/passive_abilities/passives_in_field/heal"
import {
  incr_random_dmg,
  incr_self_dmg,
} from "@/logic/ai_move/passive_abilities/passives_in_field/increase_damage"
import {
  allowActionTimer,
  timeoutAnimationFlag,
} from "@/logic/game_logic/timers"
import type { Enemy, GameObj } from "@/types"

export function grave_passives(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  if (!allowActionTimer(enemy)) return

  const { enemy_leader, field, enemies_grave } = gameObj

  const pea = enemy.passive_ability?.name

  timeoutAnimationFlag(
    enemies_grave[0],
    "trigger_grave_passive",
    null,
    timeout * 0.5
  )

  if (pea === "heal-random") {
    heal_random(enemy, field, enemy_leader, timeout)
  } else if (pea === "incr-self-dmg") {
    incr_self_dmg(enemy, timeout)
  } else if (pea === "incr-random-dmg") {
    incr_random_dmg(enemy, field, timeout)
  }
}
