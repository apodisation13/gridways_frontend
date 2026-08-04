import { sound_destroy_enemy } from "@/logic/play_sounds"
import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"
import { Enemy, EnemyLeader, GameObj } from "@/types"

export function destroy_with_status(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj,
  timeout = 1000
) {
  if (!enemy.data?.status) return

  sound_destroy_enemy()
  enemy_takes_damage(
    enemy,
    { data: { damage: enemy.data.hp } },
    gameObj,
    timeout * 0.5
  )
}
