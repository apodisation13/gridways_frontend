import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_enemy_regain_shield } from "@/logic/play_sounds"
import type { GameObj } from "@/types"

export function give_shields_to_all(gameObj: GameObj): void {
  const { field } = gameObj

  field.forEach(e => {
    if (e && !e.locked) e.data.shield = true
  })
  sound_enemy_regain_shield()
}

export function give_shield_to_all_deck(
  gameObj: GameObj,
  timeout = 1000
): void {
  const { enemies } = gameObj
  if (!enemies.length) return

  enemies.forEach(e => {
    e.data.shield = true
  })
  sound_enemy_regain_shield()
  timeoutAnimationFlag(enemies[0], "trigger_deck_passive", null, timeout * 0.5)
}
