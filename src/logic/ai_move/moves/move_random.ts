import { applyEffectAtCell } from "@/logic/ai_move/effects_interaction"
import { damage_player } from "@/logic/ai_move/moves/damage"
import { sound_enemy_move_down } from "@/logic/play_sounds"
import type { Enemy, GameObj } from "@/types"

export function random_move(
  field: (Enemy | "")[],
  i: number,
  gameObj: GameObj,
  timeout = 1000
): void {
  const random = Math.floor(Math.random() * field.length)
  if (field[random]) {
    console.log(`враг c ${i}, хотел на ${random}, а там враг`)
    const killed = applyEffectAtCell(i, gameObj, timeout)
    if (!killed) damage_player(field, i, timeout)
  } else {
    console.log(`враг c ${i}, хотел на ${random}, и прыгнул`)
    ;(field[i] as Enemy).already_jumped = true
    field[random] = field[i]
    field[i] = ""
    sound_enemy_move_down()
    applyEffectAtCell(random, gameObj, timeout)
  }
}
