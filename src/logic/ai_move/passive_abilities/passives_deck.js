import {
  allowActionTimer,
  timeoutAnimationFlag,
} from "@/logic/game_logic/timers"
import { heal_random } from "@/logic/ai_move/passive_abilities/passives_in_field/heal"

export function deck_passives(enemy, gameObj, timeout = 1000) {
  if (!allowActionTimer(enemy)) return

  const { enemy_leader, field, enemies } = gameObj

  const pea = enemy.passive_ability?.name

  if (pea === "heal-random") {
    heal_random(enemy, field, enemy_leader, timeout)
    timeoutAnimationFlag(
      enemies[0],
      "trigger_deck_passive",
      null,
      timeout * 0.5
    )
  }
}
