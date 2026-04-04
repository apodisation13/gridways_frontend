import { choice_element } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_passive_increase_damage } from "@/logic/play_sounds"

export function set_dmg_random_grave(enemy, gameObj, timeout = 1000) {
  const { enemies_grave } = gameObj
  if (!enemies_grave.length) return

  enemy.data.damage = choice_element(enemies_grave).data.damage
  timeoutAnimationFlag(
    enemy,
    "incr_dmg",
    sound_passive_increase_damage,
    timeout * 0.5
  )
}
