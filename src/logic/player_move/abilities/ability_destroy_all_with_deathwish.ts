import { sound_destroy_enemy } from "@/logic/play_sounds"
import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { GameObj } from "@/types"

export function destroy_all_with_deathwish(gameObj: GameObj, timeout = 1000) {
  const { field, enemy_leader } = gameObj

  const all_enemies = get_all_enemies(field, enemy_leader)
  const targets = all_enemies.filter(e => e.deathwish?.name)

  if (targets.length === 0) return

  sound_destroy_enemy()
  targets.forEach(e => {
    e.deathwish = null
    enemy_takes_damage(e, { data: { damage: e.data.hp } }, gameObj, timeout)
  })
}
