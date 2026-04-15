import { copyObj } from "@/lib/utils"

export function spawn_tokens_at_enemy_deck(card, enemy, gameObj) {
  if (!enemy.color) return // лидера врагов нельзя так насоздавать

  const { enemies } = gameObj

  // создали токена врага, у него прописали его deathwish из абилки карты
  const token = copyObj(enemy)
  token.data.hp = 1
  token.data.base.base_hp = 1
  token.data.damage = 1
  token.data.deathwish = { value: card.data.value }
  token.data.value = card.data.value
  token.deathwish = {
    name: "incr-dmg-to-hand-by-value",
    description: "Увеличьте всем картам в РУКЕ урон на {deathwish_value}",
  }

  // card.value раз положили этот токен врага в его колоду
  for (let i = 0; i < card.data.value; i++) {
    enemies.push(copyObj(token))
  }
}
