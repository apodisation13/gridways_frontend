import store from "@/store"
import { CardColor } from "@/types"
import type { Enemy, EnemyLeader } from "@/types"

function getRandomLevelConst() {
  const stateInfo = store.state.game.random_level_enemies_count
  const easy = {
    Bronzes: stateInfo?.easy?.bronzes || [5, 6, 7],
    Silvers: stateInfo?.easy?.silvers || [2, 3],
    Golds: stateInfo?.easy?.golds || [1, 2],
    diff: "easy",
  }
  const normal = {
    Bronzes: stateInfo?.normal?.bronzes || [6, 7, 8, 9],
    Silvers: stateInfo?.normal?.silvers || [2, 3, 4],
    Golds: stateInfo?.normal?.golds || [2, 3, 4],
    diff: "normal",
  }
  const hard = {
    Bronzes: stateInfo?.hard?.bronzes || [9, 10, 11, 12, 13, 14],
    Silvers: stateInfo?.hard?.silvers || [3, 4, 5, 6],
    Golds: stateInfo?.hard?.golds || [3, 4, 5, 6],
    diff: "hard",
  }
  return [easy, easy, easy, normal, normal, normal, hard, hard]
}

function random_pick_enemies(dict: {
  Bronzes: number[]
  Silvers: number[]
  Golds: number[]
  diff: string
}): Enemy[] {
  let enemies: Enemy[] = []

  let random_bronzes =
    dict.Bronzes[Math.floor(Math.random() * dict.Bronzes.length)]
  let random_silvers =
    dict.Silvers[Math.floor(Math.random() * dict.Silvers.length)]
  let random_golds = dict.Golds[Math.floor(Math.random() * dict.Golds.length)]
  // console.log(random_bronzes, random_silvers, random_golds)

  const bronzes = store.getters["bronze_enemies"]
  const silvers = store.getters["silver_enemies"]
  const golds = store.getters["gold_enemies"]

  for (let i = 0; i < random_bronzes; i++) {
    let random = Math.floor(Math.random() * bronzes.length)
    enemies.push(bronzes[random])
  }
  for (let i = 0; i < random_silvers; i++) {
    let random = Math.floor(Math.random() * silvers.length)
    enemies.push(silvers[random])
  }
  for (let i = 0; i < random_golds; i++) {
    let random = Math.floor(Math.random() * golds.length)
    enemies.push(golds[random])
  }

  // console.log(enemies)
  return enemies
}

export function random_level_generator(): any[] {
  let random_levels: any[] = []
  const e_leaders: EnemyLeader[] = store.getters["all_enemy_leaders"]
  const diff = getRandomLevelConst()

  diff.forEach(d => {
    let e = random_pick_enemies(d)
    let enemy_leader = e_leaders[Math.floor(Math.random() * e_leaders.length)]

    random_levels.push({
      id: -1,
      level: {
        name: "random",
        difficulty: d.diff,
        starting_enemies_number: 3,
        enemies: e,
        enemy_leader: enemy_leader,
      },
    })
  })

  return random_levels
}

function calculateCounts(
  total: number,
  distribution: Record<string, number>
): Record<string, number> {
  const colors = Object.keys(distribution)

  const exact: Record<string, number> = {}
  const floors: Record<string, number> = {}

  for (const color of colors) {
    exact[color] = total * distribution[color]
    floors[color] = Math.floor(exact[color])
  }

  let currentSum = Object.values(floors).reduce((a, b) => a + b, 0)
  let remaining = total - currentSum

  const remainders = colors
    .map(color => ({ color, remainder: exact[color] - floors[color] }))
    .sort((a, b) => b.remainder - a.remainder)

  const result = { ...floors }
  for (let i = 0; i < remaining; i++) {
    result[remainders[i].color]++
  }

  return result
}

function getRandomItems(items: Enemy[], totalCount: number): Enemy[] {
  const distribution = { bronze: 0.45, silver: 0.35, gold: 0.2 }

  const counts = calculateCounts(totalCount, distribution)

  const byColor: Record<string, Enemy[]> = {
    bronze: items.filter(item => item.color === CardColor.Bronze),
    silver: items.filter(item => item.color === CardColor.Silver),
    gold: items.filter(item => item.color === CardColor.Gold),
  }

  const result: Enemy[] = []

  for (const [color, count] of Object.entries(counts)) {
    const colorItems = byColor[color]

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * colorItems.length)
      result.push({ ...colorItems[randomIndex] })
    }
  }
  console.log(result)
  return result
}

export function random_level_generator_by_number(total_number: number): any {
  const all_enemies: Enemy[] = store.getters["all_enemies"]
  const e_leaders: EnemyLeader[] = store.getters["all_enemy_leaders"]
  let enemy_leader = e_leaders[Math.floor(Math.random() * e_leaders.length)]
  const enemies = getRandomItems(all_enemies, total_number)
  let difficulty = "easy"
  if (enemies.length > 12) difficulty = "normal"
  if (enemies.length > 25) difficulty = "hard"
  return {
    id: -1,
    level: {
      name: "random_n",
      difficulty: difficulty,
      starting_enemies_number: 3,
      enemies: enemies,
      enemy_leader: enemy_leader,
    },
  }
}
