import store from "@/store"
import { sound_enemy_damage_player } from "@/logic/play_sounds"
import { check_lose } from "@/logic/ai_move/service/check_lose"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"

function damage_player(field, i, timeout = 1000) {
  if (field[i].locked) return

  sound_enemy_damage_player()

  let temp = store.state.game.health // сохраняем сколько было жизней
  store.commit("set_health", `${store.state.game.health}-${field[i].damage}`) // 45-12

  timeoutAnimationFlag(field[i], "damages_player", null, timeout * 0.5)
  setTimeout(() => {
    store.commit("set_health", temp)
    store.commit("change_health", -field[i].damage)
    check_lose()
  }, timeout * 0.5)
}

export { damage_player }
