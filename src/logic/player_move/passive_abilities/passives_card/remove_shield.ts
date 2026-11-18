import { choice_element, copyObj } from "@/lib/utils"
import { trackEnemyDefenceChanges } from "@/logic/achievements/enemyEvents"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import type { Card, GameObj } from "@/types"

export function remove_shield(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { field, enemy_leader } = gameObj

  const all_enemies = get_all_enemies(field, enemy_leader)
  const targets = all_enemies.filter(e => e.data.shield)

  if (targets.length === 0) return

  const target = choice_element(targets)

  if (!target) return

  const before = copyObj(target)
  target.data.shield = false
  trackEnemyDefenceChanges(before, target)

  card.passive_destroying = true
  setTimeout(() => {
    card.passive_destroying = null
  }, timeout * 0.5)
}
