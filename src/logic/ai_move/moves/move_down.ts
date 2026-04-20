import { sound_enemy_move_down } from "@/logic/play_sounds"
import { damage_player } from "@/logic/ai_move/moves/damage"
import type { Enemy } from "@/types"

export function down_move(
  field: (Enemy | "")[],
  i: number,
  timeout = 1000
): void {
  // враги которые уже стоят внизу
  if (i >= 9) {
    damage_player(field, i, timeout)
    return
  }

  // ДЛЯ ОСТАЛЬНЫХ ВРАГОВ, i < 9, верхние 3 строки

  // ЕСЛИ У ВРАГА ЕСТЬ ВРАГ ПОД НИМ ВНИЗУ
  if (field[i + 3]) {
    damage_player(field, i, timeout)
    return
  }

  // ДЛЯ ОСТАЛЬНЫХ, КОМУ ЕСТЬ КУДА ПОХОДИТЬ
  field[i + 3] = field[i] // типа враг прыгнул на клеточку ниже
  field[i] = ""
  sound_enemy_move_down()
}
