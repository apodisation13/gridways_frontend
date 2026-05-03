import { sound_damage_one } from "@/logic/play_sounds"
import { hit_one_enemy } from "@/logic/player_move/abilities/hit_one_enemy"
import type { Card, Enemy, EnemyLeader, GameObj, Leader } from "@/types"

export function damage_one(
  enemy: Enemy | EnemyLeader,
  card: Card | Leader | { data: { damage: number } },
  gameObj: GameObj,
  timeout = 1000
): void {
  // нанесли урон и-тому элементу от конкретной карты
  hit_one_enemy(enemy, card, gameObj, timeout)
  sound_damage_one()
}
