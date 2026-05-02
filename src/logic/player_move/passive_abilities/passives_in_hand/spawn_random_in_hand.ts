import { choice_element, copyObj } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import store from "@/store"
import type { Card, CardEntry, GameObj } from "@/types"

export function spawn_random_in_hand(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { hand, leader } = gameObj
  if (hand.length >= store.state.game.hand_size) return

  const pool = (store.getters["all_cards"] as CardEntry[]).filter(
    c => c.card.faction === leader.faction
  )
  const random_card = choice_element(pool)
  hand.push(copyObj(random_card.card))
  timeoutAnimationFlag(card, "spawning", null, timeout * 0.5)
}
