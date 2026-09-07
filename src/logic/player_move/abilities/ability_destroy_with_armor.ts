import { sound_destroy_enemy } from "@/logic/play_sounds"
import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { Enemy, EnemyLeader, GameObj } from "@/types"

export function destroy_with_armor(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj,
  timeout = 1000
) {
  if (!enemy.data?.armor) return

  sound_destroy_enemy()
  enemy_takes_damage(
    enemy,
    { data: { damage: enemy.data.hp } },
    gameObj,
    timeout
  )
}

export function destroy_all_with_armor(gameObj: GameObj, timeout = 1000) {
  const all_enemies = get_all_enemies(gameObj.field, gameObj.enemy_leader)
  const all_enemies_with_armor = all_enemies.filter(e => e.data?.armor || 0 > 0)

  if (all_enemies_with_armor.length === 0) return

  sound_destroy_enemy()
  for (const enemy of all_enemies_with_armor) {
    enemy_takes_damage(
      enemy,
      { data: { damage: enemy.data.hp } },
      gameObj,
      timeout
    )
  }
}
