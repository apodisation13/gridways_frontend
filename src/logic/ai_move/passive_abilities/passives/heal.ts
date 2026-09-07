import { choice_element } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_enemy_heal } from "@/logic/play_sounds"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import type { Enemy, EnemyLeader } from "@/types"

export function applyHeal(
  target: Enemy | EnemyLeader,
  amount: number,
  timeout: number
): void {
  target.hp_delta = amount
  setTimeout(() => {
    target.hp_delta = null
  }, timeout)
  target.data.hp += amount
}

// ВРАГ лечит пассивно в конце хода сам себя на VALUE
export function heal_self(enemy: Enemy, timeout = 1000): void {
  const hp_delta = enemy.data?.passive?.value
  if (!hp_delta) return
  applyHeal(enemy, hp_delta, timeout)
  timeoutAnimationFlag(enemy, "healing", sound_enemy_heal, timeout * 0.5)
}

// враг лечит пассивно в конце хода лидера врагов на VALUE
export function heal_enemy_leader(
  enemy: Enemy,
  enemy_leader: EnemyLeader,
  timeout = 1000
): void {
  const hp_delta = enemy.data?.passive?.value
  if (!hp_delta) return
  applyHeal(enemy_leader, hp_delta, timeout)
  timeoutAnimationFlag(enemy, "healing", sound_enemy_heal, timeout * 0.5)
}

// враг лечит пассивно в конце хода всех врагов на VALUE
export function heal_all(
  enemy: Enemy,
  field: (Enemy | "")[],
  enemy_leader: EnemyLeader | null,
  timeout = 1000
): void {
  const hp_delta = enemy.data?.passive?.value
  if (!hp_delta) return
  const all_enemies = get_all_enemies(field, enemy_leader)
  all_enemies.forEach(e => applyHeal(e, hp_delta, timeout))
  timeoutAnimationFlag(enemy, "healing", sound_enemy_heal, timeout * 0.5)
}

export function heal_random(
  enemy: Enemy,
  field: (Enemy | "")[],
  enemy_leader: EnemyLeader | null,
  timeout = 1000
): void {
  const hp_delta = enemy.data?.passive?.value
  if (!hp_delta) return
  const random_enemy = choice_element(get_all_enemies(field, enemy_leader))
  if (!random_enemy) return
  applyHeal(random_enemy, hp_delta, timeout)
  timeoutAnimationFlag(enemy, "healing", sound_enemy_heal, timeout * 0.5)
}

export function heal_self_by_highest_hp(
  enemy: Enemy,
  field: (Enemy | "")[],
  enemy_leader: EnemyLeader | null,
  timeout = 1000
): void {
  const all_enemies = get_all_enemies(field, enemy_leader)
  all_enemies.splice(all_enemies.indexOf(enemy), 1) // EXCLUDE self
  if (!all_enemies.length) return

  all_enemies.sort((a, b) => b.data.hp - a.data.hp)
  const target = all_enemies[0] as Enemy
  applyHeal(enemy, target.data.hp, timeout)
  timeoutAnimationFlag(enemy, "healing", sound_enemy_heal, timeout * 0.5)
}

export function heal_row(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  const hp_delta = enemy.data?.passive?.value
  if (!hp_delta) return
  const index = field.indexOf(enemy)
  const min = Math.floor(index / 3) * 3
  timeoutAnimationFlag(enemy, "healing", sound_enemy_heal, timeout * 0.5)
  field.slice(min, min + 3).forEach(e => {
    if (e) applyHeal(e, hp_delta, timeout)
  })
}

export function heal_column(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  const hp_delta = enemy.data?.passive?.value
  if (!hp_delta) return
  const col = field.indexOf(enemy) % 3
  timeoutAnimationFlag(enemy, "healing", sound_enemy_heal, timeout * 0.5)
  ;[col, col + 3, col + 6, col + 9].forEach(i => {
    const e = field[i]
    if (e) applyHeal(e, hp_delta, timeout)
  })
}
