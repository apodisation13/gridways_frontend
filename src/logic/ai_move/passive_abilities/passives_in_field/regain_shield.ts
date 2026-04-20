import { sound_enemy_regain_shield } from "@/logic/play_sounds"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { choice_element } from "@/lib/utils"
import type { Enemy, EnemyLeader } from "@/types"

export function regain_shield(enemy: Enemy): void {
  if (!enemy.data.shield) {
    enemy.data.shield = true
    sound_enemy_regain_shield()
  }
}

export function give_shield(
  field: (Enemy | "")[],
  enemy_leader: EnemyLeader | null
): void {
  let all_enemies = get_all_enemies(field, enemy_leader)
  const random_enemy = choice_element(all_enemies) as Enemy
  if (!random_enemy.data.shield) {
    random_enemy.data.shield = true
    sound_enemy_regain_shield()
  }
}
