import { sound_passive_increase_damage } from "@/logic/play_sounds"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import type { GameObj } from "@/types"

export function incr_dmg_to_all_hand(
  card: { data: { value?: number } },
  gameObj: GameObj,
  timeout = 1000
): void {
  const { hand } = gameObj
  if (!hand.length) return

  sound_passive_increase_damage()
  hand.forEach(c => {
    c.dmg_delta = card.data.value
    setTimeout(() => {
      c.dmg_delta = null
    }, timeout * 0.5)
    c.data.damage += card.data.value
    timeoutAnimationFlag(c, "incr_dmg", null, timeout * 0.5)
  })
}
