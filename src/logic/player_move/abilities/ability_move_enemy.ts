import { choice } from "@/lib/utils"
import { sound_destroy_enemy, sound_enemy_move_down } from "@/logic/play_sounds"
import type { Enemy, EnemyLeader, GameObj } from "@/types"

export function move_enemy(enemy: Enemy | EnemyLeader, gameObj: GameObj): void {
  // это если мы ткнули на лидера врагов! то здесь ничего не выполним
  if (!(enemy as Enemy).color) return

  const { field } = gameObj

  const target_index = choice(field)
  const prev_index = (field as Enemy[]).indexOf(enemy as Enemy)

  // если на рандомной клетке никого нет, двигаем туда ЭТОГО врага
  if (!field[target_index]) {
    sound_enemy_move_down()
    field[target_index] = enemy as Enemy
    field[prev_index] = ""
  } else {
    // если же там кто-то есть, мы убираем того вообще, а этого врага ставим сюда
    sound_destroy_enemy()
    // ставим туда нового врага вместо старого
    field[target_index] = enemy as Enemy
    field[prev_index] = ""
  }
}
