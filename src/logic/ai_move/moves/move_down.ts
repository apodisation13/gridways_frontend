import { applyEffectAtCell } from "@/logic/ai_move/effects_interaction"
import { damage_player } from "@/logic/ai_move/moves/damage"
import { sound_enemy_move_down } from "@/logic/play_sounds"
import type { Enemy, GameObj } from "@/types"

export function down_move(
  field: (Enemy | "")[],
  i: number,
  gameObj: GameObj,
  timeout = 1000
): void {
  // Enemy already at the bottom row or blocked below — check effect then damage player
  if (i >= 9 || field[i + 3]) {
    const killed = applyEffectAtCell(i, gameObj, timeout * 0.75)
    if (!killed) damage_player(field[i] as Enemy, timeout)
    return
  }

  // Empty cell below — move there, then check effect at new position
  field[i + 3] = field[i]
  field[i] = ""
  sound_enemy_move_down()
  applyEffectAtCell(i + 3, gameObj, timeout * 0.75)
}
