import { check_win } from "@/logic/player_move/service/check_win"
import { deathwish } from "@/logic/ai_move/ai_deathwish_abilities"
import { EnemyStatus } from "@/types"

export function enemy_takes_damage(enemy, card, gameObj, timeout = 1000) {
  // поставили на 0.5 врагу это поле, чтобы проиграть анимацию урона
  enemy.hp_delta = -card.data.damage
  setTimeout(() => {
    enemy.hp_delta = null
  }, timeout)

  enemy.data.hp -= card.data.damage

  setTimeout(() => {
    if (enemy.data.hp <= 0) remove_dead_enemy(enemy, gameObj, timeout)
  }, timeout)
}

export function remove_dead_enemy(enemy, gameObj, timeout = 1000) {
  const { field, enemy_leader, enemies, enemies_grave } = gameObj

  if (!enemy.color) {
    enemy_leader.data.hp = 0
    enemy_leader.data.status = null
    console.log("умер лидер врагов")
    if (enemy_leader.deathwish?.name) deathwish(enemy_leader, gameObj, timeout)
  } else {
    field[field.indexOf(enemy)] = ""
    console.log("враг умер")
    enemy.data.hp = enemy.data.base.base_hp
    if (enemy.data.status !== EnemyStatus.Doomed) enemies_grave.push(enemy)
    if (enemy.deathwish?.name) deathwish(enemy, gameObj, timeout)
  }
  check_win(field, enemies, enemy_leader, enemies_grave)
}
