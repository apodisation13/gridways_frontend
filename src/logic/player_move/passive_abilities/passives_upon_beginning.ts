import { set_self_as_deck_len } from "@/logic/player_move/passive_abilities/passives_upon_beginning/set_self_as_deck_len"
import { GameObj } from "@/types"

// эта функция срабатывает для всех карт (до первого дро), для которых пассивка
// должна сработать один раз в начале игры
export function passives_upon_beginning(gameObj: GameObj): void {
  const { deck } = gameObj
  const pool = deck.filter(card => card.data?.passive?.upon_beginning === true)
  console.log(9, pool)
  if (pool.length === 0) return

  for (const card of pool) {
    const passive_ability = card.passive_ability.name
    if (passive_ability === "set-self-as-deck-len") {
      console.log(passive_ability)
      set_self_as_deck_len(card, deck)
    }
  }
}
