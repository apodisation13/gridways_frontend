import { sound_heal } from "@/logic/play_sounds"
import store from "@/store"

export function change_health(card: {
  data: { heal?: number; [key: string]: any }
}): void {
  if (store.getters["health"] >= store.getters["maxHp"]) return
  store.commit("change_health", card.data.heal)
  sound_heal()
}
