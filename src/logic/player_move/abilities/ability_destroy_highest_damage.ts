import { sound_destroy_enemy } from "@/logic/play_sounds"
import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import type { Enemy, GameObj } from "@/types"

export function destroy_highest_damage(gameObj: GameObj, timeout = 1000): void {
  const { field } = gameObj

  let all_enemies = get_all_enemies(field, null)

  if (!all_enemies.length) return

  all_enemies.sort(
    (a, b) => (a as Enemy).data.damage - (b as Enemy).data.damage
  )
  let target = all_enemies[all_enemies.length - 1] as Enemy

  sound_destroy_enemy()
  enemy_takes_damage(
    target,
    { data: { damage: target.data.hp } },
    gameObj,
    timeout
  )
}
