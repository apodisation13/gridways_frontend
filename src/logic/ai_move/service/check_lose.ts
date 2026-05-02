import { sound_lose_game } from "@/logic/play_sounds"
import router from "@/router/router"
import store from "@/store"

// функция проверки жизней, проигрыша
export function check_lose(): void {
  if (store.state.game.health <= 0) {
    sound_lose_game()
    router.push("/lose")
  }
}
