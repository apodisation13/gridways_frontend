import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import {
  sound_deathwish,
  sound_enemy_damage_player,
  sound_enemy_heal,
} from "@/logic/play_sounds"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import store from "@/store"
import type { Enemy, GameObj } from "@/types"

// устанавливает жизни игрока равными enemy.deathwish_value!
export function set_hp(enemy: Enemy): void {
  sound_deathwish()
  store.commit("set_health", enemy.data?.deathwish?.value || 1)
  sound_enemy_damage_player()
}

// устанавливает жизни самого слабого врага на поле, включая лидера врагов, равным жизням самого сильного врага на поле
export function set_weakest_hp_as_highest(
  gameObj: GameObj,
  timeout = 1000
): void {
  sound_deathwish()
  const { field, enemy_leader } = gameObj
  let all_enemies = get_all_enemies(field, enemy_leader)
  all_enemies.sort((a, b) => b.data.hp - a.data.hp)
  if (all_enemies.length <= 1) return // выходим если там остался всего 1 враг
  let strongest = all_enemies[0]
  let weakest = all_enemies.at(-1)
  if (!weakest) return
  weakest.data.hp = strongest.data.hp
  sound_enemy_heal()
  timeoutAnimationFlag(weakest, "healing", null, timeout * 0.5)
}
