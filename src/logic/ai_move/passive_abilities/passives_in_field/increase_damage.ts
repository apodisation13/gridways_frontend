import { choice_element } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_passive_increase_damage } from "@/logic/play_sounds"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import type { Enemy } from "@/types"

export function incr_self_dmg(enemy: Enemy, timeout = 1000): void {
  const dmg_delta = enemy.data.passive.value
  if (!dmg_delta) return
  timeoutAnimationFlag(
    enemy,
    "incr_dmg",
    sound_passive_increase_damage,
    timeout * 0.5
  )
  enemy.dmg_delta = dmg_delta
  setTimeout(() => {
    enemy.dmg_delta = null
  }, timeout * 0.5)
  enemy.data.damage += dmg_delta
}

export function incr_random_dmg(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  const dmg_delta = enemy.data.passive.value
  if (!dmg_delta) return
  let all_enemies = get_all_enemies(field, undefined)
  const random_enemy = choice_element(all_enemies) as Enemy
  if (!random_enemy) return

  timeoutAnimationFlag(
    enemy,
    "incr_dmg",
    sound_passive_increase_damage,
    timeout * 0.5
  )
  random_enemy.dmg_delta = dmg_delta
  setTimeout(() => {
    random_enemy.dmg_delta = null
  }, timeout * 0.5)
  random_enemy.data.damage += dmg_delta
}

export function incr_dmg_row(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  const dmg_delta = enemy.data.passive.value
  if (!dmg_delta) return
  let index = field.indexOf(enemy)
  let min = Math.floor(index / 3) * 3
  let max = min + 3
  sound_passive_increase_damage()
  timeoutAnimationFlag(enemy, "incr_dmg", null, timeout * 0.5)
  field.slice(min, max).forEach(e => {
    if (e) {
      e.dmg_delta = dmg_delta
      setTimeout(() => {
        e.dmg_delta = null
      }, timeout * 0.5)
      e.data.damage += dmg_delta
    }
  })
}

export function incr_dmg_column(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  const dmg_delta = enemy.data.passive.value
  if (!dmg_delta) return
  let index = field.indexOf(enemy) % 3
  let indexes = [index, index + 3, index + 6, index + 9]
  sound_passive_increase_damage()
  timeoutAnimationFlag(enemy, "incr_dmg", null, timeout * 0.5)
  indexes.forEach(i => {
    const e = field[i]
    if (e) {
      e.dmg_delta = dmg_delta
      setTimeout(() => {
        e.dmg_delta = null
      }, timeout * 0.5)
      e.data.damage += dmg_delta
    }
  })
}
