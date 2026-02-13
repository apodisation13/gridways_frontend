import store from "@/store"
import { sound_heal } from "@/logic/play_sounds"

function heal(card, timeout = 1000) {
  let temp = store.state.game.health // сохраняем сколько было жизней
  store.commit("set_health", `${store.state.game.health}+${card.heal}`) // 45+12
  setTimeout(() => {
    store.commit("set_health", temp)
    store.commit("change_health", card.heal)
  }, timeout * 0.5)
  sound_heal()
}

export { heal }
