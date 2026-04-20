import { get_random_enemy } from "@/logic/player_move/service/service_for_player_move"
import {
  poison_all_enemies,
  poison_one_enemy,
} from "@/logic/player_move/abilities/ability_poison"
import type { Card, GameObj } from "@/types"

export function poison_random_enemy_passive(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { field, enemy_leader } = gameObj
  let target = get_random_enemy(field, enemy_leader) // взяли всех врагов, из них взяли одного

  if (!target) return // если щас нет врагов на поле и нет живого лидера врагов, выходим

  card.passive_poisoning = true
  setTimeout(() => {
    card.passive_poisoning = null
  }, timeout * 0.5)
  poison_one_enemy(target, gameObj, timeout)
}

export function poison_all_enemies_passive(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  card.passive_poisoning = true
  setTimeout(() => {
    card.passive_poisoning = null
  }, timeout * 0.5)
  poison_all_enemies(gameObj, timeout)
}
