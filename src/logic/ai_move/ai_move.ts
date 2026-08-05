import { decrementEffectTurns } from "@/logic/ai_move/effects_interaction"
import { down_move } from "@/logic/ai_move/moves/move_down"
import { random_move } from "@/logic/ai_move/moves/move_random"
import { right_move } from "@/logic/ai_move/moves/move_right"
import { stand_still } from "@/logic/ai_move/moves/move_stand_still"
import { check_lose } from "@/logic/ai_move/service/check_lose"
import { set_already_jumped } from "@/logic/ai_move/service/service_for_ai_move"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import store from "@/store"
import type { Enemy, GameObj } from "@/types"
import { EnemyMove } from "@/types"

export function ai_move(gameObj: GameObj, timeout = 1000): void {
  const { field } = gameObj
  store.commit("set_ai_move", true)
  set_already_jumped(field) // установить false параметр enemy.already_jumped

  let enemies = get_all_enemies(field, null)
  enemies.reverse() // чтобы враги начинали снизу!!!!! ))))))

  let i = 0
  let id = setInterval(() => {
    if (i === enemies.length) {
      clearInterval(id)
      decrementEffectTurns(gameObj)
      store.commit("set_ai_move", false)
    } else {
      // ДИСПЕТЧЕР способностей хода врагов
      const idx = field.indexOf(enemies[i] as Enemy)
      const move = (enemies[i] as Enemy).move.name
      if (move === EnemyMove.Stand) {
        stand_still(field, idx, gameObj, timeout)
      } else if (
        move === EnemyMove.Random &&
        !(enemies[i] as Enemy).already_jumped
      ) {
        random_move(field, idx, gameObj, timeout)
      } else if (move === EnemyMove.Down) {
        down_move(field, idx, gameObj, timeout)
      } else if (move === EnemyMove.Right) {
        right_move(field, idx, gameObj, timeout)
      }

      i += 1
    }
  }, timeout)
}

// эта функция срабатывает для лидера врагов только в начале игры 1 раз
export function enemy_leader_ai_move_once(gameObj: GameObj): void {
  const { enemy_leader, deck } = gameObj
  const ela = enemy_leader.ability?.name

  if (!ela) return // есть лидеры у кого абилки нет

  if (ela === EnemyMove.DamageOnce) {
    const value = enemy_leader.data?.value || 0
    store.commit("change_health", -value)
    check_lose()
  } else if (ela === EnemyMove.DecreaseAllPlayerDamage) {
    const value = enemy_leader.data?.value || 0
    deck.forEach(card => {
      card.data.damage -= value
      if (card.data.damage < 0) card.data.damage = 0
    })
  }
}
