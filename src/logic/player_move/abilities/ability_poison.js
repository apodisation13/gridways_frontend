import { remove_dead_enemy } from "@/logic/player_move/abilities/enemy_takes_damage"
import { EnemyStatus } from "@/logic/models"

function poison_one_enemy(enemy, gameObj, timeout = 1000) {
  // добавляем врагу яд - если у него уже есть яд, убиваем его

  // врагу со статусом "завеса" нельзя добавить яд
  if (enemy.status === EnemyStatus.Veil) {
    return
  }

  // если у врага уже есть яд, убиваем его (снимаем ему в кладбище статус)
  if (enemy.status === EnemyStatus.Poison) {
    enemy.status = null
    remove_dead_enemy(enemy, gameObj, timeout)
    return
  }

  enemy.status = EnemyStatus.Poison
}

function poison_all_enemies(gameObj, timeout = 1000) {
  const { field, enemy_leader } = gameObj
  field.forEach(enemy => {
    if (enemy) poison_one_enemy(enemy, gameObj, timeout)
  })

  if (enemy_leader.data.hp > 0) poison_one_enemy(enemy_leader, gameObj, timeout)
}

export { poison_one_enemy, poison_all_enemies }
