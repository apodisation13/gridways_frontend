import { enemySpawnsAtEmptyCell } from "@/logic/ai_move/effects_interaction"
import { sound_appear_new_enemy } from "@/logic/play_sounds"
import store from "@/store" // stote.state OR store.commit
import type { Enemy, GameObj } from "@/types"

// расставить врагов, только первые 9 клеток, + параметр из уровня, сколько в начале появляется сразу врагов
export function place_enemies(
  field: (Enemy | "")[],
  enemy_list: Enemy[]
): void {
  const starting_enemies = store.state.game.level?.starting_enemies_number
  if (!starting_enemies) return
  for (let i = 0; i < starting_enemies; i++) {
    let random = Math.floor(Math.random() * 9) // 9, чтобы внизу не появлялись
    let random_enemy = Math.floor(Math.random() * enemy_list.length)
    field[random] = enemy_list[random_enemy]

    enemy_list.splice(random_enemy, 1) // удалить врага из списка врагов
  }
}

export function appear_new_enemy(gameObj: GameObj, timeout = 1000): void {
  const { field, enemies } = gameObj
  let random = Math.floor(Math.random() * 3)

  if (enemies.length && !field[random]) {
    let random2 = Math.floor(Math.random() * enemies.length)
    const enemy = enemies[random2]
    enemies.splice(random2, 1)
    sound_appear_new_enemy()
    enemySpawnsAtEmptyCell(enemy, random, gameObj, timeout)
  }
}
