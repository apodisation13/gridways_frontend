import { sound_damage_column } from "@/logic/play_sounds"
import { hit_one_enemy } from "@/logic/player_move/abilities/hit_one_enemy"
import type { Card, Enemy, EnemyLeader, GameObj, Leader } from "@/types"

export function damage_column(
  enemy: Enemy | EnemyLeader,
  card: Card | Leader,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { field } = gameObj
  let index = (field as Enemy[]).indexOf(enemy as Enemy) % 3
  let indexes = [index, index + 3, index + 6, index + 9]

  sound_damage_column()
  indexes.forEach(i => {
    if (field[i]) hit_one_enemy(field[i] as Enemy, card, gameObj, timeout)
  })
}
