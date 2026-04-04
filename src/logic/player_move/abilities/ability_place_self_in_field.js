import { copyObj } from "@/lib/utils"

export function place_self_in_field(card, enemy, gameObj) {
  if (!enemy.color) return // это для лидера врага, туда нельзя поставить себя
  const { enemies_grave, field } = gameObj
  card.data.hp = card.data.damage
  card.data.base.base_hp = card.data.damage
  card.move = enemy.move
  field[field.indexOf(enemy)] = copyObj(card)
  enemy.data.hp = enemy.data.base.base_hp
  enemies_grave.push(enemy)
}
