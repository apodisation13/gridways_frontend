import { copyObj } from "@/lib/utils"

export function spawn_tokens_at_enemy_deck(card, enemy, gameObj) {
  if (!enemy.color) return // лидера врагов нельзя так насоздавать

  const { enemies } = gameObj

  // создали токена врага, у него прописали его deathwish из абилки карты
  const token = copyObj(enemy)
  token.data.hp = 1
  token.data.base.base_hp = 1
  token.data.damage = 1
  token.data.deathwish.value = card.data.value // в value положили скольким врагам мы прибавим на 1 урон
  token.deathwish = {
    name: "incr-dmg-to-value-cards-by-1",
    description: "Увеличьте {value} случайным картам в РУКЕ урон на 1",
  }

  // card.value раз положили этот токен врага в его колоду
  for (let i = 0; i < card.data.value; i++) {
    enemies.push(copyObj(token))
  }
}
