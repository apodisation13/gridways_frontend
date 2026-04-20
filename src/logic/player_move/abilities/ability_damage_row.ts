import { sound_damage_row } from "@/logic/play_sounds"
import { hit_one_enemy } from "@/logic/player_move/abilities/hit_one_enemy"
import type { Card, Enemy, EnemyLeader, Leader, GameObj } from "@/types"

export function damage_row(
  enemy: Enemy | EnemyLeader,
  card: Card | Leader,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { field } = gameObj
  let index = (field as Enemy[]).indexOf(enemy as Enemy)
  let min = Math.floor(index / 3) * 3
  let max = min + 3

  sound_damage_row()
  field.slice(min, max).forEach(enemy => {
    if (enemy) hit_one_enemy(enemy, card, gameObj, timeout)
  })
}
