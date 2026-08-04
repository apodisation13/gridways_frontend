import { choice_pop } from "@/lib/utils"
import { sound_destroy_enemy } from "@/logic/play_sounds"
import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import type { Card, GameObj } from "@/types"

export function passive_destroy_with_status(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { field, enemy_leader } = gameObj

  const all_enemies = get_all_enemies(field, enemy_leader)
  const targets = all_enemies.filter(e => e.data?.status)

  if (targets.length === 0) return

  const target = choice_pop(targets)

  if (!target) return

  sound_destroy_enemy()
  enemy_takes_damage(
    target,
    { data: { damage: target.data.hp } },
    gameObj,
    timeout * 0.5
  )
  card.passive_destroying = true
  setTimeout(() => {
    card.passive_destroying = null
  }, timeout * 0.5)
}
