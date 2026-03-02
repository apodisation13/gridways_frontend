import { randInt } from "@/lib/utils"
import store from "@/store"
import { CardColor } from "@/logic/models"

function getValue(cfg) {
  if (cfg.type === "simple") return cfg.value
  if (cfg.type === "diapason") return randInt(cfg.min, cfg.max)
}

export function getRandomReward(rewards_config) {
  // расчет награды за открытый ключ
  const entries = Object.entries(rewards_config)
  const totalWeight = entries.reduce((sum, [, cfg]) => sum + cfg.probability, 0)

  let rand = Math.random() * totalWeight
  for (const [resource, cfg] of entries) {
    rand -= cfg.probability
    if (rand <= 0) {
      return { resource, value: getValue(cfg) }
    }
  }

  // fallback на последний элемент (на случай float погрешности)
  const [resource, cfg] = entries[entries.length - 1]
  return { resource, value: getValue(cfg) }
}

function getRewardsForEnemiesGrave(rewards) {
  const enemies_grave = store.getters["enemies_grave"]

  const bronze_enemies = enemies_grave.filter(
    e => e.color === CardColor.Bronze && !e.token
  )
  const silver_enemies = enemies_grave.filter(
    e => e.color === CardColor.Silver && !e.token
  )
  const gold_enemies = enemies_grave.filter(
    e => e.color === CardColor.Gold && !e.token
  )

  if (bronze_enemies.length > 0) rewards["raw_bronze"] = bronze_enemies.length
  if (silver_enemies.length > 0) rewards["raw_silver"] = silver_enemies.length
  if (gold_enemies.length > 0) rewards["raw_gold"] = gold_enemies.length

  return rewards
}

export function getRewardForLevel(rewards_config) {
  // награда за прохождение уровня, с учетом конфига и убитых врагов
  let result = {}

  for (const [resource, cfg] of Object.entries(rewards_config)) {
    // если probability не указано — выпадает всегда
    if (cfg.probability !== undefined) {
      const roll = Math.random() * 100
      if (roll > cfg.probability) continue // не повезло, пропускаем
    }

    result[resource] = getValue(cfg)
    console.log(result)
  }

  // добавляем туда награду за убитых врагов
  result = getRewardsForEnemiesGrave(result)
  return result
}
