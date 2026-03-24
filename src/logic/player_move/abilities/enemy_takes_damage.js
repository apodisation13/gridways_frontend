import { check_win } from "@/logic/player_move/service/check_win"
import { deathwish } from "@/logic/ai_move/ai_deathwish_abilities"
import { EnemyStatus } from "@/logic/models"

export function enemy_takes_damage(enemy, card, gameObj, timeout = 1000) {
  // поставили на 0.5 врагу это поле, чтобы проиграть анимацию урона
  enemy.hp_delta = -card.damage
  setTimeout(() => {
    enemy.hp_delta = null
  }, timeout)

  enemy.hp -= card.damage

  setTimeout(() => {
    if (enemy.hp <= 0) remove_dead_enemy(enemy, gameObj, timeout)
  }, timeout)
}

export function remove_dead_enemy(enemy, gameObj, timeout = 1000) {
  const { field, enemy_leader, enemies, enemies_grave } = gameObj

  if (!enemy.color) {
    enemy_leader.hp = 0
    enemy_leader.status = null
    console.log("умер лидер врагов")
    if (enemy_leader.has_deathwish) deathwish(enemy_leader, gameObj, timeout)
  } else {
    field[field.indexOf(enemy)] = ""
    console.log("враг умер")
    enemy.hp = enemy.base_hp
    if (enemy.status !== EnemyStatus.Doomed) enemies_grave.push(enemy)
    if (enemy.has_deathwish) deathwish(enemy, gameObj, timeout)
  }
  check_win(field, enemies, enemy_leader, enemies_grave)
}
