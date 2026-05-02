import { copyObj } from "@/lib/utils"
import store from "@/store"
import type { Enemy } from "@/types"

// в начале хода компа установит всем врагам, кто должен прыгать, false
export function set_already_jumped(field: (Enemy | "")[]): void {
  for (let i = 11; i >= 0; i--) {
    if (field[i] && (field[i] as Enemy).already_jumped) {
      ;(field[i] as Enemy).already_jumped = false
    }
  }
}

// создает токен врага и снимает у него пассивную способность
export function create_token(enemy: Enemy): Enemy {
  const token: Enemy = copyObj(enemy)
  token.passive_ability = null
  token.data.hp = 1
  token.data.base.base_hp = 1
  token.data.damage = 1
  return token
}

// создает токен врага и НЕ снимает у него пассивную способность
export function create_token_with_passive(enemy: Enemy): Enemy {
  const token: Enemy = copyObj(enemy)
  token.data.hp = 1
  token.data.base.base_hp = 1
  token.data.damage = 1
  return token
}

// достает из списка врагов убитого врага (для deathwish), снимает у того deathwish
export function get_default_enemy(enemy: Enemy): Enemy | null {
  const defaultEnemy: Enemy = copyObj(store.getters["all_enemies_db"][enemy.id])
  if (!defaultEnemy) return null
  defaultEnemy.deathwish = null
  return defaultEnemy
}
