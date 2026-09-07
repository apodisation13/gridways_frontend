import { copyObj } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import type { Card, Enemy, GameObj } from "@/types"

export function if_in_grave_spawn_self_in_enemy_grave(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  const value = card.data?.passive?.value
  if (!value) return

  const { enemies_grave } = gameObj

  const self = copyObj(card)
  self.data.hp = value
  self.data.base.base_hp = value
  ;(self as any).move = {
    name: "down",
    description:
      "Каждый свой ход враг перемещается на одну клетку ниже, и если ему некуда ходить (он уже внизу, или под ним есть другой враг), он наносит лидеру игрока {damage} урона",
  }
  enemies_grave.push(self as unknown as Enemy)
  timeoutAnimationFlag(card, "trigger_grave_passive", null, timeout * 0.5)
  timeoutAnimationFlag(
    enemies_grave[0],
    "trigger_grave_passive",
    null,
    timeout * 0.5
  )
}
