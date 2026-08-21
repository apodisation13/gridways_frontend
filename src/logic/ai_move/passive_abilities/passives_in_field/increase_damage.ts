import { choice_element } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_passive_increase_damage } from "@/logic/play_sounds"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import type { Enemy } from "@/types"

export function applyIncrDmg(
  target: Enemy,
  amount: number,
  timeout: number
): void {
  target.dmg_delta = amount
  setTimeout(() => {
    target.dmg_delta = null
  }, timeout * 0.5)
  target.data.damage += amount
}

export function incr_self_dmg(enemy: Enemy, timeout = 1000): void {
  const dmg_delta = enemy.data.passive.value
  if (!dmg_delta) return
  timeoutAnimationFlag(
    enemy,
    "incr_dmg",
    sound_passive_increase_damage,
    timeout * 0.5
  )
  applyIncrDmg(enemy, dmg_delta, timeout)
}

export function incr_random_dmg(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  const dmg_delta = enemy.data.passive.value
  if (!dmg_delta) return
  const random_enemy = choice_element(
    get_all_enemies(field, undefined)
  ) as Enemy
  if (!random_enemy) return
  timeoutAnimationFlag(
    enemy,
    "incr_dmg",
    sound_passive_increase_damage,
    timeout * 0.5
  )
  applyIncrDmg(random_enemy, dmg_delta, timeout)
}

export function incr_dmg_row(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  const dmg_delta = enemy.data.passive.value
  if (!dmg_delta) return
  const index = field.indexOf(enemy)
  const min = Math.floor(index / 3) * 3
  sound_passive_increase_damage()
  timeoutAnimationFlag(enemy, "incr_dmg", null, timeout * 0.5)
  field.slice(min, min + 3).forEach(e => {
    if (e) applyIncrDmg(e, dmg_delta, timeout)
  })
}

export function incr_dmg_column(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  const dmg_delta = enemy.data.passive.value
  if (!dmg_delta) return
  const col = field.indexOf(enemy) % 3
  sound_passive_increase_damage()
  timeoutAnimationFlag(enemy, "incr_dmg", null, timeout * 0.5)
  ;[col, col + 3, col + 6, col + 9].forEach(i => {
    const e = field[i]
    if (e) applyIncrDmg(e, dmg_delta, timeout)
  })
}
