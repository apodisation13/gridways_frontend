import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"
import type { Card, Leader } from "@/types"

export function add_charges_if_playing_d_all(
  card: Card | Leader,
  leader: Leader,
  upon_playing_card: boolean
): void {
  // сюда заходим по пассивке самого лидера каждый ход (тогда upon = false)
  // ИЛИ если играем карту damage-all (кроме самого лидера!) (тогда upon = true и смотрим саму карту)
  if (
    !upon_playing_card &&
    leader.data?.passive?.timer === leader.data?.passive?.default_timer
  ) {
    change_card_charges(leader, 1)
  }
  if (
    upon_playing_card &&
    (card as Card).ability?.name === "damage-all" &&
    (card as Card).color
  ) {
    change_card_charges(leader, 1)
  }
}
