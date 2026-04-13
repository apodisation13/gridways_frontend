import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"

export function add_charges_if_playing_d_all(card, leader, upon_playing_card) {
  // сюда заходим по пассивке самого лидера каждый ход (тогда upon = false)
  // ИЛИ если играем карту damage-all (кроме самого лидера!) (тогда upon = true и смотрим саму карту)
  if (
    !upon_playing_card &&
    leader.data?.passive?.timer === leader.data?.passive?.default_timer
  ) {
    change_card_charges(leader, 1)
  }
  if (upon_playing_card && card.ability.name === "damage-all" && card.color) {
    change_card_charges(leader, 1)
  }
}
