import store from "@/store"
import { sound_enemy_damage_player, sound_hit_armor } from "@/logic/play_sounds"
import { check_lose } from "@/logic/ai_move/service/check_lose"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"

function damage_player(field, i, timeout = 1000) {
  if (field[i].locked) return

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

  store.commit("change_health", -field[i].damage)
  timeoutAnimationFlag(field[i], "damages_player", null, timeout * 0.5)
  check_lose()
}

export { damage_player }
