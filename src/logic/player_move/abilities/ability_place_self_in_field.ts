import { copyObj } from "@/lib/utils"
import type { Card, Enemy, GameObj } from "@/types"

export function place_self_in_field(
  card: Card,
  enemy: Enemy,
  gameObj: GameObj
): void {
  if (!enemy.color) return // это для лидера врага, туда нельзя поставить себя
  const { enemies_grave, field } = gameObj
  card.data.hp = card.data.damage
  card.data.base.base_hp = card.data.damage
  ;(card as any).move = enemy.move
  field[field.indexOf(enemy)] = copyObj(card) as unknown as Enemy
  enemy.data.hp = enemy.data.base.base_hp
  enemies_grave.push(enemy)
}
