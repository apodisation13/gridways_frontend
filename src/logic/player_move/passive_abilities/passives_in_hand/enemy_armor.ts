import { choice_element } from "@/lib/utils"
import { sound_destroy_enemy } from "@/logic/play_sounds"
import { remove_enemy_armor } from "@/logic/player_move/abilities/ability_enemy_armor"
import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import type { Card, GameObj, Leader } from "@/types"

export function remove_random_enemy_armor(
  card: Card | Leader,
  gameObj: GameObj
): number {
  const armorValueToBeRemoved = card.data?.passive?.value
  if (!armorValueToBeRemoved) return 0

  const { field, enemy_leader } = gameObj

  const allEnemies = get_all_enemies(field, enemy_leader)
  const allEnemiesWithArmor = allEnemies.filter(e => e.data?.armor || 0 > 0)
  const randomEnemy = choice_element(allEnemiesWithArmor)

  if (!randomEnemy) return 0

  remove_enemy_armor(randomEnemy, armorValueToBeRemoved)

  return armorValueToBeRemoved
}

export function destroy_random_enemy_with_armor(
  gameObj: GameObj,
  timeout: number = 1000
): void {
  const { field, enemy_leader } = gameObj

  const allEnemies = get_all_enemies(field, enemy_leader)
  const allEnemiesWithArmor = allEnemies.filter(e => e.data?.armor || 0 > 0)
  const randomEnemy = choice_element(allEnemiesWithArmor)

  if (!randomEnemy) return

  sound_destroy_enemy()
  enemy_takes_damage(
    randomEnemy,
    { data: { damage: randomEnemy.data.hp } },
    gameObj,
    timeout * 0.5
  )
}
