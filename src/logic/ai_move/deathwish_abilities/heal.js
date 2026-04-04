import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { sound_deathwish, sound_heal } from "@/logic/play_sounds"

export function deathwish_heal_all(enemy, gameObj, timeout = 1000) {
  const { field, enemy_leader } = gameObj
  let all_enemies = get_all_enemies(field, enemy_leader)

  sound_deathwish()
  sound_heal()
  all_enemies.forEach(e => {
    e.hp_delta = enemy.data.deathwish.value
    setTimeout(() => {
      e.hp_delta = null
    }, timeout)
    e.data.hp += enemy.data.deathwish.value
  })
}
