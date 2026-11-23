import { trackAchievementEvent } from "@/logic/achievements/trackAchievementEvent"
import { sound_add_armor } from "@/logic/play_sounds"
import store from "@/store"
import { AchievementEventType } from "@/types"

export function add_armor(armor_value: number, timeout = 1000): void {
  if (store.getters["armor"] >= store.getters["maxArmor"]) return
  const before: number = store.getters["armor"]
  store.commit("change_armor", armor_value)
  // Мутация применяет лимит: учитываем только фактически добавленную броню.
  trackAchievementEvent({
    type: AchievementEventType.ArmorGained,
    amount: store.getters["armor"] - before,
  })
  store.commit("set_armor_delta", armor_value)
  sound_add_armor()
  setTimeout(() => {
    store.commit("set_armor_delta", null)
  }, timeout * 0.5)
}
