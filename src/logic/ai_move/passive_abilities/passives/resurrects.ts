import { choice_element, copyObj } from "@/lib/utils"
import { enemySpawnsAtEmptyCell } from "@/logic/ai_move/effects_interaction"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_appear_new_enemy } from "@/logic/play_sounds"
import { get_empty_field_indexes } from "@/logic/player_move/service/service_for_player_move"
import { CardColor, GameObj } from "@/types"

// воскрешает случайного бронзового врага из сброса и ставит его на рандомную клетку
export function resurrect_random_bronze(
  gameObj: GameObj,
  timeout: number = 1000
): void {
  const { field, enemies_grave, enemy_leader } = gameObj

  const bronzeEnemies = enemies_grave.filter(e => e.color === CardColor.Bronze)
  if (bronzeEnemies.length === 0) return

  const emptyFieldIndexes = get_empty_field_indexes(field)
  if (emptyFieldIndexes.length === 0) return

  const randomIndex = choice_element(emptyFieldIndexes)
  if (!randomIndex) return

  const randomBronzeEnemyFromGrave = choice_element(bronzeEnemies)
  enemies_grave.splice(enemies_grave.indexOf(randomBronzeEnemyFromGrave), 1)
  randomBronzeEnemyFromGrave.deathwish = null

  enemySpawnsAtEmptyCell(
    copyObj(randomBronzeEnemyFromGrave),
    randomIndex,
    gameObj,
    timeout
  )
  sound_appear_new_enemy()
  timeoutAnimationFlag(enemy_leader, "spawning", null, timeout * 0.5)
}
