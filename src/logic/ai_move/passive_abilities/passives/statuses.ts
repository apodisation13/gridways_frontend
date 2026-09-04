import { choice_element } from "@/lib/utils"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { EnemyStatus, GameObj } from "@/types"

export function give_random_veil(gameObj: GameObj): void {
  const { field, enemy_leader } = gameObj
  const allEnemies = get_all_enemies(field, enemy_leader)
  if (allEnemies.length === 0) return
  const randomEnemy = choice_element(allEnemies)
  randomEnemy.data.status = EnemyStatus.Veil
}
