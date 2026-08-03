import {
  allowActionTimer,
  timeoutAnimationFlag,
} from "@/logic/game_logic/timers"
import {
  incr_dmg_to_random,
  incr_self_dmg,
} from "@/logic/player_move/passive_abilities/passives_in_hand/incr_dmg"
import { Card, CardPassiveAbility, GameObj } from "@/types"

export function deck_passives(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  if (!allowActionTimer(card)) return

  timeoutAnimationFlag(card, "trigger_deck_passive", null, timeout * 0.5)

  // ДИСПЕТЧЕР ПАССИВНЫХ АБИЛОК В КОЛОДЕ
  const cpa = card.passive_ability.name
  if (cpa === CardPassiveAbility.IncrSelfDmg) {
    incr_self_dmg(card, true, timeout)
  } else if (cpa === CardPassiveAbility.IncrDmgTo) {
    incr_dmg_to_random(card, gameObj, "deck", true, timeout)
  }
}
