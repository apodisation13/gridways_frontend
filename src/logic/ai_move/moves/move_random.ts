import { damage_player } from "@/logic/ai_move/moves/damage"
import { sound_enemy_move_down } from "@/logic/play_sounds"
import type { Enemy } from "@/types"

export function random_move(
  field: (Enemy | "")[],
  i: number,
  timeout = 1000
): void {
  let random = Math.floor(Math.random() * field.length)
  if (field[random]) {
    console.log(`враг c ${i}, хотел на ${random}, а там враг`)
    damage_player(field, i, timeout)
  } else {
    console.log(`враг c ${i}, хотел на ${random}, и прыгнул`)
    ;(field[i] as Enemy).already_jumped = true // он уже прыгнул, чтобы потом не прыгать ещё раз
    field[random] = field[i] // враг прыгнул рандом клетку
    field[i] = ""
    sound_enemy_move_down()
  }
}
