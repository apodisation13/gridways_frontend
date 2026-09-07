import { sound_hit_armor_enemy } from "@/logic/play_sounds"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import type { Enemy, EnemyLeader, GameObj } from "@/types"

export function remove_enemy_armor(
  enemy: Enemy | EnemyLeader | { data: { armor?: number } },
  valueToBeRemoved: number | undefined = undefined
): void {
  // убирает или всю броню врага (если значение не передано), или только это значение
  if (!enemy.data?.armor) return
  if (enemy.data.armor <= 0) return
  if (!valueToBeRemoved) {
    enemy.data.armor = 0
    return
  }
  enemy.data.armor -= valueToBeRemoved
  if (enemy.data.armor < 0) enemy.data.armor = 0
  sound_hit_armor_enemy()
}

export function remove_all_enemies_armor(gameObj: GameObj): void {
  const all_enemies = get_all_enemies(gameObj.field, gameObj.enemy_leader)
  const all_enemies_with_armor = all_enemies.filter(e => e.data?.armor || 0 > 0)
  for (const enemy of all_enemies_with_armor) {
    enemy.data.armor = 0
  }
}
