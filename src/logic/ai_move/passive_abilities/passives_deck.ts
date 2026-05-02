import {
  allowActionTimer,
  timeoutAnimationFlag,
} from "@/logic/game_logic/timers"
import {
  heal_random,
  heal_self,
} from "@/logic/ai_move/passive_abilities/passives_in_field/heal"
import type { Enemy, GameObj } from "@/types"

export function deck_passives(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  if (!allowActionTimer(enemy)) return

  const { enemy_leader, field, enemies } = gameObj

  const pea = enemy.passive_ability?.name

  timeoutAnimationFlag(enemies[0], "trigger_deck_passive", null, timeout * 0.5)

  if (pea === "heal-random") {
    heal_random(enemy, field, enemy_leader, timeout)
  } else if (pea === "heal-self") {
    heal_self(enemy, timeout)
  }
}
