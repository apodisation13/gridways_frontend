import { copyObj } from "@/lib/utils"
import { trackEnemyDefenceChanges } from "@/logic/achievements/enemyEvents"
import { sound_hit_armor_enemy } from "@/logic/play_sounds"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import type { Enemy, EnemyLeader, GameObj } from "@/types"

export function remove_enemy_armor(
  enemy: Enemy | EnemyLeader,
  valueToBeRemoved: number | undefined = undefined
): void {
  // убирает или всю броню врага (если значение не передано), или только это значение
  if (!enemy.data?.armor) return
  if (enemy.data.armor <= 0) return
  const before = copyObj(enemy)
  if (!valueToBeRemoved) {
    enemy.data.armor = 0
    trackEnemyDefenceChanges(before, enemy)
    return
  }
  enemy.data.armor -= valueToBeRemoved
  if (enemy.data.armor < 0) enemy.data.armor = 0
  trackEnemyDefenceChanges(before, enemy)
  sound_hit_armor_enemy()
}

export function remove_all_enemies_armor(gameObj: GameObj): void {
  const all_enemies = get_all_enemies(gameObj.field, gameObj.enemy_leader)
  const all_enemies_with_armor = all_enemies.filter(e => e.data?.armor || 0 > 0)
  for (const enemy of all_enemies_with_armor) {
    const before = copyObj(enemy)
    enemy.data.armor = 0
    trackEnemyDefenceChanges(before, enemy)
  }
}
