import { copyObj } from "@/lib/utils"
import { trackEnemyDefenceChanges } from "@/logic/achievements/enemyEvents"
import { lock_sound } from "@/logic/play_sounds"
import { Enemy, EnemyLeader, EnemyStatus } from "@/types"

export function lock_enemy(enemy: Enemy | EnemyLeader): void {
  if (enemy.data.status === EnemyStatus.Veil) return
  const before = copyObj(enemy)
  enemy.data.shield = false
  enemy.passive_ability = null
  enemy.deathwish = null
  if (!enemy.locked) {
    enemy.locked = true
    lock_sound()
  }
  trackEnemyDefenceChanges(before, enemy)
}
