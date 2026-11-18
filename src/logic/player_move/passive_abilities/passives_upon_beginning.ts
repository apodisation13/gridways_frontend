import { copyObj } from "@/lib/utils"
import { trackAchievementEvent } from "@/logic/achievements/trackAchievementEvent"
import { set_self_as_deck_len } from "@/logic/player_move/passive_abilities/passives_upon_beginning/set_self_as_deck_len"
import { AchievementEventType } from "@/types"
import { CardPassiveAbility, GameObj } from "@/types"

// эта функция срабатывает для всех карт (до первого дро), для которых пассивка
// должна сработать один раз в начале игры
export function passives_upon_beginning(gameObj: GameObj): void {
  const { deck } = gameObj
  const pool = deck.filter(card => card.data?.passive?.upon_beginning === true)
  if (pool.length === 0) return

  for (const card of pool) {
    const passive_ability = card.passive_ability.name
    if (passive_ability === CardPassiveAbility.SetSelfAsDeckLen) {
      const actor = copyObj(card)
      if (set_self_as_deck_len(card, deck)) {
        trackAchievementEvent({
          type: AchievementEventType.PassiveTriggered,
          actor,
          location: "passive_once",
        })
      }
    }
  }
}
