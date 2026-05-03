import { choice_element } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_heal } from "@/logic/play_sounds"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import type { Enemy, EnemyLeader } from "@/types"

// ВРАГ лечит пассивно в конце хода сам себя на VALUE
export function heal_self(enemy: Enemy, timeout = 1000): void {
  // поставили на 0.5 врагу это поле, чтобы проиграть анимацию урона
  const hp_delta = enemy.data?.passive?.value
  if (!hp_delta) return
  enemy.hp_delta = hp_delta
  setTimeout(() => {
    enemy.hp_delta = null
  }, timeout)
  enemy.data.hp += hp_delta
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}

// враг лечит пассивно в конце хода лидера врагов на VALUE
export function heal_enemy_leader(
  enemy: Enemy,
  enemy_leader: EnemyLeader,
  timeout = 1000
): void {
  const hp_delta = enemy.data?.passive?.value
  if (!hp_delta) return
  enemy_leader.hp_delta = hp_delta
  setTimeout(() => {
    enemy_leader.hp_delta = null
  }, timeout)
  enemy_leader.data.hp += hp_delta
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}

// враг лечит пассивно в конце хода всех врагов на VALUE
export function heal_all(
  enemy: Enemy,
  field: (Enemy | "")[],
  enemy_leader: EnemyLeader | null,
  timeout = 1000
): void {
  let all_enemies = get_all_enemies(field, enemy_leader)

  const hp_delta = enemy.data?.passive?.value
  if (!hp_delta) return
  sound_heal()
  all_enemies.forEach(e => {
    e.hp_delta = hp_delta
    setTimeout(() => {
      e.hp_delta = null
    }, timeout)
    e.data.hp += hp_delta
  })
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}

export function heal_random(
  enemy: Enemy,
  field: (Enemy | "")[],
  enemy_leader: EnemyLeader | null,
  timeout = 1000
): void {
  let all_enemies = get_all_enemies(field, enemy_leader)
  const random_enemy = choice_element(all_enemies)

  const hp_delta = enemy.data?.passive?.value
  if (!hp_delta) return
  random_enemy.hp_delta = hp_delta
  setTimeout(() => {
    random_enemy.hp_delta = null
  }, timeout)
  random_enemy.data.hp += hp_delta
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}

export function heal_self_by_highest_hp(
  enemy: Enemy,
  field: (Enemy | "")[],
  enemy_leader: EnemyLeader | null,
  timeout = 1000
): void {
  let all_enemies = get_all_enemies(field, enemy_leader)
  all_enemies.splice(all_enemies.indexOf(enemy), 1) // EXCLUDE self)
  if (!all_enemies.length) return

  all_enemies.sort((a, b) => b.data.hp - a.data.hp)
  const target = all_enemies[0] as Enemy

  enemy.hp_delta = target.data.hp
  setTimeout(() => {
    enemy.hp_delta = null
  }, timeout)
  enemy.data.hp += target.data.hp
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}

export function heal_row(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  const hp_delta = enemy.data?.passive?.value
  if (!hp_delta) return
  let index = field.indexOf(enemy)
  let min = Math.floor(index / 3) * 3
  let max = min + 3
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
  field.slice(min, max).forEach(e => {
    if (e) {
      e.hp_delta = hp_delta
      setTimeout(() => {
        e.hp_delta = null
      }, timeout)
      e.data.hp += hp_delta
    }
  })
}

export function heal_column(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  const hp_delta = enemy.data?.passive?.value
  if (!hp_delta) return
  let index = field.indexOf(enemy) % 3
  let indexes = [index, index + 3, index + 6, index + 9]
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
  indexes.forEach(i => {
    const e = field[i]
    if (e) {
      e.hp_delta = hp_delta
      setTimeout(() => {
        e.hp_delta = null
      }, timeout)
      e.data.hp += hp_delta
    }
  })
}
