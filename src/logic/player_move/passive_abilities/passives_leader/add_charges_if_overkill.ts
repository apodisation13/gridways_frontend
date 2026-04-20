import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"
import type { Enemy, EnemyLeader, Leader } from "@/types"

export function add_charges_if_overkill(
  enemy: Enemy | EnemyLeader,
  leader: Leader
): void {
  if (enemy.data.hp < 0) {
    change_card_charges(leader, 1)
  }
}
