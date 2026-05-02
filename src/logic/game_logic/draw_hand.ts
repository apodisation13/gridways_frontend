import { choice_pop } from "@/lib/utils"
import store from "@/store"
import type { Card } from "@/types"

// вытянули рандомом hand_size карт
export function draw_hand(hand: Card[], deck: Card[]): void {
  for (let i = 0; i < store.state.game.hand_size; i++) {
    hand.push(choice_pop(deck)) // берем рандомную карту из колоды, кладем в руку, удаляем из колоды
  }
}
