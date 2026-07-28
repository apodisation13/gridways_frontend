import { damage_whenever_lock } from "@/logic/player_move/passive_abilities/passives_upon_playing_a_card/damage_whenever_lock"
import {
  type Card,
  type Enemy,
  type EnemyLeader,
  GameObj,
  type Leader,
} from "@/types"

// player_card - та карта, которую мы играем
// enemy - тот враг, в которого мы бьем
export function passives_upon_playing_a_card(
  player_card: Card | Leader,
  enemy_before: Enemy | EnemyLeader,
  enemy_after: Enemy | EnemyLeader,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { hand, deck, grave } = gameObj

  let pool = hand.filter(
    c =>
      c.data?.passive?.upon_playing_a_card === true &&
      c.data?.passive?.has_passive_in_hand
  )
  pool = pool.concat(
    deck.filter(
      c =>
        c.data?.passive?.upon_playing_a_card === true &&
        c.data?.passive?.has_passive_in_deck
    )
  )
  pool = pool.concat(
    grave.filter(
      c =>
        c.data?.passive?.upon_playing_a_card === true &&
        c.data?.passive?.has_passive_in_grave
    )
  )

  if (pool.length === 0) return

  for (const card of pool) {
    const passive_ability = card.passive_ability.name
    if (passive_ability === "damage-whenever-lock") {
      damage_whenever_lock(
        card as Card,
        enemy_before,
        enemy_after,
        gameObj,
        timeout
      )
    }
  }
}
