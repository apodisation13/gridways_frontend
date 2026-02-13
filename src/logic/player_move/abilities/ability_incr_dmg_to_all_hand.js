import { sound_passive_increase_damage } from "@/logic/play_sounds"
import {
  timeoutAnimationFlag,
  timeoutAnimationValue,
} from "@/logic/game_logic/timers"

export function incr_dmg_to_all_hand(card, gameObj, timeout = 1000) {
  const { hand } = gameObj
  if (!hand.length) return

  sound_passive_increase_damage()
  hand.forEach(c => {
    timeoutAnimationValue(
      c,
      "damage",
      c.damage + card.value,
      card.value,
      null,
      timeout * 0.5
    )
    timeoutAnimationFlag(c, "incr_dmg", null, timeout * 0.5)
  })
}
