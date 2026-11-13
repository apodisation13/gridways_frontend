import { trackAchievementEvent } from "@/logic/achievements/trackAchievementEvent"
import { sound_lose_game } from "@/logic/play_sounds"
import router from "@/router/router"
import store from "@/store"
import { AchievementEventType } from "@/types"

// функция проверки жизней, проигрыша
export function check_lose(): void {
  if (store.getters["health"] <= 0) {
    trackAchievementEvent({ type: AchievementEventType.GameLost })
    sound_lose_game()
    router.push("/lose")
  }
}
