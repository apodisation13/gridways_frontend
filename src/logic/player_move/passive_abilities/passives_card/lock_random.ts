import { lock_enemy } from "@/logic/player_move/abilities/ability_lock"
import { get_random_enemy } from "@/logic/player_move/service/service_for_player_move"
import { Card, GameObj } from "@/types"

export function lock_random(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { field, enemy_leader } = gameObj
  let target = get_random_enemy(field, enemy_leader) // взяли всех врагов, из них взяли одного

  if (!target) return // если щас нет врагов на поле и нет живого лидера врагов, выходим

  lock_enemy(target)
  card.passive_locking = true
  setTimeout(() => {
    card.passive_locking = null
  }, timeout * 0.5)
}
