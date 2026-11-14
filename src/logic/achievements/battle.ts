import store from "@/store"
import { CardColor } from "@/types/game"

import { resolveAchievementGameMode } from "./gameMode"

export function startAchievementBattle(): void {
  // Только счётчик применений лидера. Данные игры уже хранятся в игровом сторе.
  store.commit("startAchievementBattle")
}

export function finishAchievementBattle() {
  const mode = resolveAchievementGameMode()
  // Состав кладбища именно на победе: это не история всех убийств за бой.
  // Лидеры в кладбище не попадают. Ничего не добавляем к его размеру.
  const grave = store.state.game.enemies_grave
  const enemy_grave = { total: grave.length, bronze: 0, silver: 0, gold: 0 }
  for (const enemy of grave) {
    if (enemy.color === CardColor.Bronze) enemy_grave.bronze++
    else if (enemy.color === CardColor.Silver) enemy_grave.silver++
    else if (enemy.color === CardColor.Gold) enemy_grave.gold++
  }
  // Игровые функции работают с копиями; исходную колоду берём из стора.
  // Независимый снимок для очереди создаёт сама trackAchievementEvent.
  return {
    mode,
    difficulty: store.state.game.level?.difficulty,
    starting_deck: {
      cards: store.state.game.current_deck.map(entry => entry.card),
      leader: store.state.game.leader,
    },
    leader_uses: store.state.achievements.leader_uses,
    enemy_grave,
  }
}
