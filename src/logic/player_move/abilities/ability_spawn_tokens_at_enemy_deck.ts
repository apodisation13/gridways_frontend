import { copyObj } from "@/lib/utils"
import type { Card, Enemy, EnemyLeader, GameObj } from "@/types"

export function spawn_tokens_at_enemy_deck(
  card: Card,
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj
): void {
  if (!(enemy as Enemy).color) return // лидера врагов нельзя так насоздавать

  const { enemies } = gameObj

  // создали токена врага, у него прописали его deathwish из абилки карты
  const token = copyObj(enemy as Enemy)
  token.data.hp = 1
  token.data.base.base_hp = 1
  token.data.damage = 1
  token.data.deathwish = { value: card.data.value } // это на сколько урон в руке потом увеличить
  token.data.value = card.data.value
  token.deathwish = {
    name: "incr-dmg-to-hand-by-value",
    description: "Увеличьте всем картам в РУКЕ урон на {deathwish_value}",
  }

  // card.data.tokens_number раз положили этот токен врага в его колоду
  for (let i = 0; i < card.data.tokens_number; i++) {
    enemies.push(copyObj(token))
  }
}
