import store from "@/store"
import { sound_heal } from "@/logic/play_sounds"

export function heal(card: {
  data: { heal?: number; [key: string]: any }
}): void {
  store.commit("change_health", card.data.heal)
  sound_heal()
}
