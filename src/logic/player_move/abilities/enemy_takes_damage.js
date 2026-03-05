import { check_win } from "@/logic/player_move/service/check_win"
import { deathwish } from "@/logic/ai_move/ai_deathwish_abilities"

export function enemy_takes_damage(enemy, card, gameObj, timeout = 1000) {
  const { field, enemy_leader, enemies, enemies_grave } = gameObj

  // поставили на 0.5 врагу это поле, чтобы проиграть анимацию урона
  enemy.hp_delta = -card.damage
  setTimeout(() => {
    enemy.hp_delta = null
  }, timeout)

  enemy.hp -= card.damage

  setTimeout(() => {
    if (enemy.hp <= 0) {
      // у лидера врагов нет поля color!
      if (!enemy.color) {
        enemy_leader.hp = 0
        console.log("умер лидер врагов")
        if (enemy_leader.has_deathwish)
          deathwish(enemy_leader, gameObj, timeout)
      } else {
        field[field.indexOf(enemy)] = ""
        console.log("враг умер")
        enemy.hp = enemy.base_hp
        enemies_grave.push(enemy)
        if (enemy.has_deathwish) deathwish(enemy, gameObj, timeout)
      }
    }

    check_win(field, enemies, enemy_leader, enemies_grave)
  }, timeout)
}
