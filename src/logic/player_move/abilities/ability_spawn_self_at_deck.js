import { copyObj } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import store from "@/store"

export function spawn_self_at_deck(card, gameObj, timeout = 1000) {
  let card_copy = copyObj(card)
  const store_cards = store.getters["all_cards"]
  const base_card = store_cards.find(card => card.card.id === card_copy.id)
  card_copy.data.damage = base_card.card.data.damage
  gameObj.deck.push(card_copy)
  timeoutAnimationFlag(
    gameObj.deck[0],
    "trigger_deck_passive",
    null,
    timeout * 0.5
  )
}
