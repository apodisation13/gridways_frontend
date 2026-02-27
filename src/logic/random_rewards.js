import { choice, randInt } from "@/lib/utils"

function getValue(cfg) {
  if (cfg.type === "simple") return cfg.value
  if (cfg.type === "diapason") return randInt(cfg.min, cfg.max)
}

export function getRandomReward(rewards_config) {
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

export function getRewardForLevel(win_price) {
  let pay_data = {}

  pay_data.wood = randInt(win_price - 25, win_price + 25)
  pay_data.scraps = randInt(win_price - 25, win_price + 25)

  let kegs = [0, 0, 0, 1] // 25%!!!
  let chance = kegs[choice(kegs)]
  pay_data.kegs = chance === 1 ? 1 : 0

  let big_kegs = [0, 0, 0, 0, 0, 0, 0, 1] // 18%!!!
  let chance2 = big_kegs[choice(big_kegs)]
  if (chance2 === 1) pay_data.big_kegs = 1
  else pay_data.big_kegs = 0

  pay_data.keys = 1

  return pay_data
}
