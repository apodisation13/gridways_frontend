import { sound_enemy_decrease_player_damage } from "@/logic/play_sounds"
import { choice } from "@/lib/utils"
import {
  timeoutAnimationFlag,
  timeoutAnimationValue,
} from "@/logic/game_logic/timers"

function decrease_player_damage(enemy, hand, timeout = 1000) {
  let random = choice(hand)
  timeoutAnimationValue(
    hand[random],
    "damage",
    `${hand[random].damage}-${enemy.value}`,
    enemy.value * -1,
    sound_enemy_decrease_player_damage,
    timeout * 0.5
  )
  timeoutAnimationFlag(enemy, "damages_player", null, timeout * 0.5)
}

export { decrease_player_damage }
