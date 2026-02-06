import { CardType } from "@/logic/models"

function add_charges_to_leader_if_play_special(card, leader) {
  if (card.type === CardType.Special) {
    leader.charges += 1
  }
}

export { add_charges_to_leader_if_play_special }
