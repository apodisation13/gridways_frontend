import { choice_pop } from "@/lib/utils"
import store from "@/store"
import { Card, GameObj } from "@/types"

export function draw_two_cards(card: Card, gameObj: GameObj) {
  const { hand, deck } = gameObj
  if (deck.length <= 0) return

  const cardCharges = card.data.charges
  if (cardCharges <= 0) return

  // Карта с последним зарядом уйдёт в сброс после способности и освободит место.
  const effectiveHandSize = hand.length - (cardCharges === 1 ? 1 : 0)
  const freeSlots = Math.max(0, store.getters["handSize"] - effectiveHandSize)
  const cardsToDraw = Math.min(2, freeSlots, deck.length)

  for (let i = 0; i < cardsToDraw; i++) {
    hand.push(choice_pop(deck))
  }
}
