import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"
import type { Card, Leader } from "@/types"
import { CardType } from "@/types"

export function add_charges_to_leader_if_play_special(
  card: Card | Leader,
  leader: Leader
): void {
  if ((card as Card).type === CardType.Special) {
    change_card_charges(leader, 1)
  }
}
