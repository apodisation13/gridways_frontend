import { choice_pop } from "@/lib/utils"
import { trackAchievementEvent } from "@/logic/achievements/trackAchievementEvent"
import type { GameObj } from "@/types"
import { AchievementEventType } from "@/types"

export function destroy_random_enemy_in_deck(gameObj: GameObj): void {
  const { enemies } = gameObj
  const enemy = choice_pop(enemies)
  if (enemy)
    trackAchievementEvent({ type: AchievementEventType.EnemyKilled, enemy })
}
