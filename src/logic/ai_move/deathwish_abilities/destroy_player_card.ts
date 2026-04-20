import { sound_deathwish } from "@/logic/play_sounds"
import { choice_pop } from "@/lib/utils"
import type { GameObj } from "@/types"

// уничтожает случайную карту игрока из его колоды
export function destroy_player_card_in_deck(gameObj: GameObj): void {
  sound_deathwish()

  const { deck } = gameObj
  if (!deck.length) return

  choice_pop(deck)
}
