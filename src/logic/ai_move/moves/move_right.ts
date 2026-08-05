import { applyEffectAtCell } from "@/logic/ai_move/effects_interaction"
import { damage_player } from "@/logic/ai_move/moves/damage"
import { sound_enemy_move_down } from "@/logic/play_sounds"
import type { Enemy, GameObj } from "@/types"

export function right_move(
  field: (Enemy | "")[],
  i: number,
  gameObj: GameObj,
  timeout = 1000
): void {
  // враг, который стоит снизу справа, ячейка номер 11
  // ЕСЛИ У ВРАГА ЕСТЬ ВРАГ СПРАВА ОТ НЕГО (то есть индекс + 1)
  if (i === 11 || field[i + 1]) {
    const killed = applyEffectAtCell(i, gameObj, timeout)
    if (!killed) damage_player(field, i, timeout)
    return
  }

  // ДЛЯ ОСТАЛЬНЫХ, КОМУ ЕСТЬ КУДА ПОХОДИТЬ
  field[i + 1] = field[i] // враг сдвинулся правее, или на следующую строку слева если он был в правом столбце
  field[i] = ""
  sound_enemy_move_down()
  applyEffectAtCell(i + 1, gameObj, timeout)
}
