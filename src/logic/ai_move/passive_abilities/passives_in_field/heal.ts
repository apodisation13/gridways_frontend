import { sound_heal } from "@/logic/play_sounds"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { choice_element } from "@/lib/utils"
import type { Enemy, EnemyLeader } from "@/types"

// ВРАГ лечит пассивно в конце хода сам себя на VALUE
export function heal_self(enemy: Enemy, timeout = 1000): void {
  // поставили на 0.5 врагу это поле, чтобы проиграть анимацию урона
  enemy.hp_delta = enemy.data.passive.value
  setTimeout(() => {
    enemy.hp_delta = null
  }, timeout)
  enemy.data.hp += enemy.data.passive.value
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}

// враг лечит пассивно в конце хода лидера врагов на VALUE
export function heal_enemy_leader(
  enemy: Enemy,
  enemy_leader: EnemyLeader,
  timeout = 1000
): void {
  enemy_leader.hp_delta = enemy.data.passive.value
  setTimeout(() => {
    enemy_leader.hp_delta = null
  }, timeout)
  enemy_leader.data.hp += enemy.data.passive.value
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

  sound_heal()
  all_enemies.forEach(e => {
    e.hp_delta = enemy.data.passive.value
    setTimeout(() => {
      e.hp_delta = null
    }, timeout)
    e.data.hp += enemy.data.passive.value
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

  random_enemy.hp_delta = enemy.data.passive.value
  setTimeout(() => {
    random_enemy.hp_delta = null
  }, timeout)
  random_enemy.data.hp += enemy.data.passive.value
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

  enemy.hp_delta = target.data.passive.value
  setTimeout(() => {
    enemy.hp_delta = null
  }, timeout)
  enemy.data.hp += target.data.passive.value
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}

export function heal_row(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  let index = field.indexOf(enemy)
  let min = Math.floor(index / 3) * 3
  let max = min + 3
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
  field.slice(min, max).forEach(e => {
    if (e) {
      e.hp_delta = enemy.data.passive.value
      setTimeout(() => {
        e.hp_delta = null
      }, timeout)
      e.data.hp += enemy.data.passive.value
    }
  })
}

export function heal_column(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  let index = field.indexOf(enemy) % 3
  let indexes = [index, index + 3, index + 6, index + 9]
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
  indexes.forEach(i => {
    const e = field[i]
    if (e) {
      e.hp_delta = enemy.data.passive.value
      setTimeout(() => {
        e.hp_delta = null
      }, timeout)
      e.data.hp += enemy.data.passive.value
    }
  })
}
