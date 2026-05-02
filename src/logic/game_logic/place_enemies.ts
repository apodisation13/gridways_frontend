import { sound_appear_new_enemy } from "@/logic/play_sounds"
import store from "@/store" // stote.state OR store.commit
import type { Enemy } from "@/types"

// расставить врагов, только первые 9 клеток, + параметр из уровня, сколько в начале появляется сразу врагов
export function place_enemies(
  field: (Enemy | "")[],
  enemy_list: Enemy[]
): void {
  for (let i = 0; i < store.state.game.level.starting_enemies_number; i++) {
    let random = Math.floor(Math.random() * 9) // 9, чтобы внизу не появлялись
    let random_enemy = Math.floor(Math.random() * enemy_list.length)
    field[random] = enemy_list[random_enemy]

    enemy_list.splice(random_enemy, 1) // удалить врага из списка врагов
  }
}

export function appear_new_enemy(
  field: (Enemy | "")[],
  enemy_list: Enemy[]
): void {
  // враги появляются только наверху
  let random = Math.floor(Math.random() * 3)

  if (enemy_list.length && !field[random]) {
    let random2 = Math.floor(Math.random() * enemy_list.length)
    field[random] = enemy_list[random2] // появляется враг
    enemy_list.splice(random2, 1) // удаляется из списка врагов
    sound_appear_new_enemy()
  }
}
