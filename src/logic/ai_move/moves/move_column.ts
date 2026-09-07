import { applyEffectAtCell } from "@/logic/ai_move/effects_interaction"
import { damage_player } from "@/logic/ai_move/moves/damage"
import { sound_enemy_move_down } from "@/logic/play_sounds"
import type { Enemy, GameObj } from "@/types"

export function move_column(
  field: (Enemy | "")[],
  i: number,
  gameObj: GameObj,
  timeout = 1000
): void {
  const enemy = field[i] as Enemy
  const row = Math.floor(i / 3)

  if (!enemy.direction_row_up) {
    // Moving down
    if (row === 3) {
      // Bottom edge: flip and immediately move up
      enemy.direction_row_up = true
      if (field[i - 3]) return
      field[i - 3] = field[i]
      field[i] = ""
      sound_enemy_move_down()
      applyEffectAtCell(i - 3, gameObj, timeout * 0.75)
      return
    }

    if (field[i + 3]) {
      const killed = applyEffectAtCell(i, gameObj, timeout * 0.75)
      if (!killed) damage_player(field[i] as Enemy, timeout)
      return
    }

    field[i + 3] = field[i]
    field[i] = ""
    sound_enemy_move_down()
    // Pre-flip when landing on bottom row
    if (i + 3 >= 9) {
      ;(field[i + 3] as Enemy).direction_row_up = true
    }
    applyEffectAtCell(i + 3, gameObj, timeout * 0.75)
  } else {
    // Moving up
    if (row === 0) {
      // Top edge: flip and immediately move down
      enemy.direction_row_up = false
      if (field[i + 3]) return
      field[i + 3] = field[i]
      field[i] = ""
      sound_enemy_move_down()
      applyEffectAtCell(i + 3, gameObj, timeout * 0.75)
      return
    }

    if (field[i - 3]) {
      const killed = applyEffectAtCell(i, gameObj, timeout * 0.75)
      if (!killed) damage_player(field[i] as Enemy, timeout)
      return
    }

    field[i - 3] = field[i]
    field[i] = ""
    sound_enemy_move_down()
    // Pre-flip when landing on top row
    if (i - 3 < 3) {
      ;(field[i - 3] as Enemy).direction_row_up = false
    }
    applyEffectAtCell(i - 3, gameObj, timeout * 0.75)
  }
}
