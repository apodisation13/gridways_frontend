import { choice_element, copyObj } from "@/lib/utils"
import { check_lose } from "@/logic/ai_move/service/check_lose"
import store from "@/store"
import { Enemy, EnemyLeaderAbilityEnum, GameObj } from "@/types"

// эта функция срабатывает для лидера врагов только в начале игры 1 раз
export function enemy_leader_ai_move_once(gameObj: GameObj): void {
  const { enemy_leader, deck, enemies } = gameObj
  const ela = enemy_leader.ability?.name

  if (!ela) return // есть лидеры у кого абилки нет

  const value = enemy_leader.data?.value || 0
  if (ela === EnemyLeaderAbilityEnum.DamageOnce) {
    store.commit("change_health", -value)
    check_lose()
  } else if (ela === EnemyLeaderAbilityEnum.DecreaseAllPlayerDamage) {
    deck.forEach(card => {
      card.data.damage -= value
      if (card.data.damage < 0) card.data.damage = 0
    })
  } else if (ela === EnemyLeaderAbilityEnum.HealOnce) {
    enemies.forEach(enemy => {
      enemy.data.hp += value
    })
  } else if (ela === EnemyLeaderAbilityEnum.IncrDmgOnce) {
    enemies.forEach(enemy => {
      enemy.data.damage += value
    })
  } else if (ela === EnemyLeaderAbilityEnum.AddArmorOnce) {
    enemies.forEach(enemy => {
      if (
        !enemy.data.shield &&
        !enemy.data.status &&
        !enemy.passive_ability?.name &&
        !enemy.deathwish?.name
      ) {
        if (enemy.data.armor) {
          enemy.data.armor += value
        } else enemy.data.armor = value
      }
    })
  } else if (ela === EnemyLeaderAbilityEnum.AddShieldsOnce) {
    for (let i = 0; i < value; i++) {
      const pool = enemies.filter(e => !e.data.shield)
      if (pool) {
        const randomEnemyWithoutShield: Enemy = choice_element(pool)
        randomEnemyWithoutShield.data.shield = true
      }
    }
  } else if (ela === EnemyLeaderAbilityEnum.AddEnemiesToDeckOnce) {
    const allEnemies: Enemy[] = store.getters["all_enemies"]
    const pool = allEnemies.filter(e => e.faction === enemy_leader.faction)
    for (let i = 0; i < value; i++) {
      enemies.push(copyObj(choice_element(pool)))
    }
  }
}
