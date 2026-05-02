import { choice_element } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_passive_increase_damage } from "@/logic/play_sounds"
import type { Card, GameObj } from "@/types"

export function set_dmg_as_random_enemy_grave(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { enemies_grave } = gameObj
  if (!enemies_grave.length) return

  card.data.damage = choice_element(enemies_grave).data.damage

  timeoutAnimationFlag(
    card,
    "incr_dmg",
    sound_passive_increase_damage,
    timeout * 0.5
  )
}
