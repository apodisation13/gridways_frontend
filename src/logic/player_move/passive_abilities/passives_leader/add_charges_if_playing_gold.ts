import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"
import type { Card, Leader } from "@/types"

export function add_charges_to_leader_if_play_gold(
  card: Card | Leader,
  leader: Leader
): void {
  if (!(card as Card).color) return
  if ((card as Card).color === "Gold" && card.data.charges === 0) {
    change_card_charges(leader, 1)
  }
}
