import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"

export function give_charges_to_all(card, gameObj, timeout = 1000) {
  const { hand, leader, deck, grave } = gameObj

  let targets = hand.concat(leader)
  targets.splice(targets.indexOf(card), 1) // кроме самой себя!
  if (deck.length > 0) targets = targets.concat(deck)
  if (grave.length > 0) targets = targets.concat(grave)

  targets.forEach(target => {
    change_card_charges(target, card.data.value, timeout)
  })
}
