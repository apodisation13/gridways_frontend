import { check_lose } from "@/logic/ai_move/service/check_lose"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_enemy_damage_player, sound_hit_armor } from "@/logic/play_sounds"
import store from "@/store"
import type { Enemy } from "@/types"

export function damage_player(
  field: (Enemy | "")[],
  i: number,
  timeout = 1000
): void {
  if ((field[i] as Enemy).locked) return

  // Логируем каждую атаку для мультиплеерной синхронизации.
  // Игрок 2 прогонит эти же удары через свою броню независимо.
  store.commit("log_player_attack", (field[i] as Enemy).data.damage)

  if (store.state.game.armor > 0) {
    timeoutAnimationFlag(field[i], "damages_player", null, timeout * 0.5)
    store.commit("change_armor", -1)
    store.commit("set_armor_delta", -1)
    setTimeout(() => {
      store.commit("set_armor_delta", null)
    }, timeout * 0.5)
    sound_hit_armor()
    return
  }

  sound_enemy_damage_player()

  store.commit("change_health", -(field[i] as Enemy).data.damage)
  timeoutAnimationFlag(field[i], "damages_player", null, timeout * 0.5)
  check_lose()
}
