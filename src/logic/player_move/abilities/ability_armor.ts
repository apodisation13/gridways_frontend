import { sound_add_armor } from "@/logic/play_sounds"
import store from "@/store"

export function add_armor(armor_value: number, timeout = 1000): void {
  if (store.getters["armor"] >= store.getters["maxArmor"]) return
  store.commit("change_armor", armor_value)
  store.commit("set_armor_delta", armor_value)
  sound_add_armor()
  setTimeout(() => {
    store.commit("set_armor_delta", null)
  }, timeout * 0.5)
}
