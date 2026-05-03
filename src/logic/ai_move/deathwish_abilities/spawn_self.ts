import { choice, copyObj } from "@/lib/utils"
import { get_default_enemy } from "@/logic/ai_move/service/service_for_ai_move"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_deathwish } from "@/logic/play_sounds"
import { get_empty_field_indexes } from "@/logic/player_move/service/service_for_player_move"
import type { Enemy, GameObj } from "@/types"

// создает на поле deathwish_value копий убитого врага без deathwish в случайных свободных клетках
export function spawn_self(enemy: Enemy, gameObj: GameObj): void {
  const defaultEnemy = get_default_enemy(enemy)
  if (!defaultEnemy) return

  sound_deathwish()
  const { field } = gameObj

  const spawn_self_count = enemy.data?.deathwish?.value
  if (!spawn_self_count) return

  for (let i = 0; i < spawn_self_count; i++) {
    const emptyField = get_empty_field_indexes(field)
    const randomIndex = choice(emptyField)
    field[emptyField[randomIndex]] = copyObj(defaultEnemy)
  }
}

// создает в колоде врагов deathwish_value копий убитого врага без deathwish
export function spawn_self_at_deck(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  const defaultEnemy = get_default_enemy(enemy)
  if (!defaultEnemy) return

  sound_deathwish()
  const { enemies } = gameObj

  const value_number = enemy.data?.deathwish?.value || 1
  for (let i = 0; i < value_number; i++) {
    enemies.push(copyObj(defaultEnemy))
  }
  timeoutAnimationFlag(enemies[0], "trigger_deck_passive", null, timeout * 0.5)
}

// создает в сбросе врагов deathwish_value копий убитого врага без deathwish
export function spawn_self_at_grave(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  const defaultEnemy = get_default_enemy(enemy)
  if (!defaultEnemy) return

  sound_deathwish()
  const { enemies_grave } = gameObj

  const value_number = enemy.data?.deathwish?.value || 1
  for (let i = 0; i < value_number; i++) {
    enemies_grave.push(copyObj(defaultEnemy))
  }
  timeoutAnimationFlag(
    enemies_grave[0],
    "trigger_grave_passive",
    null,
    timeout * 0.5
  )
}
