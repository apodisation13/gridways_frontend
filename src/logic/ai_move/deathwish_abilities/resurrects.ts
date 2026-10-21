import { choice_element, copyObj } from "@/lib/utils"
import { enemySpawnsAtEmptyCell } from "@/logic/ai_move/effects_interaction"
import { sound_appear_new_enemy } from "@/logic/play_sounds"
import { get_empty_field_indexes } from "@/logic/player_move/service/service_for_player_move"
import { GameObj } from "@/types"

// воскрешает случайного бронзового врага из сброса и ставит его на рандомную клетку
export function resurrect_random_enemy(
  gameObj: GameObj,
  timeout: number = 1000
): void {
  const { field, enemies_grave } = gameObj

  if (enemies_grave.length === 0) return

  const emptyFieldIndexes = get_empty_field_indexes(field)
  if (emptyFieldIndexes.length === 0) return

  const randomIndex = choice_element(emptyFieldIndexes)
  if (!randomIndex) return

  const randomEnemyFromGrave = choice_element(enemies_grave)
  enemies_grave.splice(enemies_grave.indexOf(randomEnemyFromGrave), 1)
  randomEnemyFromGrave.deathwish = null

  enemySpawnsAtEmptyCell(
    copyObj(randomEnemyFromGrave),
    randomIndex,
    gameObj,
    timeout
  )
  sound_appear_new_enemy()
}
