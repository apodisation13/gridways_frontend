import { choice_pop } from "@/lib/utils"
import type { GameObj } from "@/types"

export function destroy_random_enemy_in_deck(gameObj: GameObj): void {
  const { enemies } = gameObj
  choice_pop(enemies)
}
