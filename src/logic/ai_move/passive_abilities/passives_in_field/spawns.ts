import { choice, choice_element, copyObj } from "@/lib/utils"
import {
  create_token,
  create_token_with_passive,
} from "@/logic/ai_move/service/service_for_ai_move"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_appear_new_enemy } from "@/logic/play_sounds"
import { get_empty_field_indexes } from "@/logic/player_move/service/service_for_player_move"
import store from "@/store"
import type { Enemy, GameObj } from "@/types"

// создает свою копию без пассивной способности в колоде врагов
export function spawn_self_at_deck(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { enemies } = gameObj
  const self = copyObj(enemy)
  self.passive_ability = null
  timeoutAnimationFlag(enemies[0], "trigger_deck_passive", null, timeout * 0.5)
  enemies.push(copyObj(self))
}

// создает в колоде врагов value количество токенов этого врага, снимает у тех пассивные способности
export function spawn_tokens_in_deck(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  const spawn_tokens_number = enemy.data?.passive?.value
  if (!spawn_tokens_number) return
  const { enemies } = gameObj
  const token = create_token(enemy)
  for (let i = 0; i < spawn_tokens_number; i++) {
    enemies.push(copyObj(token))
  }
  timeoutAnimationFlag(enemies[0], "trigger_deck_passive", null, timeout * 0.5)
}

// создаёт токен этого врага, снимает у того пассивную способность и помещает его на случайную свободную клетку
export function spawn_token(
  enemy: Enemy,
  field: (Enemy | "")[],
  timeout = 1000
): void {
  const token = create_token(enemy)
  const emptyField = get_empty_field_indexes(field)
  const randomIndex = choice(emptyField)
  field[emptyField[randomIndex]] = copyObj(token)
  sound_appear_new_enemy()
  timeoutAnimationFlag(enemy, "spawning", null, timeout * 0.5)
}

// создает токен РАНДОМНОЙ КАРТЫ ЭТОЙ ФРАКЦИИ и помещает его на случайную свободную клетку
export function spawn_random_token(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { field, enemy_leader } = gameObj
  const random_enemy = choice_element(
    (store.getters.all_enemies as Enemy[]).filter(
      e => e.faction === enemy_leader.faction
    )
  )
  const token = create_token_with_passive(random_enemy)
  const emptyField = get_empty_field_indexes(field)
  const randomIndex = choice(emptyField)
  field[emptyField[randomIndex]] = copyObj(token)
  sound_appear_new_enemy()
  timeoutAnimationFlag(enemy, "spawning", null, timeout * 0.5)
}

// создает в случайной свободной клетке на поле случайного врага, если faction тру, то этой фракции, или любого
export function spawn_faction_unit(
  enemy: Enemy,
  gameObj: GameObj,
  faction = true,
  timeout = 1000
): void {
  const { field, enemy_leader } = gameObj

  let random_enemy
  if (faction) {
    random_enemy = choice_element(
      (store.getters.all_enemies as Enemy[]).filter(
        e => e.faction === enemy_leader.faction
      )
    )
  } else {
    random_enemy = choice_element(store.getters.all_enemies as Enemy[])
  }

  const emptyField = get_empty_field_indexes(field)
  const randomIndex = choice(emptyField)
  field[emptyField[randomIndex]] = copyObj(random_enemy)
  sound_appear_new_enemy()
  timeoutAnimationFlag(enemy, "spawning", null, timeout * 0.5)
}

// добавляет в колоду врагов случайного врага из этой фракции!
export function spawn_faction_unit_at_deck(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { enemy_leader, enemies } = gameObj
  const random_enemy = choice_element(
    (store.getters.all_enemies as Enemy[]).filter(
      e => e.faction === enemy_leader.faction
    )
  )
  enemies.push(copyObj(random_enemy))
  timeoutAnimationFlag(enemies[0], "trigger_deck_passive", null, timeout * 0.5)
  timeoutAnimationFlag(enemy, "spawning", null, timeout * 0.5)
}
