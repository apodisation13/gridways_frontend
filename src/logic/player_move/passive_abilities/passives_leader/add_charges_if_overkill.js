import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"

export function add_charges_if_overkill(enemy, leader) {
  if (typeof enemy.hp !== "string") return // если там был щит, то у врага не убавятся жизни
  const c = enemy.hp.split("-")
  if (c[0] - c[1] < 0) {
    change_card_charges(leader, 1)
  }
}
