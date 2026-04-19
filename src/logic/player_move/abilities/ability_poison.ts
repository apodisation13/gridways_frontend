import { remove_dead_enemy } from "@/logic/player_move/abilities/enemy_takes_damage"
import { EnemyStatus } from "@/types"
import type { Enemy, EnemyLeader, GameObj } from "@/types"

export function poison_one_enemy(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj,
  timeout = 1000
): void {
  // добавляем врагу яд - если у него уже есть яд, убиваем его

  // врагу со статусом "завеса" нельзя добавить яд
  if (enemy.data.status === EnemyStatus.Veil) {
    return
  }

  // если у врага уже есть яд, убиваем его (снимаем ему в кладбище статус)
  if (enemy.data.status === EnemyStatus.Poison) {
    enemy.data.status = null
    remove_dead_enemy(enemy, gameObj, timeout)
    return
  }

  enemy.data.status = EnemyStatus.Poison
}

export function poison_all_enemies(gameObj: GameObj, timeout = 1000): void {
  const { field, enemy_leader } = gameObj
  field.forEach(enemy => {
    if (enemy) poison_one_enemy(enemy, gameObj, timeout)
  })

  if (enemy_leader.data.hp > 0) poison_one_enemy(enemy_leader, gameObj, timeout)
}
