import store from "@/store"
import { AchievementGameMode } from "@/types/achievements"

// В мультиплеере имя уровня сохраняется и после multi_reset перед WinPage.
export function resolveAchievementGameMode(): AchievementGameMode {
  // Читаем актуальный стор при вызове, а не во время загрузки модуля.
  const game = store.state.game
  if (game.level?.name === AchievementGameMode.Multiplayer)
    return AchievementGameMode.Multiplayer
  if (game.arena_mode) return AchievementGameMode.Arena
  if (game.level?.name === AchievementGameMode.RandomN)
    return AchievementGameMode.RandomN
  if (game.level?.name === AchievementGameMode.Random)
    return AchievementGameMode.Random
  return AchievementGameMode.Normal
}
