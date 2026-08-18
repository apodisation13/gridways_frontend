import { applyEffectAtCell } from "@/logic/ai_move/effects_interaction"
import { damage_player } from "@/logic/ai_move/moves/damage"
import { sound_enemy_move_down } from "@/logic/play_sounds"
import type { Enemy, GameObj } from "@/types"

export function move_row(
  field: (Enemy | "")[],
  i: number,
  gameObj: GameObj,
  timeout = 1000
): void {
  const enemy = field[i] as Enemy
  const col = i % 3
  const row = Math.floor(i / 3)
  const dir = enemy.direction_row ?? "right"

  if (dir === "right") {
    if (col === 2) {
      // Already at right edge: flip and immediately move left
      enemy.direction_row = "left"
      if (field[i - 1]) return
      field[i - 1] = field[i]
      field[i] = ""
      sound_enemy_move_down()
      applyEffectAtCell(i - 1, gameObj, timeout * 0.75)
      return
    }

    if (field[i + 1]) {
      const killed = applyEffectAtCell(i, gameObj, timeout * 0.75)
      if (!killed) damage_player(field, i, timeout)
      return
    }

    field[i + 1] = field[i]
    field[i] = ""
    sound_enemy_move_down()
    // Pre-flip when landing on right edge so next turn goes left immediately
    if ((i + 1) % 3 === 2) {
      ;(field[i + 1] as Enemy).direction_row = "left"
    }
    applyEffectAtCell(i + 1, gameObj, timeout * 0.75)
  } else {
    // dir === "left"
    if (col === 0) {
      let newRow: number
      if (!enemy.direction_row_up) {
        if (row === 3) {
          enemy.direction_row_up = true
          newRow = 2
        } else {
          newRow = row + 1
        }
      } else {
        if (row === 0) {
          enemy.direction_row_up = false
          newRow = 1
        } else {
          newRow = row - 1
        }
      }

      const newI = newRow * 3
      if (field[newI]) {
        const killed = applyEffectAtCell(i, gameObj, timeout * 0.75)
        if (!killed) damage_player(field, i, timeout)
        return
      }

      enemy.direction_row = "right"
      enemy.already_jumped = true
      field[newI] = field[i]
      field[i] = ""
      sound_enemy_move_down()
      applyEffectAtCell(newI, gameObj, timeout * 0.75)
      return
    }

    if (field[i - 1]) {
      const killed = applyEffectAtCell(i, gameObj, timeout * 0.75)
      if (!killed) damage_player(field, i, timeout)
      return
    }

    field[i - 1] = field[i]
    field[i] = ""
    sound_enemy_move_down()
    applyEffectAtCell(i - 1, gameObj, timeout * 0.75)
  }
}
