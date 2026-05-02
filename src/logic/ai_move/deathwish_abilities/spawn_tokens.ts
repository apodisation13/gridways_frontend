import { copyObj } from "@/lib/utils"
import { get_default_enemy } from "@/logic/ai_move/service/service_for_ai_move"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_deathwish } from "@/logic/play_sounds"
import { get_empty_field_indexes } from "@/logic/player_move/service/service_for_player_move"
import type { Enemy, GameObj } from "@/types"

// создает в каждой свободной клетке токен данного врага без deathwish
export function spawn_tokens(enemy: Enemy, gameObj: GameObj): void {
  const defaultEnemy = get_default_enemy(enemy)
  if (!defaultEnemy) return
  defaultEnemy.data.hp = 1
  defaultEnemy.data.damage = 1

  sound_deathwish()

  const { field } = gameObj

  const emptyField = get_empty_field_indexes(field)
  emptyField.forEach(index => {
    field[index] = copyObj(defaultEnemy)
  })
}

export function spawn_tokens_at_deck(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  const defaultEnemy = get_default_enemy(enemy)
  if (!defaultEnemy) return
  defaultEnemy.data.hp = 1
  defaultEnemy.data.damage = 1
  defaultEnemy.deathwish = null

  sound_deathwish()

  const { enemies } = gameObj

  const value_number = enemy.data?.deathwish?.value || 1
  for (let i = 0; i < value_number; i++) {
    enemies.push(copyObj(defaultEnemy))
  }
  timeoutAnimationFlag(enemies[0], "trigger_deck_passive", null, timeout * 0.5)
}
