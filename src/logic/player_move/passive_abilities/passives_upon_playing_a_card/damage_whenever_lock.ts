import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_damage_one } from "@/logic/play_sounds"
import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"
import type { Card, Enemy, EnemyLeader, GameObj } from "@/types"

export function damage_whenever_lock(
  card: Card,
  enemy_before: Enemy | EnemyLeader,
  enemy_after: Enemy | EnemyLeader,
  gameObj: GameObj,
  timeout = 1000
): void {
  const passive_value = card.data?.passive?.value
  if (!passive_value) return

  if (!enemy_before.locked && enemy_after.locked) {
    console.log("ВРАГ НЕ БЫЛ ЗАЛОЧЕН, А ТЕПЕРЬ ЗАЛОЧЕН!")
    enemy_takes_damage(
      enemy_after,
      { data: { damage: passive_value } },
      gameObj,
      timeout * 0.5
    )
    timeoutAnimationFlag(
      card,
      "p_damages_enemy",
      sound_damage_one,
      timeout * 0.5
    )
  }
}
