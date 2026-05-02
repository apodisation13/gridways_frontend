import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_passive_increase_damage } from "@/logic/play_sounds"
import type { GameObj } from "@/types"

export function incr_dmg_to_all_hand(
  card: { data: { value?: number } },
  gameObj: GameObj,
  timeout = 1000
): void {
  const { hand } = gameObj
  if (!hand.length) return

  sound_passive_increase_damage()
  const dmg_delta = card.data?.value
  if (!dmg_delta) return
  hand.forEach(c => {
    c.dmg_delta = dmg_delta
    setTimeout(() => {
      c.dmg_delta = null
    }, timeout * 0.5)
    c.data.damage += dmg_delta
    timeoutAnimationFlag(c, "incr_dmg", null, timeout * 0.5)
  })
}
