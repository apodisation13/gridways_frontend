import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"
import { enemy_as_card } from "@/logic/player_move/service/service_for_player_move"
import store from "@/store"
import { Card, Enemy, GameObj } from "@/types"

export function take_enemy_to_hand(
  card: Card,
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  // если лидера врага - ничего не делаем вообще
  if (!enemy.color) return

  const { hand } = gameObj
  if (hand.length >= store.getters["handSize"]) return

  const enemyAsCard = enemy_as_card(enemy, card.data?.value ?? 1)
  hand.push(enemyAsCard)

  enemy.deathwish = null
  enemy_takes_damage(
    enemy,
    { data: { damage: enemy.data.hp } },
    gameObj,
    timeout * 0.5
  )
}
