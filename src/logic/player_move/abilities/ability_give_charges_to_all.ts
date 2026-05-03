import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"
import type { Card, GameObj, Leader } from "@/types"

export function give_charges_to_all(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { hand, leader, deck, grave } = gameObj

  let targets: (Card | Leader)[] = leader ? [...hand, leader] : [...hand]
  targets.splice(targets.indexOf(card), 1) // кроме самой себя!
  if (deck.length > 0) targets = targets.concat(deck)
  if (grave.length > 0) targets = targets.concat(grave)

  targets.forEach(target => {
    change_card_charges(target, card.data?.value || 0, timeout)
  })
}
