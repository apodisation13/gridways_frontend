import { choice_element } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_heal } from "@/logic/play_sounds"
import type { Enemy, GameObj } from "@/types"

export function set_hp_random_grave(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { enemies_grave } = gameObj
  if (!enemies_grave.length) return

  enemy.data.hp = choice_element(enemies_grave).data.hp
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}
