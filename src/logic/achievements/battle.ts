import store from "@/store"
import type { AchievementBattle, AchievementGameMode } from "@/types"

export function startAchievementBattle(mode: AchievementGameMode): void {
  // Игровая рука/колода меняются. Сохраняем независимый исходный состав из стора.
  const battle: AchievementBattle = JSON.parse(
    JSON.stringify({
      mode,
      starting_deck: {
        cards: store.state.game.current_deck.map(entry => entry.card),
      },
      leader_uses: 0,
    })
  )
  store.commit("startAchievementBattle", battle)
}

export function finishAchievementBattle(mode: AchievementGameMode) {
  const battle = store.state.achievements.battle
  const result =
    battle?.mode === mode
      ? JSON.parse(
          JSON.stringify({
            starting_deck: battle.starting_deck,
            leader_uses: battle.leader_uses,
          })
        )
      : {}
  // Отсутствие снимка не должно превращаться в «лидер точно не использовался».
  store.commit("clearAchievementBattle")
  return { mode, ...result }
}
