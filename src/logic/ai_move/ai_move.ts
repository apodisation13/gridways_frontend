import { decrementEffectTurns } from "@/logic/ai_move/effects_interaction"
import { move_column } from "@/logic/ai_move/moves/move_column"
import { down_move } from "@/logic/ai_move/moves/move_down"
import { random_move } from "@/logic/ai_move/moves/move_random"
import { right_move } from "@/logic/ai_move/moves/move_right"
import { move_row } from "@/logic/ai_move/moves/move_row"
import { stand_still } from "@/logic/ai_move/moves/move_stand_still"
import { set_already_jumped } from "@/logic/ai_move/service/service_for_ai_move"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import store from "@/store"
import { Enemy, GameObj } from "@/types"
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
      } else if (move === EnemyMove.Row) {
        move_row(field, idx, gameObj, timeout)
      } else if (move === EnemyMove.Column) {
        move_column(field, idx, gameObj, timeout)
      }

      i += 1
    }
  }, timeout)
}
