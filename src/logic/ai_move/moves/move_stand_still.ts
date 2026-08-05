import { applyEffectAtCell } from "@/logic/ai_move/effects_interaction"
import { damage_player } from "@/logic/ai_move/moves/damage"
import type { Enemy, GameObj } from "@/types"

export function stand_still(
  field: (Enemy | "")[],
  i: number,
  gameObj: GameObj,
  timeout = 1000
): void {
  const killed = applyEffectAtCell(i, gameObj, timeout)
  if (!killed) damage_player(field, i, timeout)
}
