import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_hit_armor_enemy, sound_hit_shield } from "@/logic/play_sounds"
import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"
import type { Card, Enemy, EnemyLeader, GameObj, Leader } from "@/types"

export function hit_one_enemy(
  enemy: Enemy | EnemyLeader,
  card: Card | Leader | { data: { damage: number } },
  gameObj: GameObj,
  timeout = 1000
): void {
  timeoutAnimationFlag(card, "damages_enemy", null, timeout * 0.5)

  const e = enemy as Enemy

  if (e.data.shield) {
    e.data.shield = false
    sound_hit_shield()
    ;(card as any).damages_enemy = false
    return
  }

  if (e.data.armor !== undefined && e.data.armor > 0) {
    e.data.armor -= 1
    sound_hit_armor_enemy()
    ;(card as any).damages_enemy = false
    return
  }

  enemy_takes_damage(
    enemy,
    card as { data: { damage: number } },
    gameObj,
    timeout
  )
}
