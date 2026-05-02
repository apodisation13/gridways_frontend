import { choice } from "@/lib/utils"
import { sound_spread_damage } from "@/logic/play_sounds"
import { hit_one_enemy } from "@/logic/player_move/abilities/hit_one_enemy"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import type { Card, GameObj } from "@/types"

export function spread_damage(
  card: Card | { data: { damage: number } },
  gameObj: GameObj,
  timeout = 1000
): void {
  const { field, enemy_leader } = gameObj

  let enemy_list = get_all_enemies(field, enemy_leader) // собрать всех врагов в один список

  let j = 0
  let id = setInterval(() => {
    if (j === card.data.damage || enemy_list.length === 0) {
      // до урона карты или пока врагов не осталось
      clearInterval(id)
      return
    }

    j++
    let random_enemy = choice(enemy_list)
    console.log(`попали во врага ${enemy_list[random_enemy].id}`)

    let temp = enemy_list[random_enemy].data.hp
    hit_one_enemy(
      enemy_list[random_enemy],
      { data: { damage: 1 } },
      gameObj,
      timeout * 0.2
    )

    // убрали врага из списка врагов
    if (temp - 1 === 0) {
      // если убили лидера вдруг, то у него просто 0 и всё
      enemy_list.splice(random_enemy, 1)
    }

    sound_spread_damage()
  }, timeout * 0.4)
}
