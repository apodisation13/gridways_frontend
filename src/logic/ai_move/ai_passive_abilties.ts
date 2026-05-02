import { deck_passives } from "@/logic/ai_move/passive_abilities/passives_deck"
import { field_passives } from "@/logic/ai_move/passive_abilities/passives_field"
import { grave_passives } from "@/logic/ai_move/passive_abilities/passives_grave"
import store from "@/store"
import type { GameObj } from "@/types"

export function enemy_passive_abilities_end_turn(
  gameObj: GameObj,
  timeout = 1000
): void {
  store.commit("set_epa_end_turn", true)

  const { field, enemies_grave, enemies, enemy_leader } = gameObj

  let pool: any[] = field.filter(
    e => e && (e as any).data.passive?.has_passive_in_field
  )
  // если у лидера врагов есть пассивка и он жив, его добавляем тоже
  if (enemy_leader.passive_ability?.name && enemy_leader.data.hp > 0)
    pool.push(enemy_leader)
  pool = pool.concat(enemies.filter(e => e.data.passive?.has_passive_in_deck)) // собрали пассивные карты из колоды
  pool = pool.concat(
    enemies_grave.filter(e => e.data.passive?.has_passive_in_grave)
  ) // собрали пассивные карты из сброса

  let i = 0
  let passive_time = setInterval(() => {
    if (i === pool.length) {
      clearInterval(passive_time)
      store.commit("set_epa_end_turn", false)
    } else {
      // ДИСПЕТЧЕР пассивных абилок врагов
      console.log("Выполняем пассивку номер", i)
      // пассивка врагов на поле или пассивка лидера врагов (у него нет поля color)
      if (pool[i].data.passive?.has_passive_in_field || !pool[i].color)
        field_passives(pool[i], gameObj, timeout)
      else if (pool[i].data.passive?.has_passive_in_deck)
        deck_passives(pool[i], gameObj, timeout)
      else if (pool[i].data.passive?.has_passive_in_grave)
        grave_passives(pool[i], gameObj, timeout)
      i += 1
    }
  }, timeout)
}
