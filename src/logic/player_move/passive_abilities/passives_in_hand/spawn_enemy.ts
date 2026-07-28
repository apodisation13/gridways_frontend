import { choice_element } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { enemy_as_card } from "@/logic/player_move/service/service_for_player_move"
import store from "@/store"
import { Card, Enemy, GameObj } from "@/types"

export function spawn_random_enemy_in_hand(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { hand, enemy_leader } = gameObj
  if (hand.length >= store.getters["handSize"]) return

  const random_enemy = choice_element(
    (store.getters.all_enemies as Enemy[]).filter(
      e => e.faction === enemy_leader.faction
    )
  )
  hand.push(enemy_as_card(random_enemy, card.data?.value ?? 1))
  timeoutAnimationFlag(card, "spawning", null, timeout * 0.5)
}

export function spawn_random_enemy_in_deck(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { deck, enemy_leader } = gameObj
  const random_enemy = choice_element(
    (store.getters.all_enemies as Enemy[]).filter(
      e => e.faction === enemy_leader.faction
    )
  )
  deck.push(enemy_as_card(random_enemy, card.data?.value ?? 1))
  timeoutAnimationFlag(card, "spawning", null, timeout * 0.5)
}
