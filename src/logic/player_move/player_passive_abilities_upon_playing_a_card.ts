import { add_charges_to_leader_if_play_special } from "@/logic/player_move/passive_abilities/passives_leader/add-charges-to-leader-if-play-special"
import { add_charges_if_playing_d_all } from "@/logic/player_move/passive_abilities/passives_leader/add-charges-if-playing-d-all"
import { add_charges_if_overkill } from "@/logic/player_move/passive_abilities/passives_leader/add_charges_if_overkill"
import type { Card, Leader, Enemy, EnemyLeader } from "@/types"

// диспетчер вызова пассивных абилок
// player_card - та карта, которую мы играем
// enemy - тот враг, в которого мы бьем
export function player_passive_abilities_upon_playing_a_card(
  player_card: Card | Leader,
  leader: Leader,
  enemy: Enemy | EnemyLeader
): void {
  // здесь карты из руки проверяем
  const lpa = leader.passive_ability.name
  if (!lpa) return
  if (lpa === "add-charges-to-leader-if-play-special") {
    add_charges_to_leader_if_play_special(player_card, leader)
  } else if (lpa === "add-charges-to-leader-if-play-d-all") {
    add_charges_if_playing_d_all(player_card, leader, true)
  } else if (lpa === "add-charges-to-leader-if-overkill") {
    add_charges_if_overkill(enemy, leader)
  }
}
