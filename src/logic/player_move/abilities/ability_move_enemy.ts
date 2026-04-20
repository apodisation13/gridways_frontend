import { choice } from "@/lib/utils"
import { sound_destroy_enemy, sound_enemy_move_down } from "@/logic/play_sounds"
import type { Enemy, EnemyLeader, GameObj } from "@/types"

export function move_enemy(enemy: Enemy | EnemyLeader, gameObj: GameObj): void {
  // это если мы ткнули на лидера врагов! то здесь ничего не выполним
  if (!(enemy as Enemy).color) return

  const { field, enemies_grave } = gameObj

  const target_index = choice(field)
  const prev_index = (field as Enemy[]).indexOf(enemy as Enemy)

  // если на рандомной клетке никого нет, двигаем туда ЭТОГО врага
  if (!field[target_index]) {
    sound_enemy_move_down()
    field[target_index] = enemy as Enemy
    field[prev_index] = ""
  } else {
    // если же там кто-то есть, мы убираем того в кладбище, а этого врага ставим сюда
    sound_destroy_enemy()
    // предыдущий враг на той клетке
    const prev_enemy = field[target_index] as Enemy
    // убиваем его
    field[target_index] = ""
    // кладем в сброс и восстанавливаем его здорове
    enemies_grave.push(prev_enemy)
    prev_enemy.data.hp = prev_enemy.data.base.base_hp
    // новый враг прыгаем туда со своей старой клетки
    field[target_index] = enemy as Enemy
    field[prev_index] = ""
  }
}
