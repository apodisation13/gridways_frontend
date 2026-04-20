import type { Enemy, EnemyLeader } from "@/types"

export function set_enemy_as_token(enemy: Enemy | EnemyLeader): void {
  enemy.data.hp = 1
  ;(enemy as Enemy).data.damage = 1
}
