import { check_lose } from "@/logic/ai_move/service/check_lose"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import {
  sound_enemy_damage_player,
  sound_hit_armor,
  sound_immune_hit,
} from "@/logic/play_sounds"
import store from "@/store"

type DamageSource = { locked?: boolean; data: { damage: number } }

export function damage_player(source: DamageSource, timeout = 1000): void {
  if (source.locked) return

  // Логируем каждую атаку для мультиплеерной синхронизации.
  // Игрок 2 прогонит эти же удары через свою броню независимо.
  store.commit("log_player_attack", source.data.damage)

  if (store.state.game.invulnerability > 0) {
    sound_immune_hit()
    timeoutAnimationFlag(source, "damages_player", null, timeout * 0.5)
    store.commit("set_invulnerability_hit", true)
    setTimeout(() => {
      store.commit("set_invulnerability_hit", false)
    }, timeout * 0.5)
    return
  }

  if (store.state.game.armor > 0) {
    timeoutAnimationFlag(source, "damages_player", null, timeout * 0.5)
    store.commit("change_armor", -1)
    store.commit("set_armor_delta", -1)
    setTimeout(() => {
      store.commit("set_armor_delta", null)
    }, timeout * 0.5)
    sound_hit_armor()
    return
  }

  sound_enemy_damage_player()
  store.commit("change_health", -source.data.damage)
  timeoutAnimationFlag(source, "damages_player", null, timeout * 0.5)
  check_lose()
}
