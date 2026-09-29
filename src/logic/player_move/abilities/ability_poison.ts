import { poison_sound } from "@/logic/play_sounds"
import { remove_dead_enemy } from "@/logic/player_move/abilities/enemy_takes_damage"
import type { Enemy, EnemyLeader, GameObj } from "@/types"
import { EnemyStatus } from "@/types"

export function poison_one_enemy(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj,
  fromEffect: boolean = false,
  timeout = 1000
): boolean {
  // добавляем врагу яд - если у него уже есть яд, убиваем его

  // врагу со статусом "завеса" нельзя добавить яд
  if (enemy.data.status === EnemyStatus.Veil) {
    return false
  }

  // если у врага уже есть яд, убиваем его (снимаем ему в кладбище статус)
  if (enemy.data.status === EnemyStatus.Poison) {
    poison_sound()
    if (fromEffect) {
      setTimeout(() => {
        remove_dead_enemy(enemy, gameObj, timeout)
      }, timeout)
    } else remove_dead_enemy(enemy, gameObj, timeout)
    return true
  }

  enemy.data.status = EnemyStatus.Poison
  poison_sound()
  return false
}

export function poison_all_enemies(gameObj: GameObj, timeout = 1000): void {
  const { field, enemy_leader } = gameObj
  field.forEach(enemy => {
    if (enemy) poison_one_enemy(enemy, gameObj, false, timeout)
  })

  if (enemy_leader.data.hp > 0)
    poison_one_enemy(enemy_leader, gameObj, false, timeout)
}
