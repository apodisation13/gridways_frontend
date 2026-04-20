import { damage_player } from "@/logic/ai_move/moves/damage"
import type { Enemy } from "@/types"

export function stand_still(
  field: (Enemy | "")[],
  i: number,
  timeout = 1000
): void {
  damage_player(field, i, timeout)
}
