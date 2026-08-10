import { purify_sound } from "@/logic/play_sounds"
import type { Enemy, EnemyLeader } from "@/types"

export function purify(enemy: Enemy | EnemyLeader): void {
  let needSound = false
  if (enemy.deathwish?.name) {
    enemy.deathwish = null
    needSound = true
  }
  if (enemy.passive_ability?.name) {
    enemy.passive_ability = null
    needSound = true
  }
  if (enemy.data.status) {
    enemy.data.status = null
    needSound = true
  }
  if (enemy.data.shield) {
    enemy.data.shield = false
    needSound = true
  }
  if (needSound) purify_sound()
}
