import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"

export function add_charges_if_overkill(enemy, leader) {
  if (enemy.data.hp < 0) {
    change_card_charges(leader, 1)
  }
}
