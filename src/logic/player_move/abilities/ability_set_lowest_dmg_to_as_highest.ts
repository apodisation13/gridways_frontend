import { copyObj } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_passive_increase_damage } from "@/logic/play_sounds"
import type { GameObj } from "@/types"

export function set_lowest_dmg_to_as_highest(
  gameObj: GameObj,
  timeout = 1000
): void {
  const { hand } = gameObj
  const hand_calc = copyObj(hand)
  const highest_dmg_card = hand_calc.sort(
    (a, b) => b.data.damage - a.data.damage
  )[0]
  const lowest_dmg_card = hand_calc.sort(
    (a, b) => a.data.damage - b.data.damage
  )[0]
  const card = hand.filter(c => c.id === lowest_dmg_card.id)[0]
  hand[hand.indexOf(card)].data.damage = highest_dmg_card.data.damage
  timeoutAnimationFlag(
    hand[hand.indexOf(card)],
    "incr_dmg",
    sound_passive_increase_damage,
    timeout * 0.5
  )
  card.dmg_delta = highest_dmg_card.data.damage
  setTimeout(() => {
    card.dmg_delta = null
  }, timeout * 0.5)
}
