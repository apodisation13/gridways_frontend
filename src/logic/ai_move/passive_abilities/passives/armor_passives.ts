import { choice_element } from "@/lib/utils"
import { remove_dead_enemy } from "@/logic/player_move/abilities/enemy_takes_damage"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { CardLocation, Enemy, EnemyLeader, GameObj } from "@/types"

export function add_armor_self(enemy: Enemy | EnemyLeader): void {
  const passiveArmorValue = enemy.data.passive?.value
  if (!passiveArmorValue) return
  enemy.data.armor = (enemy.data.armor || 0) + passiveArmorValue
}

export function add_armor_to_random_enemy(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj,
  to: CardLocation
): void {
  const passiveArmorValue = enemy.data.passive?.value
  if (!passiveArmorValue) return

  const { field, enemy_leader, enemies, enemies_grave } = gameObj

  let pool: (Enemy | EnemyLeader)[] = []
  if (to === "field") {
    pool = get_all_enemies(field, enemy_leader)
    if (pool.length === 0) return
  } else if (to === "deck") {
    pool = enemies
  } else if (to === "grave") {
    pool = enemies_grave
  }

  if (pool.length === 0) return

  const randomEnemy: Enemy | EnemyLeader = choice_element(pool)
  randomEnemy.data.armor = (randomEnemy.data.armor || 0) + passiveArmorValue
}

export function heal_self_by_armor(enemy: Enemy | EnemyLeader): void {
  const enemyArmor = enemy.data?.armor
  if (!enemyArmor) return
  enemy.data.hp += enemyArmor
}

export function transform_armor_to_health(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj,
  timeout: number = 1000
): void {
  const enemyArmor = enemy.data?.armor
  if (!enemyArmor) {
    remove_dead_enemy(enemy, gameObj, timeout * 0.75)
    return
  }
  enemy.data.hp = enemyArmor
}

export function add_armor_all(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj
): void {
  const passiveArmorValue = enemy.data.passive?.value
  if (!passiveArmorValue) return

  const { field, enemy_leader } = gameObj
  const pool = get_all_enemies(field, enemy_leader)

  for (const e of pool) {
    e.data.armor = (e.data.armor || 0) + passiveArmorValue
  }
}

export function add_armor_to_leader(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj
): void {
  const passiveArmorValue = enemy.data.passive?.value
  if (!passiveArmorValue) return

  const { enemy_leader } = gameObj

  enemy_leader.data.armor = (enemy_leader.data.armor || 0) + passiveArmorValue
}

export function lose_armor(enemy: Enemy | EnemyLeader): void {
  const passiveArmorValue = enemy.data.passive?.value
  if (!passiveArmorValue) return
  if (enemy.data.armor === 0) return
  enemy.data.armor = (enemy.data.armor || 0) - passiveArmorValue
}
