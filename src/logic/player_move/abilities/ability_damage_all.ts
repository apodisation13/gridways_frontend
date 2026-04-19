import { sound_damage_all } from "@/logic/play_sounds"
import { hit_one_enemy } from "@/logic/player_move/abilities/hit_one_enemy"
import type { Card, Enemy, Leader, GameObj } from "@/types"

export function damage_all(
  field: (Enemy | "")[],
  card: Card | Leader,
  gameObj: GameObj,
  timeout = 1000
): void {
  field.forEach(enemy => {
    if (enemy) hit_one_enemy(enemy, card, gameObj, timeout)
  })
  sound_damage_all()
}
