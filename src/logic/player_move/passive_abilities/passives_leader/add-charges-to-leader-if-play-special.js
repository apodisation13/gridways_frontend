import { CardType } from "@/types"
import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"

function add_charges_to_leader_if_play_special(card, leader) {
  if (card.type === CardType.Special) {
    change_card_charges(leader, 1)
  }
}

export { add_charges_to_leader_if_play_special }
