import { sound_passive_increase_damage } from "@/logic/play_sounds"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"

export function incr_dmg_to_all_hand(card, gameObj, timeout = 1000) {
  const { hand } = gameObj
  if (!hand.length) return

  sound_passive_increase_damage()
  hand.forEach(c => {
    c.dmg_delta = card.value // тут конечно косяк - берется value из пассивки, что неправильно
    setTimeout(() => {
      c.dmg_delta = null
    }, timeout * 0.5)
    c.damage += card.value
    timeoutAnimationFlag(c, "incr_dmg", null, timeout * 0.5)
  })
}
