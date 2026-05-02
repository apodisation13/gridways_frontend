import { copyObj } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import type { Card, GameObj, Leader } from "@/types"

export function spawn_self_at_deck(
  card: Card | Leader,
  gameObj: GameObj,
  timeout = 1000
): void {
  let card_copy = copyObj(card)
  card_copy.data.damage = card.data.base.base_damage
  card_copy.data.charges = card.data.base.base_charges
  gameObj.deck.push(card_copy as Card)
  timeoutAnimationFlag(
    gameObj.deck[0],
    "trigger_deck_passive",
    null,
    timeout * 0.5
  )
}
