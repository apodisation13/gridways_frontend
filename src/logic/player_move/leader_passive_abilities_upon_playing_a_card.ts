import { add_charges_if_overkill } from "@/logic/player_move/passive_abilities/passives_leader/add_charges_if_overkill"
import { add_charges_to_leader_if_play_gold } from "@/logic/player_move/passive_abilities/passives_leader/add_charges_if_playing_gold"
import { add_charges_if_playing_d_all } from "@/logic/player_move/passive_abilities/passives_leader/add-charges-if-playing-d-all"
import { add_charges_to_leader_if_play_special } from "@/logic/player_move/passive_abilities/passives_leader/add-charges-to-leader-if-play-special"
import { Card, CardPassiveAbility, Enemy, EnemyLeader, Leader } from "@/types"

// диспетчер вызова пассивных абилок
// player_card - та карта, которую мы играем
// enemy - тот враг, в которого мы бьем
export function leader_passive_abilities_upon_playing_a_card(
  player_card: Card | Leader,
  leader: Leader,
  enemy: Enemy | EnemyLeader
): void {
  // здесь карты из руки проверяем
  const lpa = leader.passive_ability.name
  if (!lpa) return
  if (lpa === CardPassiveAbility.AddChargesToLeaderIfPlaySpecial) {
    add_charges_to_leader_if_play_special(player_card, leader)
  } else if (lpa === CardPassiveAbility.AddChargesToLeaderIfPlayDAll) {
    add_charges_if_playing_d_all(player_card, leader, true)
  } else if (lpa === CardPassiveAbility.AddChargesToLeaderIfOverkill) {
    add_charges_if_overkill(enemy, leader)
  } else if (lpa === CardPassiveAbility.AddChargesToLeaderIfGoldEntersGrave) {
    add_charges_to_leader_if_play_gold(player_card, leader)
  }
}
