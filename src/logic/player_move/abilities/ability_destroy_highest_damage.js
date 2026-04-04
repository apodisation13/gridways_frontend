import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { sound_destroy_enemy } from "@/logic/play_sounds"
import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"

function destroy_highest_damage(gameObj, timeout = 1000) {
  const { field } = gameObj

  let all_enemies = get_all_enemies(field, null)

  if (!all_enemies.length) return

  all_enemies.sort((a, b) => b.data.damage - a.data.damage)
  let target = all_enemies[0]

  sound_destroy_enemy()
  enemy_takes_damage(
    target,
    { data: { damage: target.data.hp } },
    gameObj,
    timeout
  )
}

export { destroy_highest_damage }
