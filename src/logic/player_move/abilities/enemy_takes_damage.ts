import { deathwish } from "@/logic/ai_move/ai_deathwish_abilities"
import { check_win } from "@/logic/player_move/service/check_win"
import type { Enemy, EnemyLeader, GameObj } from "@/types"
import { EnemyStatus } from "@/types"

export function enemy_takes_damage(
  enemy: Enemy | EnemyLeader,
  card: { data: { damage: number } },
  gameObj: GameObj,
  timeout = 1000
): void {
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

export function remove_dead_enemy(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { field, enemy_leader, enemies, enemies_grave } = gameObj

  if (!(enemy as Enemy).color) {
    enemy_leader.data.hp = 0
    enemy_leader.data.status = null
    console.log("умер лидер врагов")
    if (enemy_leader.deathwish?.name) {
      deathwish(enemy_leader, null, gameObj, timeout)
    }
  } else {
    const enemyIndex = field.indexOf(enemy as Enemy)
    field[enemyIndex] = ""
    console.log("враг умер")
    ;(enemy as Enemy).data.hp = (enemy as Enemy).data.base.base_hp
    if ((enemy as Enemy).data.status !== EnemyStatus.Doomed)
      enemies_grave.push(enemy as Enemy)
    if ((enemy as Enemy).deathwish?.name)
      deathwish(enemy as Enemy, enemyIndex, gameObj, timeout)
  }
  check_win(field, enemies, enemy_leader, enemies_grave)
}
