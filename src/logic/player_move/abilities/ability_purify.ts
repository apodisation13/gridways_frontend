import type { Enemy, EnemyLeader } from "@/types"

export function purify(enemy: Enemy | EnemyLeader): void {
  enemy.deathwish = null
  enemy.passive_ability = null
  enemy.data.status = null
  enemy.data.shield = false
}
