import { choice_element } from "@/lib/utils"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { CardLocation, Enemy, EnemyLeader, GameObj } from "@/types"

export function deathwish_add_armor_all(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj
): void {
  const deathwishArmorValue = enemy.data.deathwish?.value
  if (!deathwishArmorValue) return

  const { field, enemy_leader } = gameObj
  const pool = get_all_enemies(field, enemy_leader)

  for (const e of pool) {
    e.data.armor = (e.data.armor || 0) + deathwishArmorValue
  }
}

export function deathwish_add_armor_to_all_with_armor_deck(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj
): void {
  const deathwishArmorValue = enemy.data.deathwish?.value
  if (!deathwishArmorValue) return

  const { enemies } = gameObj
  const pool = enemies.filter(e => e.data.armor)

  for (const e of pool) {
    e.data.armor = (e.data.armor || 0) + deathwishArmorValue
  }
}

export function deathwish_add_armor_to_leader(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj
): void {
  const deathwishArmorValue = enemy.data.deathwish?.value
  if (!deathwishArmorValue) return

  const { enemy_leader } = gameObj

  enemy_leader.data.armor = (enemy_leader.data.armor || 0) + deathwishArmorValue
}

export function deathwish_add_armor_to_random_enemy(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj,
  to: CardLocation
): void {
  const deathwishArmorValue = enemy.data.deathwish?.value
  if (!deathwishArmorValue) return

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
  randomEnemy.data.armor = (randomEnemy.data.armor || 0) + deathwishArmorValue
}

export function deathwish_add_armor_to_all_deck(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj
): void {
  const deathwishArmorValue = enemy.data.deathwish?.value
  if (!deathwishArmorValue) return

  const { enemies } = gameObj

  for (const e of enemies) {
    e.data.armor = (e.data.armor || 0) + deathwishArmorValue
  }
}

export function deathwish_add_armor_to_all_grave(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj
): void {
  const deathwishArmorValue = enemy.data.deathwish?.value
  if (!deathwishArmorValue) return

  const { enemies_grave } = gameObj

  for (const e of enemies_grave) {
    e.data.armor = (e.data.armor || 0) + deathwishArmorValue
  }
}
